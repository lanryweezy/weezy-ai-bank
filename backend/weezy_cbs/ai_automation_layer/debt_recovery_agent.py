import logging
import os
import google.generativeai as genai
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)

class DebtRecoveryAgent:
    """
    Automated Debt Recovery Bot.
    A polite but persistent AI that 'negotiates' repayment plans 
    with delinquent borrowers via simulated WhatsApp/SMS interactions.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def generate_recovery_strategy(self, db: Session, loan_account_id: int) -> Dict[str, Any]:
        """
        Analyzes a delinquent loan and generates a personalized recovery message 
        and a proposed restructuring plan.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        from weezy_cbs.loan_management_module.models import LoanAccount
        from weezy_cbs.customer_identity_management.models import Customer
        from weezy_cbs.transaction_management.services import get_transaction_count_for_account
        
        loan = db.query(LoanAccount).filter(LoanAccount.id == loan_account_id).first()
        if not loan: return {"status": "ERROR", "reason": "LOAN_NOT_FOUND"}
        
        customer = db.query(Customer).filter(Customer.id == loan.customer_id).first()
        
        # Gather contextual data to personalize the negotiation
        total_owed = loan.principal_outstanding + loan.interest_outstanding + loan.penalties_outstanding
        days_past_due = (datetime.utcnow().date() - loan.next_repayment_date.date()).days if loan.next_repayment_date else 0
        
        # Check if they are trying (recent inflows)
        tx_count = get_transaction_count_for_account(db, loan.loan_account_number)
        
        prompt = f"""
        You are 'Weezy Recovery', a highly empathetic but firm Debt Recovery Negotiator in Nigeria.
        Your goal is to recover a delinquent loan without losing the customer.
        
        CUSTOMER DATA:
        - Name: {customer.first_name}
        - Total Owed: ₦{total_owed:,.2f}
        - Days Past Due (DPD): {days_past_due}
        - Activity Level: {tx_count} recent transactions
        
        TASK:
        1. Write a polite WhatsApp message offering a 'Restructuring Plan' rather than demanding immediate full payment.
        2. Propose a specific, extended repayment tenure based on the DPD (e.g., if DPD > 60, offer to split into 3 smaller monthly payments).
        
        Format output as JSON:
        {{
            "whatsapp_message": "string",
            "proposed_restructure_months": int,
            "tone_used": "EMPATHETIC" | "FIRM" | "URGENT"
        }}
        """
        
        try:
            import json
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            strategy = json.loads(clean_json)
            
            logger.info(f"RECOVERY: Generated {strategy['tone_used']} strategy for Loan {loan.loan_account_number}")
            
            # Conceptually: Send the message via Twilio/WhatsApp integration
            # whatsapp_service.send_message(customer.phone, strategy['whatsapp_message'])
            
            return {
                "status": "STRATEGY_GENERATED",
                "loan_number": loan.loan_account_number,
                "strategy": strategy
            }
            
        except Exception as e:
            logger.error(f"Debt Recovery Agent Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

debt_recovery_agent = DebtRecoveryAgent()
