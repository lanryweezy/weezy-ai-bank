import os
import decimal
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.loan_management_module.models import LoanAccount, LoanApplicationStatusEnum
from weezy_cbs.customer_identity_management.models import Customer

logger = logging.getLogger(__name__)

class LoanRecoveryAIService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_model = None

    async def draft_recovery_message(self, db: Session, loan_id: int) -> str:
        """
        Uses Gemini to draft a personalized repayment reminder.
        Adjusts tone based on how many days the loan is overdue.
        """
        loan = db.query(LoanAccount).filter(LoanAccount.id == loan_id).first()
        customer = loan.customer
        
        days_overdue = (datetime.utcnow().date() - loan.disbursement_date).days # Simplified calculation
        
        prompt = f"""
        You are 'Weezy AI Collections Bot' for a Nigerian Bank.
        Draft a personalized SMS/WhatsApp message to a customer about their overdue loan.
        
        CUSTOMER DATA:
        - Name: {customer.first_name}
        - Loan Balance: ₦{loan.principal_outstanding:,.2f}
        - Days Overdue: {days_overdue}
        - Market: Nigeria
        
        TONE GUIDELINES:
        - 1-7 Days Overdue: Friendly reminder, professional, empathetic.
        - 8-30 Days Overdue: Firm but helpful, mention credit score impact (CRC/FirstCentral).
        - 30+ Days Overdue: Urgent, serious, mention CBN global standing instruction (GDI) recovery.
        
        Respond with ONLY the message text in a friendly Nigerian English style.
        """

        if not self.ai_model:
            return f"Dear {customer.first_name}, your loan of ₦{loan.principal_outstanding:,.2f} is overdue. Please repay to avoid penalties."

        try:
            response = await self.ai_model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"AI Recovery Drafting Error: {str(e)}")
            return "Friendly reminder to repay your outstanding Weezy Bank loan."

    def log_recovery_action(self, db: Session, loan_id: int, message: str, stage: models.CollectionStageEnum):
        action = models.LoanRecoveryAction(
            loan_account_id=loan_id,
            stage=stage,
            action_type="AI_AUTO_REMINDER",
            ai_drafted_message=message,
            status="SENT"
        )
        db.add(action)
        db.commit()

    async def scan_and_trigger_reminders(self, db: Session):
        """
        Background task to find overdue loans and trigger AI reminders.
        """
        overdue_loans = db.query(LoanAccount).filter(
            LoanAccount.principal_outstanding > 0,
            # LoanAccount.maturity_date < datetime.utcnow() # In a real app
        ).all()

        for loan in overdue_loans:
            msg = await self.draft_recovery_message(db, loan.id)
            self.log_recovery_action(db, loan.id, msg, models.CollectionStageEnum.DELINQUENT)
            # In production, trigger real SMS/Email API here

recovery_service = LoanRecoveryAIService()
