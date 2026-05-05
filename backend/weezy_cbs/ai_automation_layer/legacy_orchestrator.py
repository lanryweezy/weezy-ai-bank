import logging
import os
import google.generativeai as genai
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)

class LegacyWorkflowOrchestrator:
    """
    The 'Trojan Horse' Orchestrator.
    Consumes data from legacy cores (Finacle, Flexcube) and 
    autonomously triggers intelligent banking workflows.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def run_orchestration_cycle(self, db: Session, legacy_batch_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes a raw dump of data from a legacy bank and uses AI to 
        identify and execute 'Human-Side' or 'Compliance' workflows.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        # 1. Ask Gemini to identify high-impact actions from legacy data
        prompt = f"""
        You are 'Weezy Brain', the Digital Nervous System for a Tier-1 Nigerian bank.
        We have just extracted this data from their legacy Finacle/Flexcube system.
        
        LEGACY DATA DUMP:
        {json.dumps(legacy_batch_data)}
        
        TASK:
        1. Identify birthdays today and generate a hyper-personalized, non-generic message.
        2. Identify dormant accounts with sudden large inflows (Potential AML risk).
        3. Identify customers who just paid a high 'Account Maintenance Fee' and generate an apology + saving tip.
        4. Identify businesses whose 'Rent' is due in 3 days based on history and offer a liquidity bridge.
        
        Format as JSON array of actions:
        [
            {{ "customer_id": "string", "workflow": "BIRTHDAY|AML|FEE_RECOVERY|RENT_BRIDGE", "action_payload": {{...}}, "urgency": "HIGH|MEDIUM|LOW" }}
        ]
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            actions = json.loads(clean_json)
            
            executed_count = 0
            for action in actions:
                # 2. Execute the Workflows
                await self._execute_workflow(db, action)
                executed_count += 1
                
            return {
                "status": "ORCHESTRATION_COMPLETE",
                "legacy_records_processed": len(legacy_batch_data),
                "intelligent_actions_triggered": executed_count,
                "actions": actions
            }
            
        except Exception as e:
            logger.error(f"Orchestrator Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

    async def _execute_workflow(self, db: Session, action: Dict[str, Any]):
        """
        Dispatches the action to the relevant Weezy AI module (Messaging, Risk, or Loans).
        """
        workflow = action.get("workflow")
        payload = action.get("action_payload", {})
        
        from weezy_cbs.messaging_notifications.services import notification_engine
        
        if workflow == "BIRTHDAY":
            # Send Personalized Message
            logger.info(f"ORCHESTRATOR: Sending birthday wish to {action['customer_id']}")
            # await notification_engine.send_sms(db, action['customer_id'], payload.get("message"))
            
        elif workflow == "AML":
            # Flag for Compliance Agent
            logger.warning(f"ORCHESTRATOR: AML Alert triggered for {action['customer_id']}: {payload.get('reason')}")
            # log_suspicious_activity(...)
            
        elif workflow == "FEE_RECOVERY":
            # Proactive Support Gesture
            logger.info(f"ORCHESTRATOR: Initiating fee apology for {action['customer_id']}")
            
        elif workflow == "RENT_BRIDGE":
            # Offer Intraday Loan
            logger.info(f"ORCHESTRATOR: Offering rent liquidity bridge to business {action['customer_id']}")

legacy_orchestrator = LegacyWorkflowOrchestrator()
