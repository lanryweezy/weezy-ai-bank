import decimal
import random
import string
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

class BillsPaymentService:
    
    def seed_nigerian_billers(self, db: Session):
        """Populates the database with common Nigerian billers."""
        billers = [
            {"name": "MTN Airtime", "code": "MTN_VTU", "cat": models.BillerCategoryEnum.AIRTIME, "val": False},
            {"name": "Airtel Airtime", "code": "AIRTEL_VTU", "cat": models.BillerCategoryEnum.AIRTIME, "val": False},
            {"name": "Glo Airtime", "code": "GLO_VTU", "cat": models.BillerCategoryEnum.AIRTIME, "val": False},
            {"name": "DSTV", "code": "DSTV", "cat": models.BillerCategoryEnum.CABLE_TV, "val": True},
            {"name": "GOTV", "code": "GOTV", "cat": models.BillerCategoryEnum.CABLE_TV, "val": True},
            {"name": "IKEDC (Electric)", "code": "IKEDC_PREPAID", "cat": models.BillerCategoryEnum.ELECTRICITY, "val": True},
            {"name": "EKEDC (Electric)", "code": "EKEDC_PREPAID", "cat": models.BillerCategoryEnum.ELECTRICITY, "val": True},
        ]

        for b in billers:
            existing = db.query(models.Biller).filter(models.Biller.biller_code == b["code"]).first()
            if not existing:
                db_biller = models.Biller(
                    name=b["name"], biller_code=b["code"], 
                    category=b["cat"], requires_validation=b["val"]
                )
                db.add(db_biller)
        db.commit()

    def get_billers_by_category(self, db: Session, category: Optional[models.BillerCategoryEnum] = None) -> List[models.Biller]:
        query = db.query(models.Biller).filter(models.Biller.is_active == True)
        if category:
            query = query.filter(models.Biller.category == category)
        return query.all()

    async def validate_customer(self, db: Session, request: schemas.BillValidationRequest) -> dict:
        """Simulates validation of Meter Numbers or Smartcard IDs."""
        biller = db.query(models.Biller).filter(models.Biller.biller_code == request.biller_code).first()
        if not biller:
            raise HTTPException(status_code=404, detail="Biller not found")
            
        # Mock validation logic
        if biller.category == models.BillerCategoryEnum.CABLE_TV:
            return {"status": "success", "customer_name": "SULAIMAN O. ADEBAYO", "address": "Lagos, Nigeria"}
        elif biller.category == models.BillerCategoryEnum.ELECTRICITY:
            return {"status": "success", "customer_name": "STREET HEART TECH", "address": "Ikeja, Lagos"}
        
        return {"status": "success", "customer_name": "Verified Customer"}

    async def process_bill_payment(self, db: Session, customer_id: int, request: schemas.BillPaymentRequest) -> dict:
        """
        Executes a bill payment.
        Debits User -> Credits Biller Settlement Account.
        """
        biller = db.query(models.Biller).filter(models.Biller.biller_code == request.biller_code).first()
        if not biller:
            raise HTTPException(status_code=404, detail="Biller not found")

        # 1. Execute Ledger Transaction
        try:
            txn_req = TransactionCreateRequest(
                transaction_type="BILL_PAYMENT",
                channel="MOBILE_APP",
                amount=request.amount,
                currency="NGN",
                debit_account_number=request.account_number,
                credit_account_number="GL-BILLER-SETTLE-001", # Internal settlement GL
                narration=request.narration or f"Bill Payment: {biller.name} - {request.customer_identifier}"
            )
            
            # Using the existing transaction service
            txn = await initiate_transaction(db, txn_req)
            
            # 2. Simulate External Provider Call (Paystack/Interswitch/Remita)
            # In production, this is where you'd call the provider's API.
            provider_ref = f"PVD-{random.randint(1000000, 9999999)}"
            token = None
            if biller.category == models.BillerCategoryEnum.ELECTRICITY:
                token = "-".join(["".join(random.choices(string.digits, k=4)) for _ in range(5)]) # 20-digit token

            # 3. Log the successful bill payment
            log = models.BillPaymentLog(
                transaction_id=str(txn.id),
                customer_id=customer_id,
                biller_id=biller.id,
                customer_identifier=request.customer_identifier,
                amount=request.amount,
                status="SUCCESSFUL",
                provider_reference=provider_ref,
                token=token
            )
            db.add(log)
            db.commit()
            
            return {
                "status": "SUCCESS",
                "transaction_id": txn.id,
                "provider_reference": provider_ref,
                "token": token,
                "biller_name": biller.name
            }

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Bill payment failed: {str(e)}")

bills_service = BillsPaymentService()
