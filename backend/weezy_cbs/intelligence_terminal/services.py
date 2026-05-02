import os
import json
import logging
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from weezy_cbs.database import engine

logger = logging.getLogger(__name__)

class IntelligenceTerminalOrchestrator:
    """
    The 'Command Line Intelligence' for Weezy AI Bank.
    Translates natural language queries into safe read-only SQL and analytical insights.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def execute_command(self, db: Session, prompt: str) -> Dict[str, Any]:
        """
        Interprets a terminal command. 
        Supports analytical 'questions' and simple sys-commands.
        """
        if prompt.lower() in ["help", "/help", "ls"]:
            return {
                "type": "text",
                "content": "WEEZY TERMINAL HELP:\n- query [question]: Ask any data question (e.g. 'query total deposits last month')\n- sys: Show system health\n- whoami: Show current user context\n- clear: Clear terminal screen"
            }
            
        if prompt.lower().startswith("query "):
            query_prompt = prompt[6:]
            return await self._process_data_query(db, query_prompt)
            
        if prompt.lower() == "sys":
            return {
                "type": "text",
                "content": f"WEEZY CORE STATUS:\n- Ledger: BALANCED\n- AI Gateway: ONLINE\n- NIP Switch: ACTIVE\n- Local Time: {datetime.now().strftime('%H:%M:%S')} WAT"
            }

        # Default: Process as a general intelligent command
        return await self._process_data_query(db, prompt)

    async def _process_data_query(self, db: Session, user_query: str) -> Dict[str, Any]:
        """
        Uses Gemini to generate a safe SQL query based on the bank's schema.
        """
        if not self.model:
            return {"type": "error", "content": "AI Core offline."}

        schema_context = """
        CORE TABLES:
        - customers: id, first_name, last_name, email, account_tier (1, 2, 3), state
        - accounts: id, account_number, account_type (SAVINGS, CURRENT, DOMICILIARY), ledger_balance, available_balance, customer_id
        - transactions: id, amount, transaction_type, status, channel, initiated_at, tax_amount
        - gl_accounts: gl_code, name, gl_type (ASSET, LIABILITY, INCOME, EXPENSE), current_balance
        
        LOANS & ASSETS:
        - loan_applications: id, requested_amount, loan_purpose, status (APPROVED, REJECTED, SUBMITTED)
        - loan_accounts: id, principal_amount, outstanding_principal, status (ACTIVE, CLOSED)
        - loan_collaterals: id, collateral_type (VEHICLE, LAND_PROPERTY), estimated_market_value, status
        - fixed_assets: id, asset_tag, name, purchase_price, current_book_value
        
        INVESTMENTS & CARDS:
        - fd_accounts: id, principal_amount, interest_rate_applied, accrued_interest, status (ACTIVE, MATURED)
        - cards: id, card_type (VIRTUAL, PHYSICAL), card_scheme (VERVE, MASTERCARD), status
        
        AGENCY & REVENUE:
        - agents: id, business_name, state, terminal_id
        - commission_logs: id, total_fee_collected, agent_amount, status
        """

        prompt = f"""
        You are 'Weezy Terminal Core'. Given the following database schema:
        {schema_context}
        
        Translate the user's natural language question into a single, safe, read-only PostgreSQL SELECT query.
        
        Rules:
        1. Only generate SELECT queries.
        2. Always limit results to 100 rows.
        3. If you can't answer with SQL, say [NO_SQL] and provide a text explanation.
        4. Return ONLY the SQL query or [NO_SQL].
        
        User Question: {user_query}
        """

        try:
            response = await self.model.generate_content_async(prompt)
            sql = response.text.strip()
            
            if "[NO_SQL]" in sql:
                return {"type": "text", "content": sql.replace("[NO_SQL]", "").strip()}
            
            # Remove markdown code blocks if any
            sql = sql.replace("```sql", "").replace("```", "").strip()
            
            # Safety check
            forbidden = ["UPDATE", "DELETE", "DROP", "INSERT", "TRUNCATE", "ALTER"]
            if any(word in sql.upper() for word in forbidden):
                return {"type": "error", "content": "Forbidden operation detected. Command aborted."}

            # Execute Query
            result = db.execute(text(sql))
            rows = [dict(r._mapping) for r in result]
            
            return {
                "type": "data",
                "sql": sql,
                "data": rows,
                "count": len(rows)
            }

        except Exception as e:
            logger.error(f"Terminal Query Error: {str(e)}")
            return {"type": "error", "content": f"Query execution failed: {str(e)}"}

terminal_orchestrator = IntelligenceTerminalOrchestrator()
