import uuid
import logging
import decimal
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
from weezy_cbs.accounts_ledger_management.models import Account, GeneralLedgerAccount
from weezy_cbs.messaging_notifications.services import notification_engine

logger = logging.getLogger(__name__)

class FDManagementService:
    
    def book_fd(self, db: Session, customer_id: int, req: schemas.FDAccountCreate) -> models.FixedDepositAccount:
        # ... existing logic ...
        fd_acc = models.FixedDepositAccount(
            fd_account_number=f"FD{uuid.uuid4().hex[:8].upper()}",
            customer_id=customer_id,
            product_id=product.id,
            principal_amount=req.principal_amount,
            interest_rate_applied=product.interest_rate_pa,
            booking_date=date.today(),
            maturity_date=date.today() + timedelta(days=product.tenor_days),
            rollover_instruction=req.rollover_instruction,
            linked_savings_account=req.linked_savings_account
        )
        db.add(fd_acc)
        db.commit()
        db.refresh(fd_acc)

        # --- REAL-TIME ALERT ---
        import asyncio
        from asgiref.sync import async_to_sync
        async_to_sync(notification_engine.send_investment_alert)(db, customer_id, {
            "principal": fd_acc.principal_amount,
            "rate": fd_acc.interest_rate_applied,
            "maturity_date": fd_acc.maturity_date.strftime("%d-%b-%Y"),
            "ref": fd_acc.fd_account_number
        })

        return fd_acc

    def run_daily_accrual(self, db: Session):
        """Called by EOD Orchestrator."""
        active_fds = db.query(models.FixedDepositAccount).filter(models.FixedDepositAccount.status == models.FDStatusEnum.ACTIVE).all()
        
        for fd in active_fds:
            # Simple daily interest: (Principal * Rate) / 365
            daily_rate = (fd.interest_rate_applied / Decimal(100)) / Decimal(365)
            accrual = fd.principal_amount * daily_rate
            fd.accrued_interest += accrual
            
        db.commit()
        return len(active_fds)

    async def liquidate_fd(self, db: Session, fd_id: int, is_early: bool = False):
        fd = db.query(models.FixedDepositAccount).filter(models.FixedDepositAccount.id == fd_id).first()
        if not fd or fd.status != models.FDStatusEnum.ACTIVE:
            raise Exception("Fixed Deposit is not active or already liquidated.")
            
        product = db.query(models.FixedDepositProduct).filter(models.FixedDepositProduct.id == fd.product_id).first()
        
        payout_interest = fd.accrued_interest
        if is_early:
            # Apply penalty: lose X% of accrued interest
            penalty_amount = payout_interest * (product.early_liquidation_penalty_pct / Decimal(100))
            payout_interest -= penalty_amount
            
        total_payout = fd.principal_amount + payout_interest
        
        # Post Transaction: Liability GL -> Customer Savings
        ref = f"FD-LIQ-{uuid.uuid4().hex[:10].upper()}"
        txn_req = TransactionCreateRequest(
            transaction_type="INTERNAL",
            channel="SYSTEM",
            amount=total_payout,
            currency="NGN",
            debit_account_number="GL-FD-LIABILITY-001",
            credit_account_number=fd.linked_savings_account,
            narration=f"FD LIQUIDATION: {fd.fd_account_number} {'(EARLY)' if is_early else ''}"
        )
        await initiate_transaction(db, txn_req)
        
        fd.status = models.FDStatusEnum.LIQUIDATED
        fd.liquidated_at = datetime.utcnow()
        db.commit()
        return fd

fd_service = FDManagementService()
from asgiref.sync import async_to_sync
