import decimal
import random
import uuid
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils

logger = logging.getLogger(__name__)

class ChequeClearingService:
    
    def deposit_cheque(self, db: Session, deposit_in: schemas.ChequeDepositCreate) -> models.ChequeDeposit:
        """
        Records a cheque deposit. 
        Funds are not credited immediately (held in clearing).
        """
        ref = f"CHQ-{uuid.uuid4().hex[:12].upper()}"
        
        db_deposit = models.ChequeDeposit(
            **deposit_in.dict(),
            deposit_reference=ref,
            issuing_bank_name=NigerianMarketUtils.get_bank_name(deposit_in.issuing_bank_code),
            status=models.ChequeStatusEnum.PENDING
        )
        db.add(db_deposit)
        db.commit()
        db.refresh(db_deposit)
        return db_deposit

    async def process_clearing_session(self, db: Session):
        """
        Simulates the NACS clearing session.
        Moves cheques from PENDING to IN_CLEARING.
        """
        pending = db.query(models.ChequeDeposit).filter(models.ChequeDeposit.status == models.ChequeStatusEnum.PENDING).all()
        for chq in pending:
            chq.status = models.ChequeStatusEnum.IN_CLEARING
        db.commit()
        return len(pending)

    async def finalize_clearing(self, db: Session, cheque_id: int, is_bounced: bool = False, reason: str = None):
        """
        Finalizes the clearing for a cheque.
        If successful, credits the customer account using Double-Entry.
        """
        chq = db.query(models.ChequeDeposit).filter(models.ChequeDeposit.id == cheque_id).first()
        if not chq or chq.status != models.ChequeStatusEnum.IN_CLEARING:
            raise Exception("Cheque not in clearing state.")

        if is_bounced:
            chq.status = models.ChequeStatusEnum.BOUNCED
            chq.bounced_reason = reason or "Insufficient Funds"
            db.commit()
            return chq

        # 1. Successful Clearing: Credit Customer Account
        # Debit: Bank Clearing Suspense GL, Credit: Customer NUBAN
        try:
            txn_req = TransactionCreateRequest(
                transaction_type="CHEQUE_DEPOSIT",
                channel="BRANCH",
                amount=chq.amount,
                currency="NGN",
                debit_account_number="GL-CHEQUE-CLEARING-SUSPENSE-001",
                credit_account_number=chq.target_account_number,
                narration=f"CHQ DEPOSIT: {chq.issuing_bank_name} - {chq.cheque_number}"
            )
            
            await initiate_transaction(db, txn_req)
            
            chq.status = models.ChequeStatusEnum.CLEARED
            chq.cleared_at = datetime.utcnow()
            db.commit()
            return chq
        except Exception as e:
            logger.error(f"Cheque credit failed: {str(e)}")
            raise e

    def request_cheque_book(self, db: Session, account_number: str, leaf_count: int, address: str):
        request = models.ChequeBookRequest(
            account_number=account_number,
            leaf_count=leaf_count,
            delivery_address=address
        )
        db.add(request)
        db.commit()
        return request

cheque_service = ChequeClearingService()
