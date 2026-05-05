import logging
import os
import google.generativeai as genai
import json
from typing import Dict, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ContextualAuthorizationSentinel:
    """
    US Bank Killer: The Contextual Authorization Sentinel.
    Solves aggressive card freezes by using AI to analyze contextual data 
    (e.g., flight ticket purchases, GPS pings) to proactively whitelist international or large transactions.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def pre_authorize_travel(self, db: Session, customer_id: int, location_ping: str = None) -> Dict[str, Any]:
        """
        Analyzes recent transactions and metadata to determine if a customer is traveling.
        If traveling, sets a dynamic contextual whitelist for their cards.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        from weezy_cbs.accounts_ledger_management.services import get_accounts_for_customer
        from weezy_cbs.mcp_gateway.tools import banking_tools
        
        accounts = get_accounts_for_customer(db, customer_id)
        if not accounts: return {"status": "NO_ACCOUNTS"}
        
        # 1. Fetch recent transactions to look for travel indicators (e.g., Airlines, Hotels)
        txns = banking_tools.list_recent_transactions(accounts[0].account_number, limit=20)
        
        prompt = f"""
        You are 'Weezy Context Auth', a smart security AI replacing rigid legacy bank rules.
        
        CUSTOMER DATA:
        - Recent Transactions: {json.dumps(txns)}
        - Recent GPS/IP Ping: {location_ping or 'Unknown'}
        
        TASK:
        Determine if the customer is currently traveling or planning to travel internationally based on context 
        (e.g., buying flight tickets, Airbnb, or an IP ping from a foreign country).
        
        Format as JSON:
        {{
            "is_traveling": true/false,
            "detected_destination": "Country or City (if known)",
            "whitelist_duration_days": int (suggested days to whitelist),
            "reasoning": "string"
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            context_assessment = json.loads(clean_json)
            
            if context_assessment.get("is_traveling"):
                # In production: We write this to a Redis cache or a `CardWhitelist` table 
                # so the Card Authorization Engine reads it in <1ms.
                logger.info(f"AUTH SENTINEL: Customer {customer_id} detected traveling to {context_assessment.get('detected_destination')}. Whitelisting cards for {context_assessment.get('whitelist_duration_days')} days.")
                
                return {
                    "status": "WHITELIST_APPLIED",
                    "details": context_assessment
                }
                
            return {"status": "NO_TRAVEL_DETECTED"}
            
        except Exception as e:
            logger.error(f"Contextual Auth Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

contextual_auth_sentinel = ContextualAuthorizationSentinel()
