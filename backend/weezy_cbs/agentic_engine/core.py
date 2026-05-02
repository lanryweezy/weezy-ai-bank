import os
import json
import logging
import google.generativeai as genai
from typing import List, Dict, Any
from . import schemas # Create this if needed
from weezy_cbs.mcp_gateway.tools import banking_tools

logger = logging.getLogger(__name__)

class WeezyAgenticCore:
    """
    Advanced Agentic Core for Weezy AI Bank.
    Uses Gemini with Tool Use (Function Calling) to execute autonomous banking workflows.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            self.model = None
            return
            
        genai.configure(api_key=api_key)
        
        # Define tools for Gemini
        # (Using a simplified wrapper for our existing tools)
        self.tools = [
            banking_tools.get_account_balance,
            banking_tools.perform_transfer,
            banking_tools.verify_beneficiary,
            banking_tools.analyze_customer_risk,
            banking_tools.list_recent_transactions
        ]
        
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-pro',
            tools=self.tools
        )

    async def chat(self, user_query: str, history: List[Dict] = []) -> Dict[str, Any]:
        """
        Main entry point for agentic chat.
        The agent will autonomously decide which tools to call.
        """
        if not self.model:
            return {"reply": "Agentic core is offline (API Key missing)."}

        # Start a chat session with tool usage enabled
        chat = self.model.start_chat(history=history, enable_automatic_function_calling=True)
        
        try:
            # Inject context
            system_instruction = """
            You are 'Weezy Prime', the autonomous agentic core of Weezy AI Bank, Nigeria.
            You have direct access to the bank's ledger and verification systems via tools.
            
            YOUR CAPABILITIES:
            1. Transfers: Use 'perform_transfer'. Verify beneficiary first if inter-bank.
            2. Balances: Use 'get_account_balance'.
            3. Risk: Use 'analyze_customer_risk'.
            
            RULES:
            - Always verify inter-bank accounts before transferring.
            - If a transaction is high risk, warn the user.
            - Use a professional yet friendly Nigerian tone.
            - If you perform an action, confirm the transaction ID to the user.
            """
            
            # (In a real app, we'd add this as a system prompt. For Gemini 1.5, 
            # we can prepend it to the query or use the system_instruction param in init)
            
            response = await chat.send_message_async(user_query)
            
            return {
                "reply": response.text,
                "history": history + [
                    {"role": "user", "parts": [user_query]},
                    {"role": "model", "parts": [response.text]}
                ]
            }
            
        except Exception as e:
            logger.error(f"Agentic Core Error: {str(e)}")
            return {"reply": f"I encountered an error during my thought process: {str(e)}"}

weezy_agentic_core = WeezyAgenticCore()
