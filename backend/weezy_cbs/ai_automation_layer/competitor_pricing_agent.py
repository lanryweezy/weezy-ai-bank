import logging
import os
import google.generativeai as genai
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)

class CompetitorAwarePricingAgent:
    """
    AI that monitors other Nigerian banks and adjusts Weezy's 
    interest rates to always be the most attractive within safe margins.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def optimize_loan_pricing(self, db: Session) -> Dict[str, Any]:
        """
        Simulates gathering market data and adjusts active Loan Products.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        from weezy_cbs.loan_management_module.models import LoanProduct
        
        active_products = db.query(LoanProduct).filter(LoanProduct.is_active == True).all()
        if not active_products: return {"status": "NO_PRODUCTS"}
        
        # 1. Gather Weezy's current rates
        current_rates = [{"id": p.id, "name": p.name, "rate_pa": float(p.interest_rate_pa)} for p in active_products]
        
        # 2. Ask Gemini to act as a Market Analyst
        prompt = f"""
        You are 'Weezy Market Intel', an AI monitoring the Nigerian banking sector.
        
        CURRENT WEEZY LOAN RATES:
        {json.dumps(current_rates)}
        
        MARKET DATA (Simulated):
        - CBN MPR (Monetary Policy Rate) recently increased by 0.5%.
        - Kuda Bank and Opay are offering personal loans at ~24% PA.
        - GTBank is at 26% PA.
        
        GOAL: We want to undercut the digital competitors slightly while accounting for the MPR hike to maintain margins.
        
        Provide the NEW optimized interest rate (PA) for each Weezy product.
        Format as JSON array:
        [
            {{"id": int, "new_rate_pa": float, "reasoning": "string"}}
        ]
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            optimized_rates = json.loads(clean_json)
            
            # 3. Apply the new rates to the database
            for update in optimized_rates:
                product = db.query(LoanProduct).filter(LoanProduct.id == update["id"]).first()
                if product:
                    old_rate = product.interest_rate_pa
                    product.interest_rate_pa = update["new_rate_pa"]
                    logger.info(f"PRICING: Adjusted {product.name} from {old_rate}% to {product.interest_rate_pa}%. Reason: {update['reasoning']}")
            
            db.commit()
            
            return {
                "status": "PRICING_OPTIMIZED",
                "updates_applied": optimized_rates
            }
            
        except Exception as e:
            logger.error(f"Pricing Agent Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

pricing_agent = CompetitorAwarePricingAgent()
