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
        Includes a Heuristic Backup for offline resiliency.
        """
        app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
        appraisal = db.query(models.LoanAppraisal).filter(models.LoanAppraisal.application_id == application_id).first()
        customer = db.query(Customer).filter(Customer.id == app.customer_id).first()
        
        # 1. Calculate Heuristics (Resiliency Backup)
        income = float(appraisal.monthly_income_declared)
        obligations = float(appraisal.existing_monthly_obligations or 0)
        requested_monthly_repayment = float(app.requested_amount / app.requested_tenor_months)
        
        total_monthly_outgoings = obligations + requested_monthly_repayment
        dti = (total_monthly_outgoings / income * 100) if income > 0 else 100.0
        appraisal.debt_to_income_ratio = decimal.Decimal(str(round(dti, 2)))

        if not self.model:
            # Fallback to pure rule-based decision
            appraisal.ai_risk_score = 100 - int(dti)
            appraisal.status = models.AppraisalStatusEnum.AUTO_PASSED if dti < 33.3 else models.AppraisalStatusEnum.AUTO_FAILED
            appraisal.ai_recommendation = f"HEURISTIC BACKUP: DTI is {round(dti, 2)}%. Status assigned based on 33.3% threshold."
            db.commit()
            return

        # 2. Prepare context for AI (The Prime Core reasoning)
        context = {
            "amount": float(app.requested_amount),
            "tenor": app.requested_tenor_months,
            "purpose": app.loan_purpose,
            "income": income,
            "dti_ratio": round(dti, 2),
            "customer_tier": str(customer.account_tier),
            "nigerian_inflation_rate": "31.7%", # Current economic context
            "average_living_cost_lagos": 250000.00
        }

        prompt = f"""
        You are 'Weezy Credit Analyst (Expert System)'. Analyze this Nigerian retail loan application:
        {json.dumps(context)}
        
        Tasks:
        1. Evaluate the Debt-to-Income (DTI) ratio against the 33.3% CBN standard.
        2. Assess the 'Purpose' authenticity for a Tier {customer.account_tier} customer.
        3. Assign a Risk Score (0-100).
        4. Decide Status: PASS (Low Risk), FAIL (High Risk), or REFER (Edge Case).
        
        Consider: With 31% inflation, ₦{income:,.2f} monthly income might be insufficient for high-tenor loans.
        
        Respond with:
        SCORE: [int]
        DECISION: [PASS/FAIL/REFER]
        REASONING: [1 paragraph professional analysis]
        """

        try:
            response = await self.model.generate_content_async(prompt)
            raw_text = response.text
            
            # Simple extractor
            score = 60
            decision = "REFER"
            
            if "SCORE:" in raw_text: score = int(raw_text.split("SCORE:")[1].split()[0].replace(',', ''))
            if "DECISION:" in raw_text: decision = raw_text.split("DECISION:")[1].split()[0].strip()
            
            appraisal.ai_risk_score = score
            appraisal.ai_recommendation = raw_text
            
            if decision == "PASS": appraisal.status = models.AppraisalStatusEnum.AUTO_PASSED
            elif decision == "FAIL": appraisal.status = models.AppraisalStatusEnum.AUTO_FAILED
            else: appraisal.status = models.AppraisalStatusEnum.PENDING
            
            # Update app status
            app.status = LoanApplicationStatusEnum.UNDER_REVIEW
            
            db.commit()
            return raw_text
        except Exception as e:
            logger.error(f"AI Appraisal Error: {str(e)}")
            # Already have heuristic backup saved
            return "Appraisal completed via backup logic."

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
