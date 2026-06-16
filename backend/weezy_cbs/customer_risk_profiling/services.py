import os
import decimal
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.customer_identity_management.models import Customer
from weezy_cbs.accounts_ledger_management.services import get_accounts_by_customer_id
from weezy_cbs.transaction_management.services import get_transactions_for_account

logger = logging.getLogger(__name__)

class CustomerRiskProfilingService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_model = None

    async def get_or_create_risk_profile(self, db: Session, customer_id: int) -> models.CustomerRiskProfile:
        profile = db.query(models.CustomerRiskProfile).filter(models.CustomerRiskProfile.customer_id == customer_id).first()
        if not profile:
            profile = models.CustomerRiskProfile(customer_id=customer_id)
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    async def run_ai_risk_assessment(self, db: Session, customer_id: int) -> models.CustomerRiskProfile:
        """
        Gathers comprehensive customer data and uses Gemini to assign a risk score.
        """
        profile = await self.get_or_create_risk_profile(db, customer_id)
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        
        if not customer or not self.ai_model:
            return profile

        # 1. Gather Context
        accounts = get_accounts_by_customer_id(db, customer_id)
        txn_data = []
        for acc in accounts:
            txns = get_transactions_for_account(db, acc.account_number, limit=20)
            txn_data.extend([
                {"amount": float(t.amount), "type": t.transaction_type, "narration": t.narration, "date": str(t.initiated_at)}
                for t in txns
            ])

        customer_summary = {
            "name": f"{customer.first_name} {customer.last_name}",
            "tier": str(customer.account_tier),
            "bvn_verified": bool(customer.bvn),
            "nin_verified": bool(customer.nin),
            "transaction_count": len(txn_data),
            "recent_transactions": txn_data
        }

        # 2. AI Prompt (Nigerian AML Context)
        prompt = f"""
        You are an 'Anti-Money Laundering (AML) Officer' for a Nigerian Bank.
        Analyze this customer data for financial risk based on CBN AML/CFT guidelines:
        
        CUSTOMER DATA:
        {json.dumps(customer_summary)}
        
        NIGERIAN AML CONTEXT:
        - Tier 1: High risk if transaction volume exceeds ₦50k/day.
        - BVN/NIN: Absence of verified ID is a risk factor.
        - Transaction Velocity: Rapid movements of large round sums (e.g. ₦1M+) without clear business purpose.
        
        Respond ONLY with a structured JSON object:
        {{
          "risk_score": 0-100,
          "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          "reasoning": ["list of factors"],
          "flags": {{
            "is_pep": false,
            "unusual_velocity": true/false,
            "sanction_hit": false
          }},
          "recommendation": "Maintain" | "Enhanced Due Diligence" | "Suspend"
        }}
        """

        try:
            response = await self.ai_model.generate_content_async(prompt)
            result_text = response.text
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            
            report = json.loads(result_text)
            
            # 3. Update Profile
            profile.risk_level = models.RiskLevelEnum[report["risk_level"]]
            profile.risk_score = float(report["risk_score"])
            profile.ai_assessment_report = report
            profile.is_pep = report["flags"]["is_pep"]
            profile.unusual_transaction_velocity = report["flags"]["unusual_velocity"]
            profile.last_assessment_date = datetime.utcnow()
            
            # Log event if risk is elevated
            if profile.risk_level in [models.RiskLevelEnum.HIGH, models.RiskLevelEnum.CRITICAL]:
                event = models.RiskEvent(
                    risk_profile_id=profile.id,
                    event_type="ELEVATED_RISK_DETECTED",
                    description=f"AI assigned high risk: {', '.join(report['reasoning'])}",
                    severity=profile.risk_level
                )
                db.add(event)
            
            db.commit()
            db.refresh(profile)
            return profile
            
        except Exception as e:
            logger.error(f"Risk Assessment AI Error: {str(e)}")
            return profile

risk_profiling_service = CustomerRiskProfilingService()
