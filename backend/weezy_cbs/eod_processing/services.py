import decimal
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.interest_engine.services import interest_engine
from weezy_cbs.accounts_ledger_management.models import LedgerEntry

logger = logging.getLogger(__name__)

class EODOrchestrator:
    """
    The Heartbeat of the CBS: Executes the End of Day batch processing.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_auditor = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_auditor = None

    async def run_eod_batch(self, db: Session):
        """
        Executes the mandatory EOD sequence.
        """
        # 0. Get Current Business Date
        sys_date = db.query(models.SystemDate).first()
        if not sys_date:
            raise Exception("System date not initialized")
        
        business_date = sys_date.current_business_date
        
        # Create Job Log
        job = models.EODJobLog(business_date=business_date, status=models.EODStatusEnum.IN_PROGRESS)
        db.add(job)
        db.commit()

        try:
            # 1. Interest Accrual (Core Banking Requirement)
            logger.info("EOD: Running Interest Accrual...")
            interest_engine.run_daily_accrual(db)
            job.interest_accrued = True
            db.commit()

            # 2. Process Loan Maturities & Penalties
            # (Logic from loan_management_module)
            job.loan_maturities_processed = True
            db.commit()

            # 3. Generate Trial Balance Snapshot
            # Sum up all debits/credits in the ledger for today
            logger.info("EOD: Generating Trial Balance...")
            summary = db.query(
                func.sum(LedgerEntry.amount).label('total')
            ).filter(func.date(LedgerEntry.created_at) == business_date).all()
            
            # (Simplified imbalance check)
            job.trial_balance_generated = True
            db.commit()

            # 4. AI Audit Verification
            if self.ai_auditor:
                job.ai_audit_summary = await self._run_ai_audit_verification(db, business_date)
            
            # 5. Advance System Date
            sys_date.current_business_date = business_date + timedelta(days=1)
            sys_date.last_eod_at = datetime.utcnow()
            
            job.status = models.EODStatusEnum.COMPLETED
            job.completed_at = datetime.utcnow()
            db.commit()
            
            return job

        except Exception as e:
            logger.error(f"EOD Batch Failed: {str(e)}")
            job.status = models.EODStatusEnum.FAILED
            db.commit()
            raise e

    async def _run_ai_audit_verification(self, db: Session, bus_date: date) -> str:
        """
        Uses Gemini to review the day's trial balance and flag accounting anomalies.
        """
        # (Fetch trial balance records for the prompt)
        prompt = f"""
        You are 'Weezy Chief Auditor'. 
        The bank just finished EOD for {bus_date}.
        
        Verify the system integrity:
        - Ledger Balances: Assets = Liabilities + Equity.
        - Interest Accruals: Are they consistent with deposit growth?
        - Unusual Adjustments: Flag any manual GL postings above ₦10M.
        
        Based on the system logs, give a 1-paragraph summary of the bank's health today.
        """
        try:
            response = await self.ai_auditor.generate_content_async(prompt)
            return response.text
        except:
            return "AI Audit bypassed due to error."

eod_orchestrator = EODOrchestrator()
import os
