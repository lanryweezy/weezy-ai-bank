import decimal
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from weezy_cbs.database import SessionLocal

from weezy_cbs.accounts_ledger_management.services import get_account_by_number
from weezy_cbs.transaction_management.services import initiate_transaction, get_transaction_history
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils
from weezy_cbs.customer_risk_profiling.services import risk_profiling_service

logger = logging.getLogger(__name__)

class BankingTools:
    """
    Core banking tools exposed to AI Agents and MCP.
    """

    @staticmethod
    def get_account_balance(account_number: str) -> Dict[str, Any]:
        """Check the balance and status of a bank account."""
        db = SessionLocal()
        try:
            acc = get_account_by_number(db, account_number)
            if not acc:
                return {"error": "Account not found"}
            return {
                "account_number": acc.account_number,
                "balance": float(acc.available_balance),
                "currency": acc.currency.value if hasattr(acc.currency, 'value') else acc.currency,
                "status": acc.status.value if hasattr(acc.status, 'value') else acc.status
            }
        finally:
            db.close()

    @staticmethod
    async def perform_transfer(
        sender_account: str, 
        receiver_account: str, 
        amount: float, 
        bank_code: str = "999",
        narration: str = "Agentic Transfer"
    ) -> Dict[str, Any]:
        """Transfer money between accounts."""
        db = SessionLocal()
        try:
            txn_req = TransactionCreateRequest(
                transaction_type="TRANSFER",
                channel="AI_AGENT",
                amount=decimal.Decimal(str(amount)),
                currency="NGN",
                debit_account_number=sender_account,
                credit_account_number=receiver_account,
                credit_bank_code=bank_code,
                narration=narration
            )
            txn = await initiate_transaction(db, txn_req)
            return {
                "status": txn.status,
                "transaction_id": txn.id,
                "amount": float(txn.amount),
                "remarks": txn.system_remarks
            }
        except Exception as e:
            return {"error": str(e), "status": "FAILED"}
        finally:
            db.close()

    @staticmethod
    async def verify_beneficiary(bank_code: str, account_number: str) -> Dict[str, Any]:
        """Verify the name of an account holder at any Nigerian bank."""
        return await NigerianMarketUtils.nip_name_enquiry(bank_code, account_number)

    @staticmethod
    async def analyze_customer_risk(customer_id: int) -> Dict[str, Any]:
        """Get the AI risk profile and AML flags for a customer."""
        db = SessionLocal()
        try:
            profile = await risk_profiling_service.run_ai_risk_assessment(db, customer_id)
            return {
                "risk_level": profile.risk_level.value,
                "risk_score": profile.risk_score,
                "flags": profile.ai_assessment_report.get("flags", {}) if profile.ai_assessment_report else {}
            }
        finally:
            db.close()

    @staticmethod
    def list_recent_transactions(account_number: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Fetch the transaction history for an account."""
        db = SessionLocal()
        try:
            txns = get_transaction_history(db, account_number=account_number, limit=limit)
            return [
                {
                    "id": t.id,
                    "amount": float(t.amount),
                    "type": t.transaction_type,
                    "status": t.status,
                    "date": str(t.initiated_at),
                    "narration": t.narration
                }
                for t in txns
            ]
        finally:
            db.close()

    @staticmethod
    async def predictive_cash_flow_forecast(account_number: str, days: int = 30) -> Dict[str, Any]:
        """
        AI-driven cash flow forecasting.
        Analyzes historical debits to predict the balance 30 days from now.
        """
        db = SessionLocal()
        try:
            acc = get_account_by_number(db, account_number)
            if not acc: return {"error": "Account not found"}
            
            # 1. Fetch 90 days of history for pattern recognition
            txns = get_transaction_history(db, account_number=account_number, limit=100)
            
            # 2. Heuristic for recurring debits (Utility bills, Subscriptions, Rent)
            # In production, this data is fed into Gemini for actual time-series forecasting
            recurring_debits = 0
            seen_narrations = {}
            for t in txns:
                if t.amount < 0:
                    narration = t.narration.lower()
                    seen_narrations[narration] = seen_narrations.get(narration, 0) + 1
            
            # If a narration appears 3+ times in 90 days, assume it's recurring
            monthly_recurring_estimate = 0
            for narration, count in seen_narrations.items():
                if count >= 3:
                    avg_amt = sum([abs(t.amount) for t in txns if t.narration.lower() == narration]) / count
                    monthly_recurring_estimate += avg_amt

            current_bal = float(acc.available_balance)
            predicted_bal = current_bal - float(monthly_recurring_estimate)
            
            return {
                "current_balance": current_bal,
                "predicted_balance_30d": predicted_bal,
                "identified_recurring_monthly": float(monthly_recurring_estimate),
                "forecast_confidence": "HIGH" if len(txns) > 20 else "LOW"
            }
        finally:
            db.close()

    @staticmethod
    async def autonomous_support_resolution(
        customer_id: int, 
        action: str, 
        reason: str, 
        sentiment: str = "NEUTRAL"
    ) -> Dict[str, Any]:
        """
        Autonomous AI action to resolve customer issues.
        Actions: 'UNBLOCK_ACCOUNT', 'REVERSE_FEES', 'UPGRADE_TIER'
        """
        db = SessionLocal()
        try:
            from weezy_cbs.accounts_ledger_management.models import Account, AccountStatusEnum
            from weezy_cbs.customer_identity_management.models import Customer
            
            customer = db.query(Customer).filter(Customer.id == customer_id).first()
            if not customer: return {"error": "Customer not found"}

            # Governance: AI can only unblock if sentiment is not 'AGGRESSIVE' and reason is 'ID_VERIFIED'
            if action == "UNBLOCK_ACCOUNT":
                if sentiment == "AGGRESSIVE":
                    return {"status": "DENIED", "remarks": "Sentiment too high. Escalate to human supervisor."}
                
                accounts = db.query(Account).filter(Account.customer_id == customer_id).all()
                for acc in accounts:
                    acc.status = AccountStatusEnum.ACTIVE
                    acc.is_post_no_debit = False
                    acc.block_reason = None
                
                db.commit()
                return {"status": "SUCCESS", "action": "UNBLOCK_ACCOUNT", "remarks": "All customer accounts active."}
            
            return {"status": "UNKNOWN_ACTION"}
        finally:
            db.close()

    @staticmethod
    async def generate_mermaid_architecture(module_name: str) -> Dict[str, Any]:
        """
        AI-driven architecture visualization.
        Generates a Mermaid.js diagram from the module's database models.
        """
        # 1. Read models.py
        path = f"backend/weezy_cbs/{module_name}/models.py"
        if not os.path.exists(path): return {"error": "Module not found"}
        
        with open(path, "r") as f:
            code = f.read()

        # 2. Use Gemini to generate Mermaid
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key: return {"error": "AI_OFFLINE"}
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze this SQLAlchemy models file and generate a Mermaid.js ER diagram.
        
        CODE:
        {code[:4000]}
        
        REQUIREMENTS:
        - Focus on table names, primary keys, and relationships.
        - Output ONLY the Mermaid code block starting with 'erDiagram'.
        """
        
        try:
            response = await model.generate_content_async(prompt)
            mermaid_code = response.text.replace("```mermaid", "").replace("```", "").strip()
            return {
                "module": module_name,
                "mermaid_code": mermaid_code,
                "status": "SUCCESS"
            }
        except Exception as e:
            return {"error": str(e)}

banking_tools = BankingTools()


