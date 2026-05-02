import uuid
import logging
import json
import os
import google.generativeai as genai
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.loan_management_module.models import LoanApplication, LoanProduct, LoanApplicationStatusEnum
from weezy_cbs.customer_identity_management.models import Customer

logger = logging.getLogger(__name__)

class LoanOriginationService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    def submit_application(self, db: Session, customer_id: int, req: schemas.LoanApplicationSubmission) -> LoanApplication:
        ref = f"LN-{uuid.uuid4().hex[:10].upper()}"
        
        # 1. Create Base Application (Link to existing module)
        app = LoanApplication(
            application_reference=ref,
            customer_id=customer_id,
            loan_product_id=req.product_id,
            requested_amount=req.amount,
            requested_tenor_months=req.tenor_months,
            loan_purpose=req.purpose,
            status=LoanApplicationStatusEnum.SUBMITTED
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        
        # 2. Create Appraisal record
        appraisal = models.LoanAppraisal(
            application_id=app.id,
            monthly_income_declared=req.monthly_income,
            status=models.AppraisalStatusEnum.PENDING
        )
        db.add(appraisal)
        db.commit()
        
        return app

    async def run_ai_appraisal(self, db: Session, application_id: int):
        """
        Uses Gemini to analyze the application, documents (metadata), and context
        to provide a risk score and recommendation.
        """
        app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
        appraisal = db.query(models.LoanAppraisal).filter(models.LoanAppraisal.application_id == application_id).first()
        customer = db.query(Customer).filter(Customer.id == app.customer_id).first()
        
        if not self.model:
            return "AI offline."

        # Prepare context for AI
        context = {
            "amount": float(app.requested_amount),
            "tenor": app.requested_tenor_months,
            "purpose": app.loan_purpose,
            "income": float(appraisal.monthly_income_declared),
            "customer_tier": str(customer.account_tier),
            "bvn_verified": True # Assuming
        }

        prompt = f"""
        You are 'Weezy Credit Analyst'. Analyze this Nigerian retail loan application:
        {json.dumps(context)}
        
        Calculate:
        1. Debt-to-Income (DTI) Ratio (Assume ₦0 current obligations if not provided).
        2. Risk Score (0-100, where 100 is perfect).
        3. Recommendation: PASS, FAIL, or REFER.
        
        Provide a 1-paragraph justification focusing on the Nigerian economic context.
        """

        try:
            response = await self.model.generate_content_async(prompt)
            raw_text = response.text
            
            # Simplified parsing (in prod use structured output)
            score = 75 # Default for demo
            if "Risk Score:" in raw_text:
                try: score = int(raw_text.split("Risk Score:")[1].split()[0])
                except: pass
            
            appraisal.ai_risk_score = score
            appraisal.ai_recommendation = raw_text
            appraisal.status = models.AppraisalStatusEnum.AUTO_PASSED if score > 60 else models.AppraisalStatusEnum.AUTO_FAILED
            
            # Update app status
            app.status = LoanApplicationStatusEnum.UNDER_REVIEW
            
            db.commit()
            return raw_text
        except Exception as e:
            logger.error(f"AI Appraisal Error: {str(e)}")
            return "Appraisal failed."

    def upload_document(self, db: Session, application_id: int, doc_in: schemas.LoanDocumentUpload):
        doc = models.LoanApplicationDocument(
            application_id=application_id,
            document_type=doc_in.document_type,
            file_name=doc_in.file_name,
            file_url=doc_in.file_url
        )
        db.add(doc)
        db.commit()
        return doc

origination_service = LoanOriginationService()
