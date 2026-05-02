import logging
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

logger = logging.getLogger(__name__)

class SIService:
    
    def create_instruction(self, db: Session, customer_id: int, req: schemas.SICreate) -> models.StandingInstruction:
        si = models.StandingInstruction(
            customer_id=customer_id,
            source_account_number=req.source_account_number,
            destination_account_number=req.destination_account_number,
            destination_bank_code=req.destination_bank_code,
            destination_account_name=req.destination_account_name,
            amount=req.amount,
            narration=req.narration,
            frequency=req.frequency,
            start_date=req.start_date,
            end_date=req.end_date,
            next_run_date=req.start_date
        )
        db.add(si)
        db.commit()
        db.refresh(si)
        return si

    async def process_due_instructions(self, db: Session):
        """
        Scans for all ACTIVE instructions due today or earlier.
        Executes them and updates the 'next_run_date'.
        """
        today = date.today()
        due_instructions = db.query(models.StandingInstruction).filter(
            models.StandingInstruction.status == models.SIStatusEnum.ACTIVE,
            models.StandingInstruction.next_run_date <= today
        ).all()
        
        executed_count = 0
        for si in due_instructions:
            try:
                # 1. Trigger Core Transaction
                txn_req = TransactionCreateRequest(
                    transaction_type="TRANSFER",
                    channel="SYSTEM",
                    amount=si.amount,
                    currency=si.currency,
                    debit_account_number=si.source_account_number,
                    credit_account_number=si.destination_account_number,
                    credit_bank_code=si.destination_bank_code,
                    narration=f"SI EXEC: {si.narration}"
                )
                
                txn = await initiate_transaction(db, txn_req)
                
                # 2. Log Success
                log = models.SIExecutionLog(
                    si_id=si.id,
                    status="SUCCESS",
                    transaction_id=txn.id
                )
                db.add(log)
                
                # 3. Schedule Next Run
                si.last_run_date = today
                si.next_run_date = self._calculate_next_date(si.next_run_date, si.frequency)
                si.consecutive_failures = 0
                
                # Check if completion reached
                if si.end_date and si.next_run_date > si.end_date:
                    si.status = models.SIStatusEnum.COMPLETED
                
                executed_count += 1
                
            except Exception as e:
                logger.error(f"SI Execution Failed [ID {si.id}]: {str(e)}")
                si.consecutive_failures += 1
                
                # Auto-pause after 3 failures
                if si.consecutive_failures >= 3:
                    si.status = models.SIStatusEnum.PAUSED
                
                log = models.SIExecutionLog(
                    si_id=si.id,
                    status="FAILED",
                    error_details=str(e)
                )
                db.add(log)
                
            db.commit()
            
        return executed_count

    def _calculate_next_date(self, current: date, freq: models.SIFrequencyEnum) -> date:
        if freq == models.SIFrequencyEnum.DAILY:
            return current + timedelta(days=1)
        if freq == models.SIFrequencyEnum.WEEKLY:
            return current + timedelta(weeks=1)
        if freq == models.SIFrequencyEnum.BI_WEEKLY:
            return current + timedelta(weeks=2)
        if freq == models.SIFrequencyEnum.MONTHLY:
            return current + relativedelta(months=1)
        if freq == models.SIFrequencyEnum.QUARTERLY:
            return current + relativedelta(months=3)
        if freq == models.SIFrequencyEnum.ANNUALLY:
            return current + relativedelta(years=1)
        return current

standing_instruction_service = SIService()
