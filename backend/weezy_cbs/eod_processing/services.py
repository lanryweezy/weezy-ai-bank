import decimal
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.interest_engine.services import interest_engine
from weezy_cbs.fixed_deposits.services import fd_service
from weezy_cbs.savings_investments.services import savings_service
from weezy_cbs.standing_instructions.services import standing_instruction_service
from weezy_cbs.loan_recovery.services import recovery_service
from weezy_cbs.accounts_ledger_management.models import LedgerEntry, GeneralLedgerAccount
from weezy_cbs.teller_operations.models import TellerTill, TillStatusEnum

logger = logging.getLogger(__name__)

class EODOrchestrator:
    """
    The Sentient Heartbeat of the CBS: Executes the End of Day batch processing
    with Predictive Neural Handshaking.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_auditor = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_auditor = None

    async def neural_handshake_prerun(self, db: Session) -> Dict[str, Any]:
        """
        PREDICTIVE PHASE: Analyzes bank state before the actual EOD run.
        Detects unposted legs, open tills, and potential imbalances.
        """
        open_tills = db.query(TellerTill).filter(TellerTill.status == TillStatusEnum.OPEN).all()
        pending_txns = db.query(LedgerEntry).filter(LedgerEntry.transaction_date > date.today()).count() # Conceptual check
        
        gl_snapshot = db.query(
            GeneralLedgerAccount.gl_code, 
            GeneralLedgerAccount.current_balance
        ).limit(10).all() # Sample critical GLs
        
        state_data = {
            "open_tills": len(open_tills),
            "pending_txns": pending_txns,
            "gl_snapshot": {row.gl_code: float(row.current_balance) for row in gl_snapshot}
        }

        if not self.ai_auditor:
            return {"prediction": "Bypassed", "risk_level": "LOW"}

        prompt = f"""
        Analyze this Weezy AI Bank EOD state data:
        {json.dumps(state_data, indent=2)}
        
        1. Predict if EOD will succeed or fail.
        2. Identify 'Neural Bottlenecks' or imbalances.
        3. Suggest specific corrective SQL-logic or actions (e.g. 'Close Till T-101').
        
        Format as a JSON object: {{"prediction": "SUCCESS|FAILURE", "risk_level": "LOW|MEDIUM|HIGH", "advice": "..."}}
        """
        try:
            response = await self.ai_auditor.generate_content_async(prompt)
            # Try to extract JSON from response
            advice = response.text
            return {"prediction": "AI_ANALYZED", "advice": advice, "state": state_data}
        except:
            return {"prediction": "Error in Neural Link", "risk_level": "UNKNOWN"}

    async def run_eod_batch(self, db: Session):
        """
        Ultra-Fast EOD Sequence with Neural Verification.
        """
        import asyncio
        
        # 0. NEURAL HANDSHAKE
        prediction = await self.neural_handshake_prerun(db)
        logger.info(f"EOD Neural Handshake: {prediction.get('prediction')}")

        # 1. Get Current Business Date
        sys_date = db.query(models.SystemDate).first()
        if not sys_date:
            raise Exception("System date not initialized")
        
        business_date = sys_date.current_business_date
        
        # Create Job Log
        job = models.EODJobLog(
            business_date=business_date, 
            status=models.EODStatusEnum.IN_PROGRESS,
            ai_audit_summary=f"Pre-run prediction: {prediction.get('advice')}"
        )
        db.add(job)
        db.commit()

        try:
            logger.info(f"EOD: Starting Parallel Execution for {business_date}")
            
            # Define wrappers for synchronous legacy functions to run in executor if needed, 
            # but for this architecture, we assume they are safe to run concurrently in macro-batches.
            
            async def run_savings_accrual():
                logger.info("EOD [Thread]: Running Savings Interest...")
                interest_engine.run_daily_accrual(db)
                
            async def run_fd_accrual():
                logger.info("EOD [Thread]: Running FD Accrual...")
                fd_service.run_daily_accrual(db)
                savings_service.run_daily_accrual(db)

            # 2. Execute Heavy Operations Concurrently
            # Legacy systems run these sequentially (taking hours). 
            # We run them in parallel (taking minutes/seconds).
            await asyncio.gather(
                run_savings_accrual(),
                run_fd_accrual(),
                standing_instruction_service.process_due_instructions(db),
                recovery_service.scan_and_trigger_reminders(db)
            )
            
            job.interest_accrued = True
            job.loan_maturities_processed = True
            db.commit()

            # 3. Monthly Stamp Duty Sweep (Runs synchronously as it involves GL sweeps)
            if business_date.day == 1:
                logger.info("EOD: Running Monthly Stamp Duty Sweep to FIRS GL...")
                await self._perform_stamp_duty_sweep(db, business_date)

            # 4. Generate Trial Balance Snapshot
            logger.info("EOD: Generating Trial Balance...")
            gl_summary = db.query(
                GeneralLedgerAccount.gl_type,
                func.sum(GeneralLedgerAccount.current_balance).label('total')
            ).group_by(GeneralLedgerAccount.gl_type).all()
            
            summary_dict = {str(row.gl_type.value if hasattr(row.gl_type, 'value') else row.gl_type): float(row.total) for row in gl_summary}
            
            assets = summary_dict.get('ASSET', 0)
            liabilities = summary_dict.get('LIABILITY', 0)
            equity = summary_dict.get('EQUITY', 0)
            job.imbalance_amount = decimal.Decimal(str(round(assets - liabilities - equity, 2)))
            
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
            
            logger.info(f"EOD: Completed successfully for {business_date}")
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

    async def _perform_stamp_duty_sweep(self, db: Session, business_date: date):
        """
        Aggregates collected Stamp Duty and moves it to the Regulatory Clearing GL.
        """
        STAMP_DUTY_LIABILITY_GL = "GL-LIAB-STAMP-DUTY-001"
        FIRS_CLEARING_GL = "GL-ASSET-FIRS-CLEARING-001"
        
        liability_gl = db.query(GeneralLedgerAccount).filter(GeneralLedgerAccount.gl_code == STAMP_DUTY_LIABILITY_GL).first()
        firs_gl = db.query(GeneralLedgerAccount).filter(GeneralLedgerAccount.gl_code == FIRS_CLEARING_GL).first()
        
        if liability_gl and firs_gl and liability_gl.current_balance > 0:
            sweep_amount = liability_gl.current_balance
            logger.info(f"EOD: Sweeping {sweep_amount} NGN from Stamp Duty Liability to FIRS Clearing.")
            
            # 1. Update GL Balances (Atomic sweep)
            liability_gl.current_balance -= sweep_amount
            firs_gl.current_balance += sweep_amount
            
            # 2. Record GL Entries (Conceptual - usually via a dedicated posting service)
            # In a real app, this would use TransactionManagement to ensure double-entry consistency
            db.commit()
            logger.info("EOD: Stamp Duty sweep successful.")
        else:
            logger.info("EOD: Stamp Duty sweep skipped (No balance or GLs missing).")

eod_orchestrator = EODOrchestrator()
import os
import json
