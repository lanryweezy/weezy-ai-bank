import uuid
import logging
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

logger = logging.getLogger(__name__)

class TellerOperationsService:
    
    def get_or_create_till(self, db: Session, user_id: int) -> models.TellerTill:
        till = db.query(models.TellerTill).filter(models.TellerTill.teller_user_id == user_id).first()
        if not till:
            # For demo, assign to a default branch
            branch = db.query(models.Branch).first()
            if not branch:
                branch = models.Branch(branch_code="HQ001", name="Head Office", vault_gl_account="GL-VAULT-001")
                db.add(branch)
                db.commit()
                
            till = models.TellerTill(
                teller_user_id=user_id,
                branch_id=branch.id,
                till_gl_account=f"GL-TILL-{user_id}"
            )
            db.add(till)
            db.commit()
            db.refresh(till)
        return till

    def open_till(self, db: Session, user_id: int) -> models.TellerTill:
        till = self.get_or_create_till(db, user_id)
        if till.status == models.TillStatusEnum.OPEN:
            return till
            
        till.status = models.TillStatusEnum.OPEN
        till.opened_at = datetime.utcnow()
        db.commit()
        return till
        
    def close_till(self, db: Session, user_id: int) -> models.TellerTill:
        till = self.get_or_create_till(db, user_id)
        # Ideally, require vaulting all cash before close, but simplify for now
        till.status = models.TillStatusEnum.CLOSED
        till.last_closed_at = datetime.utcnow()
        db.commit()
        return till

    async def post_transaction(self, db: Session, user_id: int, req: schemas.TellerPostingCreate) -> models.TellerPosting:
        till = self.get_or_create_till(db, user_id)
        
        if till.status != models.TillStatusEnum.OPEN:
            raise Exception("Teller Till is not open.")
            
        # 1. Update Till Balance Limits Check
        new_balance = till.current_cash_balance
        if req.posting_type == "CASH_DEPOSIT":
            new_balance += req.amount
            if new_balance > till.max_holding_limit:
                raise Exception(f"Deposit exceeds maximum till holding limit of ₦{till.max_holding_limit}. Please vault cash first.")
        else:
            new_balance -= req.amount
            if new_balance < 0:
                raise Exception("Insufficient cash in till for withdrawal.")
                
        # 2. Initiate Core Ledger Transaction
        ref = f"TEL-{uuid.uuid4().hex[:10].upper()}"
        
        try:
            if req.posting_type == "CASH_DEPOSIT":
                txn_req = TransactionCreateRequest(
                    transaction_type="DEPOSIT",
                    channel="BRANCH",
                    amount=req.amount,
                    currency="NGN",
                    debit_account_number=till.till_gl_account, # Bank receives cash
                    credit_account_number=req.customer_account_number, # Customer gets credit
                    narration=f"CASH DEP: {req.narration}"
                )
            else:
                txn_req = TransactionCreateRequest(
                    transaction_type="WITHDRAWAL",
                    channel="BRANCH",
                    amount=req.amount,
                    currency="NGN",
                    debit_account_number=req.customer_account_number, # Customer is debited
                    credit_account_number=till.till_gl_account, # Bank gives out cash
                    narration=f"CASH WDL: {req.narration}"
                )
                
            await initiate_transaction(db, txn_req)
            
            # 3. Log Teller Posting
            posting = models.TellerPosting(
                reference=ref,
                till_id=till.id,
                customer_account_number=req.customer_account_number,
                posting_type=req.posting_type,
                amount=req.amount,
                depositor_name=req.depositor_name,
                depositor_phone=req.depositor_phone,
                narration=req.narration
            )
            db.add(posting)
            
            # Update till cash
            till.current_cash_balance = new_balance
            
            db.commit()
            db.refresh(posting)
            return posting
            
        except Exception as e:
            logger.error(f"Teller posting failed: {str(e)}")
            db.rollback()
            raise e

    async def request_vault_transaction(self, db: Session, user_id: int, req: schemas.VaultTransactionRequest):
        till = self.get_or_create_till(db, user_id)
        
        # Simplified: Auto-approve for demo purposes
        if req.transaction_type == "TILL_TO_VAULT":
            if till.current_cash_balance < req.amount:
                raise Exception("Insufficient till balance to vault.")
            till.current_cash_balance -= req.amount
            narration = "TILL TO VAULT TRANSFER"
            
            # Core Txn
            branch = db.query(models.Branch).filter(models.Branch.id == till.branch_id).first()
            txn_req = TransactionCreateRequest(
                transaction_type="INTERNAL",
                channel="BRANCH",
                amount=req.amount,
                currency="NGN",
                debit_account_number=branch.vault_gl_account, 
                credit_account_number=till.till_gl_account, 
                narration=narration
            )
            await initiate_transaction(db, txn_req)
            
        else:
            till.current_cash_balance += req.amount
            narration = "VAULT TO TILL TRANSFER"
            
            branch = db.query(models.Branch).filter(models.Branch.id == till.branch_id).first()
            txn_req = TransactionCreateRequest(
                transaction_type="INTERNAL",
                channel="BRANCH",
                amount=req.amount,
                currency="NGN",
                debit_account_number=till.till_gl_account, 
                credit_account_number=branch.vault_gl_account, 
                narration=narration
            )
            await initiate_transaction(db, txn_req)

        v_txn = models.VaultTransaction(
            till_id=till.id,
            transaction_type=req.transaction_type,
            amount=req.amount,
            initiator_id=user_id,
            status="APPROVED"
        )
        db.add(v_txn)
        db.commit()
        return v_txn

teller_service = TellerOperationsService()
