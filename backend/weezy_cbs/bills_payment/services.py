import decimal
import random
import string
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

import logging

logger = logging.getLogger(__name__)

class BillerRouter:
    """
    Intelligent routing for bill payments across multiple Nigerian aggregators.
    Tracks provider health and routes transactions to the most stable node.
    """
    PROVIDERS = ["PAYSTACK", "INTERSWITCH", "REMITA"]
    
    def __init__(self):
        # Simulated health/uptime stats (0.0 to 1.0)
        self.health_scores = {p: 1.0 for p in self.PROVIDERS}

    def get_best_provider(self, category: models.BillerCategoryEnum) -> str:
        """Routes to the provider with the highest current health score."""
        # Policy: Remita is the primary gateway for GOVERNMENT categories (TSA)
        if category == models.BillerCategoryEnum.GOVERNMENT:
            return "REMITA"
            
        # Select healthiest available node
        sorted_providers = sorted(self.health_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_providers[0][0]

    def report_failure(self, provider: str):
        self.health_scores[provider] = max(0.0, self.health_scores[provider] - 0.2)
        logger.warning(f"ROUTER: Provider {provider} health degraded to {self.health_scores[provider]}")

    def report_success(self, provider: str):
        self.health_scores[provider] = min(1.0, self.health_scores[provider] + 0.05)

biller_router = BillerRouter()

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
            {"name": "FIRS Tax", "code": "FIRS_TAX", "cat": models.BillerCategoryEnum.GOVERNMENT, "val": True},
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
        Executes a bill payment with multi-provider fallback routing.
        """
        biller = db.query(models.Biller).filter(models.Biller.biller_code == request.biller_code).first()
        if not biller:
            raise HTTPException(status_code=404, detail="Biller not found")

        # 1. Route to Best Provider
        provider = biller_router.get_best_provider(biller.category)
        logger.info(f"BILLER: Routing {biller.name} payment via {provider}")

        # 2. Execute Ledger Transaction
        try:
            txn_req = TransactionCreateRequest(
                transaction_type="BILL_PAYMENT",
                channel="MOBILE_APP",
                amount=request.amount,
                currency="NGN",
                debit_account_number=request.account_number,
                credit_account_number="GL-BILLER-SETTLE-001", 
                narration=request.narration or f"Bill: {biller.name} ({provider})"
            )
            
            txn = await initiate_transaction(db, txn_req)
            
            # 3. Call Provider API (Simulated)
            provider_ref = f"{provider[:3]}-{random.randint(1000000, 9999999)}"
            biller_router.report_success(provider)
            
            token = None
            if biller.category == models.BillerCategoryEnum.ELECTRICITY:
                token = "-".join(["".join(random.choices(string.digits, k=4)) for _ in range(5)])

            # 4. Log the successful bill payment
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
                "provider": provider,
                "provider_reference": provider_ref,
                "token": token,
                "biller_name": biller.name
            }

        except Exception as e:
            biller_router.report_failure(provider)
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Bill payment failed: {str(e)}")

class RemitaTSAService:
    """
    Handles Treasury Single Account (TSA) payments via Remita for corporate clients.
    """
    GOVERNMENT_TSA_GL = "GL-LIAB-TSA-GOVT-001"

    async def initiate_tsa_payment(self, db: Session, corporate_customer_id: int, account_number: str, amount: decimal.Decimal, service_type: str) -> Dict[str, Any]:
        """
        Simulates the generation of an RRR and immediate TSA settlement.
        """
        # 1. Generate a Mock RRR (12 digits)
        rrr = "".join(random.choices(string.digits, k=12))
        
        # 2. Execute Transaction (Double Entry)
        txn_req = TransactionCreateRequest(
            transaction_type="GOVT_PAYMENT_TSA",
            channel="AGENT_PORTAL",
            amount=amount,
            currency="NGN",
            debit_account_number=account_number,
            credit_account_number=self.GOVERNMENT_TSA_GL,
            narration=f"TSA Payment: {service_type} | RRR: {rrr}"
        )
        
        try:
            txn = await initiate_transaction(db, txn_req)
            return {
                "status": "SUCCESS",
                "rrr": rrr,
                "transaction_id": txn.id,
                "amount": float(amount),
                "service_type": service_type,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"TSA Payment Failed: {str(e)}")

tsa_service = RemitaTSAService()
bills_service = BillsPaymentService()

