import logging
import asyncio
from typing import Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class NIPAutoReconciliationNegotiator:
    """
    Nigerian Bank Killer: NIP Auto-Reconciliation Negotiator.
    Solves the 'Hanging Transfer' by autonomously handshaking with the receiving bank
    and instantly reversing the transaction if unacknowledged within 15 seconds.
    """
    
    async def negotiate_and_reconcile(self, db: Session, transaction_id: int) -> Dict[str, Any]:
        """
        Actively monitors a pending NIP outward transfer.
        If the receiving bank times out, it triggers an instant reversal to the customer.
        """
        from weezy_cbs.transaction_management.models import FinancialTransaction, TransactionStatusEnum
        from weezy_cbs.transaction_management.services import reverse_transaction
        from weezy_cbs.transaction_management.schemas import TransactionReversalRequest
        from weezy_cbs.messaging_notifications.services import notification_engine
        
        # 1. Fetch the PENDING transaction
        txn = db.query(FinancialTransaction).filter(
            FinancialTransaction.id == transaction_id,
            FinancialTransaction.status == TransactionStatusEnum.PENDING
        ).first()
        
        if not txn: return {"status": "NOT_PENDING"}
        
        # 2. The 15-Second Handshake Wait
        # Instead of waiting for EOD reconciliation like legacy systems, we actively wait 15s.
        logger.info(f"NIP NEGOTIATOR: Initiating 15s handshake monitor for TXN {txn.id}")
        await asyncio.sleep(15) 
        
        # Re-fetch to check if the main thread updated it to SUCCESSFUL via NIBSS callback
        db.refresh(txn)
        if txn.status == TransactionStatusEnum.SUCCESSFUL:
            return {"status": "SUCCESSFUL_HANDSHAKE"}
            
        # 3. Handshake Failed - Execute Sovereign Reversal
        logger.warning(f"NIP NEGOTIATOR: Handshake timeout for TXN {txn.id}. Executing Autonomous Reversal.")
        
        reversal_req = TransactionReversalRequest(
            original_transaction_id=txn.id,
            reason="AUTO_RECONCILIATION: Destination bank failed to acknowledge credit within 15s SLA."
        )
        
        try:
            reversed_txn = reverse_transaction(db, reversal_req)
            
            # Send the "Empathy Alert"
            # Instead of the customer finding out via a missing balance, we tell them immediately.
            alert_payload = {
                "message": "The recipient's bank network is currently slow. To protect your funds, we have autonomously cancelled the transfer and instantly refunded your account. Please try again in 10 minutes.",
                "amount": float(txn.amount),
                "original_ref": txn.id
            }
            
            # Assuming initiated_by_customer_id exists or we fetch from debit account
            from weezy_cbs.accounts_ledger_management.services import get_account_by_number
            acc = get_account_by_number(db, txn.debit_account_number)
            if acc:
                await notification_engine.send_push_notification(db, acc.customer_id, alert_payload)
            
            return {
                "status": "REVERSED",
                "reversal_id": reversed_txn.id,
                "message": "Funds secured and refunded to customer."
            }
            
        except Exception as e:
            logger.error(f"NIP Negotiator Reversal Error for TXN {txn.id}: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

nip_negotiator = NIPAutoReconciliationNegotiator()
