import logging
import os
import google.generativeai as genai
import json
from typing import Dict, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class RealTimePNLAgent:
    """
    A voice-controlled CFO that can answer "What is our exact profit?" 
    in real-time by analyzing income and expense GLs.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def generate_cfo_report(self, db: Session, user_query: str = "Give me a quick P&L summary.") -> str:
        """
        Reads the GL balances and generates a natural language CFO summary.
        """
        if not self.model: return "AI CFO is offline."
        
        from weezy_cbs.accounts_ledger_management.models import GeneralLedgerAccount, GLAccountTypeEnum
        
        # 1. Fetch Income and Expense GLs
        income_gls = db.query(GeneralLedgerAccount).filter(GeneralLedgerAccount.account_type == GLAccountTypeEnum.INCOME).all()
        expense_gls = db.query(GeneralLedgerAccount).filter(GeneralLedgerAccount.account_type == GLAccountTypeEnum.EXPENSE).all()
        
        total_income = sum([float(gl.current_balance) for gl in income_gls])
        total_expense = sum([float(gl.current_balance) for gl in expense_gls])
        net_profit = total_income - total_expense
        
        # Breakdowns
        income_breakdown = {gl.name: float(gl.current_balance) for gl in income_gls if gl.current_balance > 0}
        expense_breakdown = {gl.name: float(gl.current_balance) for gl in expense_gls if gl.current_balance > 0}

        prompt = f"""
        You are 'Weezy CFO', the AI Chief Financial Officer.
        The CEO just asked you: "{user_query}"
        
        REAL-TIME FINANCIAL DATA (NGN):
        - Total Income: {total_income:,.2f}
        - Total Expenses: {total_expense:,.2f}
        - Net Profit: {net_profit:,.2f}
        
        - Income Drivers: {json.dumps(income_breakdown)}
        - Expense Drivers: {json.dumps(expense_breakdown)}
        
        TASK:
        Give a sharp, professional 2-paragraph verbal briefing. 
        Don't just read the numbers, interpret them (e.g., "Our margins are healthy, driven by X").
        Assume the role of a hyper-competent Fintech CFO.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"P&L Agent Error: {str(e)}")
            return f"Error compiling CFO report: {str(e)}"

realtime_pnl_agent = RealTimePNLAgent()
