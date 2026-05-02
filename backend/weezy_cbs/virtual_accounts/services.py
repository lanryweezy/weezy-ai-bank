import decimal
import random
import string
import uuid
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
from weezy_cbs.accounts_ledger_management.services import get_account_by_id

logger = logging.getLogger(__name__)

class VirtualAccountService:
    
    def create_virtual_account(self, db: Session, va_in: schemas.VirtualAccountCreate) -> models.VirtualAccount:
        """
        Generates a new virtual NUBAN for business collections.
        """
        # 1. Verify Parent Account
        parent = get_account_by_id(db, va_in.parent_account_id)
        if not parent or parent.customer_id != va_in.customer_id:
            raise Exception("Invalid parent account for virtual account.")
            
        # 2. Generate Virtual NUBAN (Using 999 bank code)
        account_number = NigerianMarketUtils.generate_nuban(bank_code="999")
        
        db_va = models.VirtualAccount(
            **va_in.dict(),
            account_number=account_number,
            status=models.VirtualAccountStatusEnum.ACTIVE
        )
        db.add(db_va)
        db.commit()
        db.refresh(db_va)
        return db_va

    def get_customer_virtual_accounts(self, db: Session, customer_id: int) -> List[models.VirtualAccount]:
        return db.query(models.VirtualAccount).filter(models.VirtualAccount.customer_id == customer_id).all()

    async def simulate_incoming_payment(self, db: Session, account_number: str, amount: decimal.Decimal, sender_name: str):
        """
        Simulates an incoming NIP transfer to a virtual account.
        Routes funds: Technical Suspense -> Parent Ledger Account.
        """
        va = db.query(models.VirtualAccount).filter(models.VirtualAccount.account_number == account_number).first()
        if not va or va.status != models.VirtualAccountStatusEnum.ACTIVE:
            raise Exception("Virtual account not found or inactive")

        # 1. Post to Ledger (Credit parent account, Debit Technical Settlement GL)
        txn_req = TransactionCreateRequest(
            transaction_type="CASH_DEPOSIT", # Using deposit type for collections
            channel="NIP",
            amount=amount,
            currency="NGN",
            debit_account_number="GL-NIP-SETTLE-SUSPENSE", # Internal technical account
            credit_account_number=va.parent_account.account_number,
            narration=f"VA-COLLECT: {sender_name} to {va.account_name}"
        )
        
        txn = await initiate_transaction(db, txn_req)
        
        # 2. Log VA Specific Payment
        log = models.VirtualAccountIncomingPayment(
            virtual_account_id=va.id,
            transaction_id=str(txn.id),
            sender_name=sender_name,
            amount=amount,
            status="SETTLED"
        )
        db.add(log)
        db.commit()
        
        return log

virtual_account_service = VirtualAccountService()
