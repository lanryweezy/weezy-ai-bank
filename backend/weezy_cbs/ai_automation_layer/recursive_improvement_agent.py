import logging
import os
import google.generativeai as genai
import json
from typing import Dict, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class RecursiveImprovementAgent:
    """
    Self-Evolving AI (Domain 10).
    Reads its own codebase, identifies inefficiencies, and proposes 
    architectural or algorithmic improvements.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def analyze_and_propose_optimization(self, module_name: str) -> Dict[str, Any]:
        """
        Scans a specific python file and suggests code-level optimizations.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        path = f"backend/weezy_cbs/{module_name}/services.py"
        if not os.path.exists(path): return {"error": "Module not found"}
        
        with open(path, "r") as f:
            code = f.read()
            
        prompt = f"""
        You are 'Weezy Evolution', an AI designed to optimize the Core Banking System.
        Your goal is to achieve O(1) or O(log N) efficiency and perfect maintainability.
        
        CODE TO ANALYZE ({module_name}):
        {code[:5000]}  # Sliced for context limits
        
        TASK:
        1. Identify any blocking synchronous calls that should be asynchronous (asyncio).
        2. Identify N+1 query problems in SQLAlchemy.
        3. Suggest a specific architectural refactor (e.g., "Use Redis for caching this dictionary").
        
        Format as JSON:
        {{
            "module_health_score": int (1-100),
            "critical_bottlenecks": ["string"],
            "proposed_code_refactor": "Write the exact python snippet to replace the inefficient part"
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            optimization = json.loads(clean_json)
            
            logger.info(f"EVOLUTION: Generated optimization plan for {module_name}. Score: {optimization.get('module_health_score')}")
            
            # In a fully sentient state, the agent would use the `replace` tool or Git tools to actually 
            # commit this code on a new branch. For safety, it currently reports it.
            
            return {
                "status": "ANALYZED",
                "optimization_plan": optimization
            }
            
        except Exception as e:
            logger.error(f"Recursive Improvement Agent Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

evolution_agent = RecursiveImprovementAgent()
