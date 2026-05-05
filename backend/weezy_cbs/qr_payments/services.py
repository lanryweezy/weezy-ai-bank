import decimal
import random
import string
import uuid
import json
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils

logger = logging.getLogger(__name__)

class QRPaymentService:
    
    def generate_qr(self, db: Session, qr_in: schemas.QRCodeCreate) -> models.QRCode:
        """
        Generates a dynamic NQR payload with expiration and checksum.
        Format: NQR|01|BANK|ACC|AMT|REF|EXP_TS|CRC
        """
        bank_code = "999"
        ref = uuid.uuid4().hex[:10].upper()
        
        # 1. Set Expiration (e.g., 15 minutes)
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        exp_ts = int(expires_at.timestamp())
        
        # 2. Build Base Payload
        base_payload = f"NQR|01|{bank_code}|{qr_in.account_number}|{float(qr_in.amount) if qr_in.amount else ''}|{ref}|{exp_ts}"
        
        # 3. Simple Checksum (Conceptual)
        checksum = hashlib.md5(base_payload.encode()).hexdigest()[:4].upper()
        final_payload = f"{base_payload}|{checksum}"
        
        db_qr = models.QRCode(
            **qr_in.dict(),
            qr_payload=final_payload,
            expires_at=expires_at
        )
        db.add(db_qr)
        db.commit()
        db.refresh(db_qr)
        return db_qr

    def decode_qr(self, db: Session, payload: str) -> Dict[str, Any]:
        """Decodes the dynamic NQR payload and validates expiration."""
        parts = payload.split("|")
        if len(parts) < 8:
            raise Exception("Invalid NQR Format or Version")
            
        exp_ts = int(parts[6])
        if datetime.utcnow().timestamp() > exp_ts:
            raise Exception("QR Code has expired")

        qr = db.query(models.QRCode).filter(models.QRCode.qr_payload == payload).first()
        if not qr:
            return {
                "bank_code": parts[2],
                "account_number": parts[3],
                "amount": float(parts[4]) if parts[4] else None,
                "is_external": True,
                "expires_at": datetime.fromtimestamp(exp_ts)
            }
        
        return {
            "bank_code": "999",
            "account_number": qr.account_number,
            "amount": float(qr.amount) if qr.amount else None,
            "narration": qr.narration,
            "account_name": f"{qr.customer.first_name} {qr.customer.last_name}",
            "is_external": False,
            "qr_id": qr.id,
            "expires_at": qr.expires_at
        }

    async def process_qr_payment(self, db: Session, customer_id: int, request: schemas.QRPaymentRequest):
        """
        Executes a payment from a scanned QR code.
        """
        # 1. Decode & Verify
        qr_info = self.decode_qr(db, request.qr_payload)
        
        # 2. Execute Transaction
        txn_req = TransactionCreateRequest(
            transaction_type="QR_PAYMENT",
            channel="MOBILE_APP",
            amount=request.amount,
            currency="NGN",
            debit_account_number=request.sender_account,
            credit_account_number=qr_info["account_number"],
            credit_bank_code=qr_info["bank_code"],
            narration=request.narration or qr_info.get("narration") or f"QR Payment to {qr_info.get('account_name', 'Merchant')}"
        )
        
        txn = await initiate_transaction(db, txn_req)
        
        # 3. Log QR Specific Event
        if not qr_info["is_external"]:
            log = models.QRPaymentLog(
                qr_code_id=qr_info["qr_id"],
                transaction_id=str(txn.id),
                sender_account=request.sender_account,
                amount=request.amount,
                status="SUCCESSFUL"
            )
            db.add(log)
            db.commit()
            
        return {
            "status": "SUCCESS",
            "transaction_id": txn.id,
            "amount": float(request.amount),
            "recipient": qr_info.get("account_name", "External Bank Account")
        }

qr_service = QRPaymentService()
