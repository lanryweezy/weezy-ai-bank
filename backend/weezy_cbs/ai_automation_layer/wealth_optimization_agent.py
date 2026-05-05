import logging
import os
import google.generativeai as genai
import json
import decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)

class WealthOptimizationAgent:
    """
    Hyper-Personalized Wealth-as-a-Service Agent (Domain 2).
    Implements Dynamic Interest-on-Spend and Idle Fund Sweeping.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def optimize_customer_wealth(self, db: Session, customer_id: int) -> Dict[str, Any]:
        """
        Analyzes a customer's spending habits and automatically sweeps 'idle' 
        funds from a zero-interest current account to a high-yield Fixed Vault.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        from weezy_cbs.accounts_ledger_management.models import Account, AccountTypeEnum
        from weezy_cbs.mcp_gateway.tools import banking_tools
        from weezy_cbs.transaction_management.services import initiate_transaction
        from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
        
        # 1. Gather Customer Accounts
        accounts = db.query(Account).filter(Account.customer_id == customer_id).all()
        current_acc = next((a for a in accounts if a.account_type == AccountTypeEnum.CURRENT), None)
        savings_acc = next((a for a in accounts if a.account_type == AccountTypeEnum.SAVINGS), None)
        
        if not current_acc or not savings_acc:
            return {"status": "SKIPPED", "reason": "Requires both Current and Savings accounts."}
            
        current_bal = float(current_acc.available_balance)
        
        # 2. Get 30-Day Forecast to determine "Safe to Sweep" amount
        forecast = await banking_tools.predictive_cash_flow_forecast(current_acc.account_number)
        predicted_spend = forecast.get("identified_recurring_monthly", 0.0)
        
        # 3. Ask Gemini to decide the Sweep Strategy
        prompt = f"""
        You are 'Weezy Wealth', an AI wealth optimizer for a Nigerian customer.
        
        DATA:
        - Current Account Balance: ₦{current_bal:,.2f}
        - Predicted 30-Day Necessary Spend: ₦{predicted_spend:,.2f}
        
        RULES:
        1. The customer needs a 20% buffer above their predicted spend in their Current Account.
        2. Any amount above that buffer is considered "Idle" and losing value to inflation.
        3. Determine how much should be swept to the High-Yield Savings Account.
        
        Provide the Sweep Amount and a 1-sentence personalized reasoning to send the user via push notification.
        
        Format as JSON:
        {{
            "sweep_amount": float,
            "push_notification_message": "string"
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            strategy = json.loads(clean_json)
            
            sweep_amt = decimal.Decimal(str(strategy.get("sweep_amount", 0.0)))
            
            if sweep_amt > 0 and sweep_amt < current_acc.available_balance:
                logger.info(f"WEALTH: Sweeping {sweep_amt} NGN for Customer {customer_id} to Savings.")
                
                # Execute the Sweep Transfer
                txn_req = TransactionCreateRequest(
                    transaction_type="WEALTH_SWEEP",
                    channel="AI_AGENT",
                    amount=sweep_amt,
                    currency="NGN",
                    debit_account_number=current_acc.account_number,
                    credit_account_number=savings_acc.account_number,
                    narration="AI Wealth Optimization: Idle Fund Sweep"
                )
                await initiate_transaction(db, txn_req, initiated_by_customer_id=customer_id)
                
                # In production, trigger push notification via notification_service
                
                return {
                    "status": "OPTIMIZED",
                    "swept_amount": float(sweep_amt),
                    "message": strategy.get("push_notification_message")
                }
                
            return {"status": "NO_ACTION", "reason": "No idle funds detected."}
            
        except Exception as e:
            logger.error(f"Wealth Agent Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

wealth_optimization_agent = WealthOptimizationAgent()
