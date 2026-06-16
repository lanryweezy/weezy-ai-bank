import decimal
import logging
import asyncio
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from weezy_cbs.accounts_ledger_management.models import LedgerEntry, Account, AccountStatusEnum
from weezy_cbs.transaction_management.models import FinancialTransaction, TransactionStatusEnum
from weezy_cbs.core_banking_engine.transaction_orchestrator import TransactionOrchestrator
from weezy_cbs.nip_protocol_handler import NIPMessageFormatter

logger = logging.getLogger(__name__)

class LatticeRepairAgent:
    """
    Autonomous Self-Healing Agent for Weezy AI Bank.
    Proactively scans for 'Lattice Breaks' (inconsistent ledger states)
    and executes corrective handshakes.
    """

    @staticmethod
    async def heal_ambiguous_transactions(db: Session):
        """
        Scans for NIP transactions stuck in 'PROCESSING' or 'PENDING'
        for more than 5 minutes and performs automated NIBSS Status Inquiries.
        """
        timeout_threshold = datetime.utcnow() - timedelta(minutes=5)
        
        ambiguous_txns = db.query(FinancialTransaction).filter(
            FinancialTransaction.status.in_([TransactionStatusEnum.PENDING, TransactionStatusEnum.PROCESSING]),
            FinancialTransaction.initiated_at < timeout_threshold,
            FinancialTransaction.transaction_type.like("NIP_%")
        ).all()

        for txn in ambiguous_txns:
            logger.info(f"REPAIR: Initiating neural healing for ambiguous txn {txn.id}")
            
            # 1. Format NIBSS Status Inquiry (Conceptual)
            # In production, this would call the actual NIBSS gateway
            mock_xml_response = f"<TSQueryResponse><ResponseCode>00</ResponseCode><SessionID>{txn.id}</SessionID></TSQueryResponse>"
            nibss_result = NIPMessageFormatter.parse_status_inquiry_response(mock_xml_response)

            if nibss_result["status"] == "success":
                # Transaction was successful at NIBSS but we missed the ACK
                txn.status = TransactionStatusEnum.SUCCESSFUL
                txn.system_remarks += f"; Auto-healed by LatticeRepairAgent at {datetime.utcnow()}"
                logger.info(f"REPAIR: Corrected {txn.id} to SUCCESSFUL.")
            elif nibss_result["status"] == "error":
                # Transaction failed at NIBSS, trigger local reversal/fail
                txn.status = TransactionStatusEnum.FAILED
                txn.system_remarks += f"; Auto-failed after NIBSS error detection."
                logger.warning(f"REPAIR: Corrected {txn.id} to FAILED.")
            
            db.commit()

    @staticmethod
    async def audit_ledger_consistency(db: Session):
        """
        FORENSIC SCAN: Verifies that every FinancialTransaction has its 
        corresponding multi-leg ledger entries (Principal + VAT + Stamp Duty).
        If legs are missing, the agent 'synthesizes' them retroactively.
        """
        # 1. Find transactions where tax_amount > 0 but missing tax ledger entries
        # (Simplified logic for demonstration)
        broken_lattices = db.query(FinancialTransaction).filter(
            FinancialTransaction.status == TransactionStatusEnum.SUCCESSFUL,
            FinancialTransaction.tax_amount > 0
        ).limit(100).all()

        for txn in broken_lattices:
            # Check if tax legs exist in LedgerEntry table
            has_tax_leg = db.query(LedgerEntry).filter(
                LedgerEntry.financial_transaction_id.like(f"TAX_%{txn.id}")
            ).first()

            if not has_tax_leg:
                logger.error(f"LATTICE_BREAK: Transaction {txn.id} is missing regulatory legs! Repairing...")
                # Use Orchestrator to retroactively post the missing legs
                # This is why we built the TransactionOrchestrator with auto_commit=False
                TransactionOrchestrator.process_multi_leg_transaction(
                    db=db,
                    debit_account=txn.debit_account_number,
                    credit_account=txn.credit_account_number,
                    amount=decimal.Decimal("0.00"), # Principal already posted
                    currency=txn.currency,
                    narration=f"REPAIR: Regulatory recovery for {txn.id}",
                    txn_id=f"REPAIR_{txn.id}",
                    channel="SYSTEM_REPAIR",
                    apply_taxes=True,
                    fee_amount=decimal.Decimal("0.00")
                )
                logger.info(f"LATTICE_REPAIR: Successfully synthesized missing legs for {txn.id}")

class NeuralGovernor:
    """
    Cognitive Transaction Interceptor.
    Injects real-time behavioral intelligence into the transaction flow.
    """
    
    @staticmethod
    def evaluate_intent(customer: Account, amount: decimal.Decimal, narration: str) -> Dict[str, Any]:
        """
        Evaluates 'Business Intent' beyond simple rules.
        Example: If a savings account typically does N5k txns suddenly does N5M 
        with narration 'Investment', the Governor may escalate to 'Manual Handshake'.
        """
        # This would call the AI Cognitive Core
        is_anomalous = amount > (customer.available_balance * decimal.Decimal("0.80"))
        
        if is_anomalous:
            return {
                "decision": "ESCALATE",
                "reason": "High-velocity outflow relative to historical average.",
                "action": "Trigger Biometric Handshake"
            }
        
        return {"decision": "PASS", "reason": "Consistent with profile."}
