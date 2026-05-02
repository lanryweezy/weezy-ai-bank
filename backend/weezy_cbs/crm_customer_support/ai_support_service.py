import os
import logging
import google.generativeai as genai
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from weezy_cbs.customer_identity_management.models import Customer
from weezy_cbs.accounts_ledger_management.services import get_accounts_for_customer
from weezy_cbs.transaction_management.services import get_transactions_for_account

logger = logging.getLogger(__name__)

class AICustomerSupportService:
    """
    AI-Powered Customer Support Service for Nigerian Banking.
    Uses Gemini to provide personalized support based on real bank data.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def get_chat_response(self, db: Session, customer_id: int, message: str) -> str:
        if not self.model:
            return "I'm sorry, my AI brain is currently offline. Please contact a human agent."

        # 1. Gather Context for the AI
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return "I'm sorry, I couldn't find your customer profile. Please log in again."

        accounts = get_accounts_for_customer(db, customer_id)
        account_summary = ""
        for acc in accounts:
            txns = get_transactions_for_account(db, acc.account_number, limit=3)
            txn_summary = "\n".join([f"- {t.narration}: ₦{t.amount:,.2f} ({t.status})" for t in txns])
            account_summary += f"\nAccount {acc.account_number} ({acc.account_type.value}):\nBalance: ₦{acc.available_balance:,.2f}\nRecent Activity:\n{txn_summary}\n"

        # 2. Construct Nigerian-Localized Prompt
        prompt = f"""
        You are 'Weezy', the AI Support Assistant for Weezy AI Bank, Nigeria.
        You are helpful, professional, and use a friendly Nigerian tone.
        
        CUSTOMER CONTEXT:
        - Name: {customer.first_name} {customer.last_name}
        - Tier: {customer.account_tier.value if hasattr(customer.account_tier, 'value') else customer.account_tier}
        - Accounts & Activity: {account_summary}
        
        NIGERIAN MARKET RULES:
        - All currency is in Naira (₦).
        - Standard transfer taxes: ₦50 Stamp Duty on transfers above ₦10k.
        - CBN Tier 1 limits apply if not fully verified.
        
        User Query: {message}
        
        Guidelines:
        1. If they ask for balance, tell them clearly for each account.
        2. If they ask about a transaction, look at their recent activity.
        3. Keep it brief and professional.
        4. If you can't help with a specific request (like changing a BVN), tell them a human agent will follow up.
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini Chat Error: {str(e)}")
            return "I'm having trouble processing that right now. How else can I help?"

ai_support_service = AICustomerSupportService()
