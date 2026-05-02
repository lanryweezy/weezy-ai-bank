import os
import json
import logging
import decimal
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.customer_identity_management.models import Customer
from weezy_cbs.transaction_management.models import FinancialTransaction

logger = logging.getLogger(__name__)

class FraudShieldService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-1.5-flash') # Using flash for faster real-time latency
        else:
            self.ai_model = None

    async def screen_transaction(self, db: Session, customer_id: int, txn_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Real-time AI screening of a transaction before final ledger posting.
        Returns block/allow decision.
        """
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer or not self.ai_model:
            return {"decision": "ALLOW", "risk_score": 0}

        # 1. Gather Context (Recent patterns)
        # In a real app, we'd fetch velocity metrics (e.g. 5 txns in last 10 mins)
        
        prompt = f"""
        You are 'Weezy Fraud Shield', a real-time transaction monitor for a Nigerian bank.
        Analyze this pending transaction for fraud (Social Engineering, Account Takeover, Money Laundering):
        
        CUSTOMER: {customer.first_name} {customer.last_name}, Tier {customer.account_tier}
        TXN: ₦{txn_data.get('amount'):,.2f} to {txn_data.get('credit_account_name')} ({txn_data.get('credit_bank_code')})
        CHANNEL: {txn_data.get('channel')}
        
        NIGERIAN FRAUD CONTEXT:
        - Social Engineering: Unusual round sums sent to digital banks (OPay/Moniepoint/Kuda) by older customers.
        - Velocity: Rapid high-value outflows from Tier 1 accounts.
        - Domiciliary: Sudden large swaps and outflows.
        
        Respond ONLY with a structured JSON:
        {{
          "decision": "ALLOW" | "FLAG" | "BLOCK",
          "risk_score": 0-100,
          "reasoning": "Brief explanation",
          "is_fraud": true/false
        }}
        """

        try:
            response = await self.ai_model.generate_content_async(prompt)
            result_text = response.text
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            
            report = json.loads(result_text)
            
            # 2. Log Alert if not ALLOWed
            if report["decision"] != "ALLOW":
                alert = models.FraudAlert(
                    customer_id=customer_id,
                    risk_score=float(report["risk_score"]),
                    risk_level=self._get_level(report["risk_score"]),
                    ai_analysis_report=report,
                    status=models.FraudStatusEnum.PENDING_REVIEW
                )
                db.add(alert)
                db.commit()
            
            return report
            
        except Exception as e:
            logger.error(f"Fraud Shield AI Error: {str(e)}")
            return {"decision": "ALLOW", "risk_score": 10} # Fail open for UX, but log

    def _get_level(self, score: float) -> models.FraudRiskLevelEnum:
        if score >= 90: return models.FraudRiskLevelEnum.CRITICAL
        if score >= 70: return models.FraudRiskLevelEnum.HIGH
        if score >= 40: return models.FraudRiskLevelEnum.MEDIUM
        return models.FraudRiskLevelEnum.LOW

    def update_alert_decision(self, db: Session, alert_id: int, decision: models.FraudStatusEnum, user_id: int, notes: str):
        alert = db.query(models.FraudAlert).filter(models.FraudAlert.id == alert_id).first()
        if not alert:
            raise Exception("Alert not found")
            
        alert.status = decision
        alert.decision_by_user_id = user_id
        alert.decision_notes = notes
        db.commit()
        return alert

fraud_shield_service = FraudShieldService()
