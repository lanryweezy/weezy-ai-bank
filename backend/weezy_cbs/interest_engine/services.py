import decimal
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta

from . import models, schemas
from weezy_cbs.accounts_ledger_management.models import Account, AccountStatusEnum
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

logger = logging.getLogger(__name__)

class InterestAccrualEngine:
    
    def run_daily_accrual(self, db: Session):
        """
        Iterates through all active savings and investment accounts 
        and calculates 1 day of interest.
        """
        today = date.today()
        # Find active savings accounts (simplified)
        accounts = db.query(Account).filter(
            Account.status == AccountStatusEnum.ACTIVE,
            Account.ledger_balance > 100 # Minimum balance for interest
        ).all()

        for acc in accounts:
            # Standard Savings Rate: 4.5% PA (Nigerian Tier 1/2 avg)
            # In real app, this is fetched from a Product table
            annual_rate = decimal.Decimal("0.045")
            daily_rate = annual_rate / 365
            
            accrual_amt = (acc.ledger_balance * daily_rate).quantize(decimal.Decimal("0.0001"))
            
            # Save Accrual Log
            log = models.InterestAccrual(
                account_number=acc.account_number,
                amount_accrued=accrual_amt,
                principal_balance_at_time=acc.ledger_balance,
                interest_rate_applied=annual_rate,
                accrual_date=today,
                interest_type=models.InterestTypeEnum.SAVINGS
            )
            db.add(log)
        
        db.commit()
        return len(accounts)

    async def capitalize_monthly_interest(self, db: Session, month: int, year: int):
        """
        Aggregates all daily accruals for a month and pays out to the customer.
        """
        # 1. Sum up all ACCRUED entries for the period
        summary = db.query(
            models.InterestAccrual.account_number,
            func.sum(models.InterestAccrual.amount_accrued).label('total')
        ).filter(
            models.InterestAccrual.status == "ACCRUED",
            # Filtering by month/year logic...
        ).group_by(models.InterestAccrual.account_number).all()

        for s in summary:
            payout_amt = s.total.quantize(decimal.Decimal("0.01"))
            if payout_amt <= 0: continue

            # 2. Trigger Ledger Transaction
            # Debit: Bank Interest Expense GL, Credit: Customer Account
            try:
                txn_req = TransactionCreateRequest(
                    transaction_type="INTEREST_PAYOUT",
                    channel="SYSTEM_ENGINE",
                    amount=payout_amt,
                    currency="NGN",
                    debit_account_number="GL-EXPENSE-INTEREST-001", 
                    credit_account_number=s.account_number,
                    narration=f"Monthly Interest Payout - {month}/{year}"
                )
                
                txn = await initiate_transaction(db, txn_req)
                
                # 3. Log Payout
                payout_log = models.InterestPayout(
                    account_number=s.account_number,
                    transaction_id=str(txn.id),
                    total_amount_paid=payout_amt,
                    period_start=date(year, month, 1),
                    period_end=date(year, month, 28) # Simplified
                )
                db.add(payout_log)
                
                # 4. Mark Accruals as CAPITALIZED
                db.query(models.InterestAccrual).filter(
                    models.InterestAccrual.account_number == s.account_number,
                    models.InterestAccrual.status == "ACCRUED"
                ).update({"status": "CAPITALIZED"})

            except Exception as e:
                logger.error(f"Payout failed for {s.account_number}: {str(e)}")
            
            db.commit()

interest_engine = InterestAccrualEngine()
