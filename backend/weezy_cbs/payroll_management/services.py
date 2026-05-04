import os
import decimal
import uuid
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

logger = logging.getLogger(__name__)

class PayrollManagementService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_model = None

    def create_payroll_batch(self, db: Session, batch_in: schemas.PayrollBatchCreate) -> models.PayrollBatch:
        """Initializes a payroll batch and its items."""
        total_amt = sum(item.amount for item in batch_in.items)
        batch_ref = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        
        db_batch = models.PayrollBatch(
            batch_reference=batch_ref,
            corporate_customer_id=batch_in.corporate_customer_id,
            source_account_number=batch_in.source_account_number,
            total_amount=total_amt,
            item_count=len(batch_in.items),
            status=models.PayrollStatusEnum.AI_SCANNING
        )
        db.add(db_batch)
        db.flush()
        
        for item in batch_in.items:
            db_item = models.PayrollItem(
                batch_id=db_batch.id,
                **item.dict(),
                status="PENDING"
            )
            db.add(db_item)
            
        db.commit()
        db.refresh(db_batch)
        return db_batch

    async def run_ai_anomaly_detection(self, db: Session, batch_id: int):
        """Uses Gemini to scan the payroll batch for Nigerian market anomalies."""
        batch = db.query(models.PayrollBatch).filter(models.PayrollBatch.id == batch_id).first()
        if not batch or not self.ai_model:
            return

        # Prepare data for AI
        items_data = [
            {"name": item.recipient_name, "account": item.recipient_account, "amount": float(item.amount)}
            for item in batch.items
        ]

        prompt = f"""
        You are 'Weezy AI Auditor' for a Nigerian Bank.
        Analyze this payroll batch for anomalies typical in the Nigerian market:
        1. Ghost Workers: Duplicate account numbers with different names.
        2. Unusual Spikes: Employees getting paid significantly more than the average in this batch.
        3. Compliance: Valid NUBAN check (10 digits).
        
        PAYROLL DATA:
        {json.dumps(items_data)}
        
        Respond ONLY with a structured JSON object:
        {{
          "risk_score": 0-100,
          "anomalies": ["list of specific issues found"],
          "recommendation": "Approve" or "Investigate" or "Reject"
        }}
        """

        try:
            response = await self.ai_model.generate_content_async(prompt)
            result_text = response.text
            
            # Extract JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            
            report = json.loads(result_text)
            batch.ai_anomaly_report = report
            batch.ai_risk_score = report.get("risk_score", 0)
            batch.status = models.PayrollStatusEnum.AWAITING_APPROVAL
            db.commit()
            
        except Exception as e:
            logger.error(f"Payroll AI Analysis Error: {str(e)}")
            batch.status = models.PayrollStatusEnum.AWAITING_APPROVAL # Fallback to manual
            db.commit()

    async def execute_disbursement(self, db: Session, batch_id: int):
        """Processes all payments in a batch."""
        batch = db.query(models.PayrollBatch).filter(models.PayrollBatch.id == batch_id).first()
        if not batch or batch.status != models.PayrollStatusEnum.AWAITING_APPROVAL:
            return

        batch.status = models.PayrollStatusEnum.PROCESSING
        db.commit()

        # In a real system, this would be an async task queue (Celery/RabbitMQ)
        for item in batch.items:
            try:
                # 1. Deduct from Corporate Float, Credit Employee Account
                # (Simplified for MVP: assuming corporate has NUBAN 0000000000)
                txn_req = TransactionCreateRequest(
                    transaction_type="PAYROLL",
                    channel="CORPORATE_PORTAL",
                    amount=item.amount,
                    currency="NGN",
                    debit_account_number=batch.source_account_number or "0000000000", 
                    credit_account_number=item.recipient_account,
                    credit_bank_code=item.recipient_bank_code,
                    narration=f"Salary - {batch.batch_reference}"
                )
                
                txn = await initiate_transaction(db, txn_req)
                item.status = "SUCCESS"
                item.transaction_id = txn.id
            except Exception as e:
                item.status = "FAILED"
                item.error_message = str(e)
            
            db.commit()

        batch.status = models.PayrollStatusEnum.COMPLETED
        batch.processed_at = datetime.utcnow()
        db.commit()

payroll_service = PayrollManagementService()
