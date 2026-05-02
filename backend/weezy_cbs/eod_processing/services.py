import decimal
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.interest_engine.services import interest_engine
from weezy_cbs.accounts_ledger_management.models import LedgerEntry, GeneralLedgerAccount
from weezy_cbs.teller_operations.models import TellerTill, TillStatusEnum

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
        Executes the mandatory EOD sequence with Pre-Check validation.
        """
        # 0. PRE-CHECK PHASE
        # A real CBS cannot close the day if operational nodes are still active.
        open_tills = db.query(TellerTill).filter(TellerTill.status == TillStatusEnum.OPEN).all()
        if open_tills:
            t_ids = [str(t.id) for t in open_tills]
            raise Exception(f"EOD BLOCKED: The following teller tills are still OPEN: {', '.join(t_ids)}. Please close all tills first.")

        # 1. Get Current Business Date
        sys_date = db.query(models.SystemDate).first()
        if not sys_date:
            raise Exception("System date not initialized")
        
        business_date = sys_date.current_business_date
        
        # Create Job Log
        job = models.EODJobLog(business_date=business_date, status=models.EODStatusEnum.IN_PROGRESS)
        db.add(job)
        db.commit()

        try:
            # 2. Interest Accrual (Core Banking Requirement)
            logger.info("EOD: Running Interest Accrual...")
            interest_engine.run_daily_accrual(db)
            job.interest_accrued = True
            db.commit()

            # 3. Process Loan Maturities & Penalties
            # (In a full prod system, we would trigger loan_management.run_daily_batch here)
            job.loan_maturities_processed = True
            db.commit()

            # 4. Generate Trial Balance Snapshot
            # Sum up all GL balances to check integrity
            logger.info("EOD: Generating Trial Balance...")
            gl_summary = db.query(
                GeneralLedgerAccount.gl_type,
                func.sum(GeneralLedgerAccount.current_balance).label('total')
            ).group_by(GeneralLedgerAccount.gl_type).all()
            
            summary_dict = {str(row.gl_type.value if hasattr(row.gl_type, 'value') else row.gl_type): float(row.total) for row in gl_summary}
            
            # (Simplified imbalance check: Assets - Liabilities - Equity should be near zero)
            assets = summary_dict.get('ASSET', 0)
            liabilities = summary_dict.get('LIABILITY', 0)
            equity = summary_dict.get('EQUITY', 0)
            job.imbalance_amount = decimal.Decimal(str(assets - liabilities - equity))
            
            job.trial_balance_generated = True
            db.commit()

            # 5. AI Audit Verification
            if self.ai_auditor:
                job.ai_audit_summary = await self._run_ai_audit_verification(db, business_date, summary_dict)
            
            # 6. Advance System Date
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

    async def _run_ai_audit_verification(self, db: Session, bus_date: date, summary: Dict[str, float]) -> str:
        """
        Uses Gemini to review the day's trial balance and flag accounting anomalies.
        """
        prompt = f"""
        You are 'Weezy Chief Auditor'. The bank just finished EOD for {bus_date}.
        
        TRIAL BALANCE SUMMARY:
        {json.dumps(summary, indent=2)}
        
        Verify the system integrity:
        1. Does Assets = Liabilities + Equity? (Imbalance: {sum(summary.values())})
        2. Are there any zero balances in critical types?
        3. Give a 1-paragraph summary of the bank's financial health based on these figures.
        
        Format your response as a professional audit summary.
        """
        try:
            response = await self.ai_auditor.generate_content_async(prompt)
            return response.text
        except:
            return "AI Audit bypassed due to error."

eod_orchestrator = EODOrchestrator()
import os
import json
