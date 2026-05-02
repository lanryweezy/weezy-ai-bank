import decimal
import logging
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

banking_tools = BankingTools()
