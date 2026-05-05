import logging
import os
import google.generativeai as genai
import json
import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class AutonomousPartnerOnboardingAgent:
    """
    Onboards a new Fintech partner in < 5 minutes via AI.
    Reviews their business description/API docs and provisions sandbox credentials.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def vet_and_onboard_partner(self, db: Session, partner_name: str, business_description: str, website_url: str) -> Dict[str, Any]:
        """
        Analyzes the partner's business model and provisions an APIServiceConfig if approved.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        prompt = f"""
        You are 'Weezy Compliance', an AI vetting new Fintech partners for API access.
        
        PARTNER APPLICATION:
        - Name: {partner_name}
        - Website: {website_url}
        - Business Model: {business_description}
        
        TASK:
        1. Vet the business model. Is it a high-risk sector (e.g., unregulated crypto, gambling)?
        2. Decide to 'APPROVE' or 'REJECT' for Sandbox access.
        
        Format as JSON:
        {{
            "decision": "APPROVE" | "REJECT",
            "risk_level": "LOW" | "MEDIUM" | "HIGH",
            "reasoning": "string"
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            decision_data = json.loads(clean_json)
            
            if decision_data.get("decision") == "APPROVE":
                from weezy_cbs.third_party_fintech_integration.models import APIServiceConfig, APIServiceAuthMethodEnum
                
                # Provision Sandbox API Config
                api_key_plain = f"wzy_test_{uuid.uuid4().hex}"
                
                new_service = APIServiceConfig(
                    service_name=f"{partner_name.upper().replace(' ', '_')}_SANDBOX",
                    service_type="FINTECH_PARTNER",
                    base_url=website_url,
                    auth_method=APIServiceAuthMethodEnum.API_KEY,
                    is_active=True,
                    is_sandbox=True,
                    # We would encrypt this in a real scenario
                    api_key_encrypted=api_key_plain 
                )
                db.add(new_service)
                db.commit()
                db.refresh(new_service)
                
                logger.info(f"PARTNER: Automatically onboarded {partner_name} for Sandbox.")
                return {
                    "status": "ONBOARDED_SUCCESSFULLY",
                    "partner_id": new_service.id,
                    "sandbox_api_key": api_key_plain,
                    "risk_assessment": decision_data
                }
            else:
                logger.warning(f"PARTNER: Rejected {partner_name}. Reason: {decision_data['reasoning']}")
                return {
                    "status": "APPLICATION_REJECTED",
                    "reason": decision_data["reasoning"]
                }
                
        except Exception as e:
            logger.error(f"Partner Onboarding Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

partner_onboarding_agent = AutonomousPartnerOnboardingAgent()
