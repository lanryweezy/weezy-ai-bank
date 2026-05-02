import uuid
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.customer_identity_management.models import Customer

logger = logging.getLogger(__name__)

from weezy_cbs.fees_charges_commission_engine.services import charge_notification_fee
from weezy_cbs.accounts_ledger_management.models import Account, CurrencyEnum

class NotificationEngine:
    """
    The Communication Hub for Weezy Bank.
    Orchestrates alerts across SMS, Email, and In-App channels.
    """
    
    async def send_transaction_alert(self, db: Session, customer_id: int, txn_data: Dict[str, Any], txn_type: str = "CREDIT"):
        """
        Specific helper for real-time transaction alerts.
        """
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer: return

        # Format Message (Nigerian Bank Standard)
        amount = f"₦{float(txn_data.get('amount', 0)):,.2f}"
        acc_masked = f"***{txn_data.get('account_number', '')[-3:]}"
        date_str = datetime.now().strftime("%d-%b-%Y %H:%M")
        
        if txn_type == "CREDIT":
            subject = "WEEZY CREDIT ALERT"
            body = f"Credit: {amount}\nAcc: {acc_masked}\nDesc: {txn_data.get('narration')}\nDate: {date_str}\nBal: ₦{float(txn_data.get('balance', 0)):,.2f}"
        else:
            subject = "WEEZY DEBIT ALERT"
            body = f"Debit: {amount}\nAcc: {acc_masked}\nDesc: {txn_data.get('narration')}\nDate: {date_str}\nBal: ₦{float(txn_data.get('balance', 0)):,.2f}"

        # 1. Send SMS (Mock)
        if customer.phone_number:
            await self.send_notification(db, customer_id, models.ChannelEnum.SMS, customer.phone_number, body)
            
            # --- SMS FEE COLLECTION ---
            # Charge the primary NGN account for the alert
            primary_acc = db.query(Account).filter(
                Account.customer_id == customer_id, 
                Account.currency == CurrencyEnum.NGN
            ).first()
            if primary_acc:
                charge_notification_fee(db, customer_id, primary_acc.account_number)
            
        # 2. Send Email (Mock)
        if customer.email:
            await self.send_notification(db, customer_id, models.ChannelEnum.EMAIL, customer.email, body, subject)

    async def send_investment_alert(self, db: Session, customer_id: int, fd_data: Dict[str, Any]):
        """Notification for a new Fixed Deposit booking."""
        amount = f"₦{float(fd_data.get('principal', 0)):,.2f}"
        yield_rate = fd_data.get('rate', '0.00')
        maturity = fd_data.get('maturity_date', 'N/A')
        
        body = f"Fixed Deposit Active!\nAmt: {amount}\nYield: {yield_rate}% P.A.\nMaturity: {maturity}\nRef: {fd_data.get('ref')}\nThank you for choosing Weezy."
        
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer and customer.phone_number:
            await self.send_notification(db, customer_id, models.ChannelEnum.SMS, customer.phone_number, body, "WEEZY INVESTMENT")

    async def send_loan_update_alert(self, db: Session, customer_id: int, loan_data: Dict[str, Any]):
        """Notification for loan application status changes."""
        status = loan_data.get('status', 'UNDER_REVIEW')
        amount = f"₦{float(loan_data.get('amount', 0)):,.2f}"
        
        body = f"Loan Update: {status}\nAmt: {amount}\nRef: {loan_data.get('ref')}\nCheck your dashboard for details."
        
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer and customer.phone_number:
            await self.send_notification(db, customer_id, models.ChannelEnum.SMS, customer.phone_number, body, "WEEZY CREDIT")

    async def send_notification(
        self, db: Session, 
        customer_id: int, 
        channel: models.ChannelEnum, 
        recipient: str, 
        body: str, 
        subject: Optional[str] = None
    ) -> models.NotificationLog:
        """
        General purpose notification sender.
        """
        log = models.NotificationLog(
            customer_id=customer_id,
            channel=channel,
            recipient=recipient,
            subject=subject,
            message_body=body,
            status=models.NotificationStatusEnum.PENDING
        )
        db.add(log)
        db.commit()

        try:
            # Simulate Provider Integration (Termii for SMS / SendGrid for Email)
            logger.info(f"MOCK {channel.value} SENT TO {recipient}: {body[:50]}...")
            
            log.status = models.NotificationStatusEnum.SENT
            log.provider_reference = f"PROV-{uuid.uuid4().hex[:8].upper()}"
            log.sent_at = datetime.utcnow()
            db.commit()
            
            # In real CBS: Here we would trigger the SMS Fee charge (e.g. ₦4.00)
            # await self._charge_notification_fee(db, customer_id)
            
        except Exception as e:
            logger.error(f"Failed to send {channel.value}: {str(e)}")
            log.status = models.NotificationStatusEnum.FAILED
            log.error_details = str(e)
            db.commit()

        return log

notification_engine = NotificationEngine()
