import logging
import os
import google.generativeai as genai
import json
from typing import Dict, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class AutonomousEthicsEngine:
    """
    The 'Moral Compass' of the bank (Domain 10).
    Evaluates decisions (like loan approvals) against ethical guidelines,
    preventing predatory behavior even if it is mathematically profitable.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def evaluate_loan_ethics(self, db: Session, customer_data: Dict[str, Any], loan_terms: Dict[str, Any]) -> Dict[str, Any]:
        """
        Vetoes loans that are predatory or harmful to the customer's long-term survival.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        prompt = f"""
        You are 'Weezy Ethics', the Autonomous Ethics Engine of a Nigerian bank.
        Your prime directive is to protect vulnerable customers from predatory debt traps, 
        even if the loan model predicted profitability.
        
        CUSTOMER PROFILE:
        {json.dumps(customer_data)}
        
        PROPOSED LOAN TERMS:
        {json.dumps(loan_terms)}
        
        ETHICAL GUIDELINES:
        1. Debt-to-Income (DTI): If the monthly repayment exceeds 40% of their estimated monthly income, it is predatory.
        2. Vulnerability: If the customer relies heavily on unpredictable inflows (gig work) and the tenor is too short (< 30 days for large amounts), flag it.
        3. Interest Burden: If the total interest paid exceeds 30% of the principal for a micro-loan, it's exploitative.
        
        DECISION:
        Evaluate the ethics of this loan. 
        Format as JSON:
        {{
            "is_ethical": true/false,
            "ethical_violation": "string" (or null if ethical),
            "suggested_fair_terms": {{ "tenor": int, "rate": float }} (if unethical)
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            evaluation = json.loads(clean_json)
            
            if not evaluation.get("is_ethical"):
                logger.critical(f"ETHICS ENGINE VETO: Loan for Customer {customer_data.get('id')} blocked. Violation: {evaluation.get('ethical_violation')}")
                
            return {
                "status": "EVALUATED",
                "evaluation": evaluation
            }
            
        except Exception as e:
            logger.error(f"Ethics Engine Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

ethics_engine = AutonomousEthicsEngine()
