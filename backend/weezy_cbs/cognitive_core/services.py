import os
import json
import logging
import uuid
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.mcp_gateway.tools import banking_tools # Reusing our standardized MCP tools

logger = logging.getLogger(__name__)

class CognitiveOrchestrator:
    """
    The True 'Brain' of Weezy AI Bank.
    Uses Gemini Function Calling to map natural language intents to core banking services.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            
            # 1. Define the Banking Tools available to the Core
            self.tools = [
                banking_tools.get_account_balance,
                banking_tools.perform_transfer,
                banking_tools.verify_beneficiary,
                banking_tools.analyze_customer_risk,
                banking_tools.list_recent_transactions,
                banking_tools.predictive_cash_flow_forecast,
                banking_tools.autonomous_support_resolution,
                banking_tools.generate_mermaid_architecture,
            ]
            
            # 2. Initialize the model with these capabilities
            self.model = genai.GenerativeModel(
                model_name='gemini-1.5-pro',
                tools=self.tools
            )
        else:
            self.model = None

    def _get_or_create_session(self, db: Session, session_id: Optional[str], customer_id: int) -> models.CognitiveSession:
        if session_id:
            session = db.query(models.CognitiveSession).filter(models.CognitiveSession.session_id == session_id).first()
            if session: return session
            
        sid = f"COG-{uuid.uuid4().hex[:12].upper()}"
        
        # Build initial context
        from weezy_cbs.accounts_ledger_management.services import get_accounts_by_customer_id
        from weezy_cbs.customer_identity_management.models import Customer
        
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        accounts = get_accounts_by_customer_id(db, customer_id)
        
        context = {
            "customer_id": customer_id,
            "customer_name": f"{customer.first_name} {customer.last_name}" if customer else "User",
            "tier": str(customer.account_tier) if customer else "Unknown",
            "accounts": [{"nuban": a.account_number, "currency": a.currency.value, "type": a.account_type.value} for a in accounts]
        }
        
        session = models.CognitiveSession(
            customer_id=customer_id,
            session_id=sid,
            context_data=context
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    async def process_intent(self, db: Session, request: schemas.CognitiveChatRequest, customer_id: int) -> schemas.CognitiveChatResponse:
        """
        Takes a natural language request, determines the intent, executes tools if needed, and replies.
        """
        if not self.model:
            raise Exception("Cognitive Core is offline (API Key missing).")

        session = self._get_or_create_session(db, request.session_id, customer_id)
        
        # Start a chat session
        chat = self.model.start_chat(
            history=request.history, 
            enable_automatic_function_calling=True # VITAL: Let Gemini call Python functions directly
        )

        prompt = f"""
        You are 'Weezy Prime', the Cognitive Core of a Nigerian Bank.
        You can execute actual banking transactions and operations using the tools provided.
        
        CURRENT CUSTOMER CONTEXT:
        {json.dumps(session.context_data)}
        
        GOVERNANCE RULES:
        1. Always perform a 'verify_beneficiary' before doing a 'perform_transfer' for inter-bank.
        2. If a transfer is > ₦1,000,000, tell the user it requires 'Dual Authorization' (Maker-Checker).
        3. For 'predictive_cash_flow_forecast', use the primary NUBAN provided in the context.
        4. For 'autonomous_support_resolution', first assess the user's sentiment. 
           - If they are angry or using caps, sentiment is 'AGGRESSIVE'.
           - Otherwise 'NEUTRAL'.
           - Use 'UNBLOCK_ACCOUNT' only if they express a valid need and sentiment is not 'AGGRESSIVE'.
        5. For 'generate_mermaid_architecture', use it when asked to visualize or show the system structure.
        6. If you execute a critical action, output [ACTION EXECUTED: name] in your final reply.
        7. Provide a brief 'Thought Log' at the start of your response formatted as [THOUGHT: step1, step2...].
        
        User Request: {request.message}
        """

        try:
            # 1. Send to Gemini
            response = await chat.send_message_async(prompt)
            final_reply = response.text
            
            # Extract Thought Log for better UI feedback
            thought_log = "Analyzing request..."
            if "[THOUGHT:" in final_reply:
                parts = final_reply.split("[THOUGHT:")
                thought_log = parts[1].split("]")[0].strip()
                final_reply = parts[0] + (parts[1].split("]")[1] if "]" in parts[1] else "")
            
            # 2. Determine Intent (Heuristic for logging)
            intent = models.CognitiveIntentEnum.UNKNOWN
            lower_msg = request.message.lower()
            if "transfer" in lower_msg or "send money" in lower_msg:
                intent = models.CognitiveIntentEnum.TRANSFER
            elif "forecast" in lower_msg or "prediction" in lower_msg or "how much will i have" in lower_msg:
                intent = models.CognitiveIntentEnum.PREDICTIVE_FORECAST
            elif "unblock" in lower_msg or "blocked" in lower_msg:
                intent = models.CognitiveIntentEnum.ACCOUNT_RESOLUTION
            elif "architecture" in lower_msg or "diagram" in lower_msg or "schema" in lower_msg:
                intent = models.CognitiveIntentEnum.ARCHITECTURE_VISUALIZATION
            elif "balance" in lower_msg or "how much" in lower_msg:
                intent = models.CognitiveIntentEnum.CUSTOMER_SUPPORT
                
            executed_actions = []
            if "[ACTION EXECUTED:" in final_reply:
                # Extract the action name
                action_name = final_reply.split("[ACTION EXECUTED:")[1].split("]")[0].strip()
                executed_actions.append(action_name)
                final_reply = final_reply.replace(f"[ACTION EXECUTED: {action_name}]", "").replace(f"[ACTION EXECUTED:{action_name}]", "").strip()

            # 3. Log the Interaction
            action_log = models.CognitiveActionLog(
                session_id=session.session_id,
                user_prompt=request.message,
                detected_intent=intent,
                system_response=final_reply,
                executed_tools=[{"tool": a} for a in executed_actions] if executed_actions else None
            )
            db.add(action_log)
            db.commit()

            return schemas.CognitiveChatResponse(
                session_id=session.session_id,
                reply=final_reply,
                detected_intent=intent,
                executed_actions=executed_actions,
                timestamp=datetime.utcnow()
            )

        except Exception as e:
            logger.error(f"Cognitive Core Error: {str(e)}")
            raise e


cognitive_orchestrator = CognitiveOrchestrator()
