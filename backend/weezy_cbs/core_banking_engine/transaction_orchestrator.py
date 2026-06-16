import decimal
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from weezy_cbs.accounts_ledger_management.services import post_double_entry_transaction
from weezy_cbs.fees_charges_commission_engine.services import calculate_nigerian_taxes
from weezy_cbs.accounts_ledger_management.models import CurrencyEnum

logger = logging.getLogger(__name__)

class TransactionOrchestrator:
    """
    Atomic Multi-Leg Transaction Engine for Weezy AI Bank.
    Orchestrates complex financial flows (Base Leg + Tax Legs + Fee Legs)
    ensuring 100% ledger integrity through single-transaction commits.
    """

    @staticmethod
    def process_multi_leg_transaction(
        db: Session,
        debit_account: str,
        credit_account: str,
        amount: decimal.Decimal,
        currency: CurrencyEnum,
        narration: str,
        txn_id: str,
        channel: str,
        apply_taxes: bool = True,
        fee_amount: decimal.Decimal = decimal.Decimal("0.00")
    ) -> Dict[str, Any]:
        """
        Executes a multi-leg transaction atomically.
        Legs included:
        1. Principal Transfer (Debit Sender -> Credit Receiver)
        2. Fee Leg (Debit Sender -> Credit Bank Fee GL)
        3. VAT on Fee (Debit Sender -> Credit FIRS VAT GL)
        4. Stamp Duty (Debit Sender -> Credit CBN Stamp Duty GL) - If amount > N10,000
        """
        try:
            # 1. Calculate Nigerian Taxes
            taxes = {"stamp_duty": decimal.Decimal("0.00"), "vat": decimal.Decimal("0.00"), "total_tax": decimal.Decimal("0.00")}
            if apply_taxes:
                taxes = calculate_nigerian_taxes(amount, fee_amount)

            # 2. Start Atomic Posting (auto_commit=False)
            
            # Leg A: Principal
            post_double_entry_transaction(
                db=db,
                debit_account_number=debit_account,
                credit_account_number=credit_account,
                amount=amount,
                currency=currency,
                narration=narration,
                financial_transaction_id=txn_id,
                channel=channel,
                auto_commit=False
            )

            # Leg B: Fee (If applicable)
            if fee_amount > 0:
                post_double_entry_transaction(
                    db=db,
                    debit_account_number=debit_account,
                    credit_account_number="GL-BANK-FEE-INCOME-001",
                    amount=fee_amount,
                    currency=currency,
                    narration=f"FEE: {narration}",
                    financial_transaction_id=f"FEE_{txn_id}",
                    channel="SYSTEM_FEE",
                    auto_commit=False
                )

            # Leg C: VAT
            if taxes["vat"] > 0:
                post_double_entry_transaction(
                    db=db,
                    debit_account_number=debit_account,
                    credit_account_number="GL-TAX-VAT-PAYABLE-001",
                    amount=taxes["vat"],
                    currency=currency,
                    narration=f"VAT ON FEE: {narration}",
                    financial_transaction_id=f"VAT_{txn_id}",
                    channel="SYSTEM_TAX",
                    auto_commit=False
                )

            # Leg D: Stamp Duty
            if taxes["stamp_duty"] > 0:
                post_double_entry_transaction(
                    db=db,
                    debit_account_number=debit_account,
                    credit_account_number="GL-TAX-STAMP-DUTY-PAYABLE-001",
                    amount=taxes["stamp_duty"],
                    currency=currency,
                    narration=f"STAMP DUTY: {narration}",
                    financial_transaction_id=f"STAMP_{txn_id}",
                    channel="SYSTEM_TAX",
                    auto_commit=False
                )

            # 3. Final Commit - Atomic "Neural Handshake"
            db.commit()
            logger.info(f"Multi-leg transaction {txn_id} synthesized successfully.")
            
            return {
                "status": "SUCCESS",
                "txn_id": txn_id,
                "total_debit": amount + fee_amount + taxes["total_tax"],
                "taxes": taxes
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Multi-leg Synthesis Failure for {txn_id}: {str(e)}")
            raise e

    @staticmethod
    def pre_auth_check(
        db: Session,
        account_number: str,
        amount: decimal.Decimal,
        fee_amount: decimal.Decimal = decimal.Decimal("0.00")
    ) -> bool:
        """
        Performs a 'Shadow Ledger' check to ensure account can handle
        the total multi-leg debit including taxes before starting the commit.
        """
        from weezy_cbs.accounts_ledger_management.services import get_account_by_number
        
        account = get_account_by_number(db, account_number)
        if not account:
            return False
            
        taxes = calculate_nigerian_taxes(amount, fee_amount)
        total_requirement = amount + fee_amount + taxes["total_tax"]
        
        return account.available_balance >= total_requirement
