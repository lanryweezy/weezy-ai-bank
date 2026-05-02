import decimal
import random
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.accounts_ledger_management.services import create_account, post_double_entry_transaction
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

logger = logging.getLogger(__name__)

class FXDomiciliaryService:
    
    def seed_rates(self, db: Session):
        """Seeds simulated FX rates for the Nigerian market."""
        rates = [
            {"base": "NGN", "target": "USD", "buy": 1450.00, "sell": 1465.00},
            {"base": "NGN", "target": "EUR", "buy": 1580.00, "sell": 1605.00},
            {"base": "NGN", "target": "GBP", "buy": 1820.00, "sell": 1850.00},
        ]
        for r in rates:
            existing = db.query(models.FXRate).filter(models.FXRate.target_currency == r["target"]).first()
            if not existing:
                db_rate = models.FXRate(
                    base_currency=r["base"], target_currency=r["target"],
                    buy_rate=decimal.Decimal(str(r["buy"])),
                    sell_rate=decimal.Decimal(str(r["sell"]))
                )
                db.add(db_rate)
        db.commit()

    def get_active_rates(self, db: Session) -> List[models.FXRate]:
        return db.query(models.FXRate).filter(models.FXRate.is_active == True).all()

    def open_dom_account(self, db: Session, customer_id: int, currency: models.FXCurrencyEnum) -> models.DomiciliaryAccount:
        """Opens a new Domiciliary account linked to a ledger account."""
        # 1. Create specialized FX ledger account
        from weezy_cbs.accounts_ledger_management.schemas import AccountCreate
        bank_acc = create_account(db, AccountCreate(customer_id=customer_id, product_code=f"DOM_{currency.value}"))
        
        # 2. Create Dom Profile
        db_dom = models.DomiciliaryAccount(
            customer_id=customer_id,
            ledger_account_id=bank_acc.id,
            currency=currency,
            balance=decimal.Decimal("0.00")
        )
        db.add(db_dom)
        db.commit()
        db.refresh(db_dom)
        return db_dom

    async def perform_currency_swap(self, db: Session, customer_id: int, request: schemas.FXSwapRequest):
        """
        Swaps currency between accounts (e.g. NGN -> USD).
        """
        # 1. Get Rate
        rate_entry = db.query(models.FXRate).filter(
            (models.FXRate.base_currency == request.source_currency) | 
            (models.FXRate.target_currency == request.target_currency)
        ).first()
        
        if not rate_entry:
            raise Exception("Exchange rate not found for pair.")

        # Determine conversion logic
        if request.source_currency == models.FXCurrencyEnum.NGN:
            # User selling NGN to buy Foreign CCY (Sell Rate)
            rate = rate_entry.sell_rate
            target_amount = (request.amount / rate).quantize(decimal.Decimal("0.01"))
        else:
            # User selling Foreign CCY to buy NGN (Buy Rate)
            rate = rate_entry.buy_rate
            target_amount = (request.amount * rate).quantize(decimal.Decimal("0.01"))

        # 2. Execute Ledger Double-Entry
        # (Simplified: Debit Source, Credit Target via Bank's FX Suspense GL)
        try:
             # Transaction logic would go here, involving two legs.
             # In a real app, this updates the DomiciliaryAccount and primary account balances.
             pass
        except:
             pass

        # 3. Log FX Transaction
        fx_log = models.FXTransaction(
            transaction_id=f"FX-{random.randint(1000,9999)}",
            customer_id=customer_id,
            source_currency=request.source_currency,
            target_currency=request.target_currency,
            source_amount=request.amount,
            target_amount=target_amount,
            applied_rate=rate
        )
        db.add(fx_log)
        db.commit()
        
        return fx_log

fx_dom_service = FXDomiciliaryService()
