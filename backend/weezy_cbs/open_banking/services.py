import uuid
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas
from weezy_cbs.accounts_ledger_management.services import get_accounts_by_customer_id
from weezy_cbs.transaction_management.services import get_transactions_for_account

logger = logging.getLogger(__name__)

class OpenBankingService:
    
    def create_consent_request(self, db: Session, app_id: int, user_id: int, permissions: List[str]) -> models.OpenBankingConsent:
        consent_id = f"WZY-CONS-{uuid.uuid4().hex[:8].upper()}"
        
        db_consent = models.OpenBankingConsent(
            consent_id=consent_id,
            user_id=user_id,
            app_id=app_id,
            permissions=permissions,
            expires_at=datetime.utcnow() + timedelta(days=90)
        )
        db.add(db_consent)
        db.commit()
        db.refresh(db_consent)
        return db_consent

    def authorize_consent(self, db: Session, consent_id: str) -> models.OpenBankingConsent:
        consent = db.query(models.OpenBankingConsent).filter(models.OpenBankingConsent.consent_id == consent_id).first()
        if not consent:
            raise Exception("Consent request not found")
            
        consent.status = models.ConsentStatusEnum.AUTHORIZED
        db.commit()
        db.refresh(consent)
        return consent

    def get_authorized_accounts(self, db: Session, consent_id: str) -> List[Dict[str, Any]]:
        consent = db.query(models.OpenBankingConsent).filter(
            models.OpenBankingConsent.consent_id == consent_id,
            models.OpenBankingConsent.status == models.ConsentStatusEnum.AUTHORIZED
        ).first()
        
        if not consent or consent.expires_at < datetime.utcnow():
            raise Exception("Invalid or Expired Consent")

        # Fetch accounts for the user who granted consent
        accounts = get_accounts_by_customer_id(db, consent.user_id)
        return [
            {
                "account_number": acc.account_number,
                "account_type": acc.account_type.value,
                "currency": acc.currency.value,
                "available_balance": float(acc.available_balance) if "READ_BALANCES" in consent.permissions else "HIDDEN"
            }
            for acc in accounts
        ]

open_banking_service = OpenBankingService()
