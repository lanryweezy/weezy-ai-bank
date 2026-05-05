import logging
import os
import google.generativeai as genai
from typing import List

logger = logging.getLogger(__name__)

class CognitiveDocumentationAgent:
    """
    Scans the codebase and autonomously updates the CORE_BANKING_DOCUMENTATION.md.
    Ensures the documentation matches the actual Python/FastAPI implementation.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def self_document_system(self):
        """
        Reads core files and regenerates the documentation.
        """
        if not self.model: return
        
        # 1. Gather Code Snippets (Models and Services)
        core_paths = [
            "backend/weezy_cbs/accounts_ledger_management/models.py",
            "backend/weezy_cbs/transaction_management/models.py",
            "backend/weezy_cbs/customer_identity_management/models.py",
            "backend/weezy_cbs/nigerian_market_utils.py",
            "backend/weezy_cbs/cognitive_core/services.py"
        ]
        
        code_context = ""
        for path in core_paths:
            if os.path.exists(path):
                with open(path, "r") as f:
                    code_context += f"\n--- FILE: {path} ---\n{f.read()[:2000]}\n" # Limit per file

        # 2. Generate Documentation
        prompt = f"""
        You are 'Weezy Architect'. Your task is to update the 'CORE_BANKING_DOCUMENTATION.md'.
        The current version is outdated and mentions Node.js/Express.
        
        ACTUAL CODEBASE CONTEXT (PYTHON/FASTAPI):
        {code_context}
        
        INSTRUCTIONS:
        1. Rewrite the Tech Stack section to reflect Python 3.9, FastAPI, PostgreSQL (SQLAlchemy).
        2. Update the 'Key Features' to include Nigerian Localization (NUBAN, NIP, BVN, NIN, Stamp Duty).
        3. Describe the 'Cognitive Core' as the central AI orchestrator using Gemini.
        4. Maintain the professional, high-end 'Fintech Black' tone.
        5. Output the FULL Markdown content.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            new_doc = response.text
            
            # 3. Write back to file
            with open("frontend/CORE_BANKING_DOCUMENTATION.md", "w", encoding="utf-8") as f:
                f.write(new_doc)
                
            logger.info("DOCS: System self-documentation successful.")
        except Exception as e:
            logger.error(f"Documentation Agent Error: {str(e)}")

doc_agent = CognitiveDocumentationAgent()
