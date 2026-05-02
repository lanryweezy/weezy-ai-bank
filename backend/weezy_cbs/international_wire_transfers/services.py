import decimal
import random
import uuid
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

logger = logging.getLogger(__name__)

class InternationalWireService:
    
    def initiate_wire(self, db: Session, wire_in: schemas.WireTransferCreate) -> models.InternationalWireTransfer:
        """
        Initiates a new international wire request.
        For Nigeria, this usually starts in DRAFT or AWAITING_DOCS stage.
        """
        ref = f"SWIFT-{uuid.uuid4().hex[:12].upper()}"
        
        db_wire = models.InternationalWireTransfer(
            **wire_in.dict(),
            reference_number=ref,
            status=models.WireStatusEnum.PENDING_APPROVAL
        )
        db.add(db_wire)
        db.commit()
        db.refresh(db_wire)
        return db_wire

    async def generate_mt103(self, db: Session, wire_id: int) -> str:
        """
        Simulates the generation of a SWIFT MT103 message.
        """
        wire = db.query(models.InternationalWireTransfer).filter(models.InternationalWireTransfer.id == wire_id).first()
        if not wire:
            raise Exception("Wire transfer not found")

        # Standard SWIFT MT103 Template (Simplified)
        mt103 = f"""
        {'{'}1:F01WZYBNKLAXXX0000000000{'}'}
        {'{'}2:I103BANKBEBBAXXXN{'}'}
        {'{'}4:
        :20:{wire.reference_number}
        :23B:CRED
        :32A:{datetime.utcnow().strftime('%y%m%d')}{wire.currency}{str(wire.amount).replace('.', ',')}
        :50K:/{wire.source_account_number}
        {wire.customer.first_name} {wire.customer.last_name}
        :59:/{wire.beneficiary_account}
        {wire.beneficiary_name}
        :70:{wire.purpose_of_payment}
        :71A:SHA
        -{'}'}
        """
        
        wire.mt103_payload = mt103
        wire.status = models.WireStatusEnum.MT103_GENERATED
        db.commit()
        return mt103

    async def execute_swift_outbound(self, db: Session, wire_id: int):
        """
        Final execution of the wire.
        Deducts funds from Dom Account -> Credits Nostro Account GL.
        """
        wire = db.query(models.InternationalWireTransfer).filter(models.InternationalWireTransfer.id == wire_id).first()
        if not wire or wire.status != models.WireStatusEnum.MT103_GENERATED:
            raise Exception("Invalid status for execution")

        # 1. Execute Ledger Transaction
        # Debit Customer Dom Account, Credit bank's Nostro Suspense GL
        try:
            txn_req = TransactionCreateRequest(
                transaction_type="WIRE_TRANSFER",
                channel="SWIFT",
                amount=wire.amount,
                currency=wire.currency,
                debit_account_number=wire.source_account_number,
                credit_account_number="GL-NOSTRO-USD-001", # Bank's Nostro settlement account
                narration=f"WIRE OUT: {wire.beneficiary_name} - {wire.reference_number}"
            )
            
            await initiate_transaction(db, txn_req)
            
            wire.status = models.WireStatusEnum.COMPLETED
            wire.processed_at = datetime.utcnow()
            db.commit()
            return wire
        except Exception as e:
            wire.status = models.WireStatusEnum.FAILED
            db.commit()
            raise e

    def get_customer_wires(self, db: Session, customer_id: int) -> List[models.InternationalWireTransfer]:
        return db.query(models.InternationalWireTransfer).filter(models.InternationalWireTransfer.customer_id == customer_id).all()

wire_service = InternationalWireService()
