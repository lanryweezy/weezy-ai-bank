import json
import decimal
import random
import string
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas
from .models import CardStatusEnum, WalletAccountStatusEnum, WalletTransactionTypeEnum, CurrencyEnum
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils
from weezy_cbs.accounts_ledger_management.services import create_account, get_account_by_number
from weezy_cbs.transaction_management.services import initiate_transaction

class NotFoundException(Exception): pass
class InvalidOperationException(Exception): pass
class InsufficientFundsException(InvalidOperationException): pass

# --- Mobile Money Wallet Services ---
class MobileMoneyWalletService:
    def create_wallet(self, db: Session, customer_id: int, phone_number: str) -> models.WalletAccount:
        """
        Creates a digital wallet tied to a phone number.
        Automatically generates a linked NUBAN for Inter-bank transfers.
        """
        if db.query(models.WalletAccount).filter(models.WalletAccount.phone_number == phone_number).first():
            raise InvalidOperationException(f"Wallet for {phone_number} already exists.")
            
        # 1. Generate Virtual NUBAN (999 bank code)
        nuban = NigerianMarketUtils.generate_nuban(bank_code="999")
        
        # 2. Create Wallet Record
        db_wallet = models.WalletAccount(
            customer_id=customer_id,
            phone_number=phone_number,
            nuban_account_number=nuban,
            balance=decimal.Decimal("0.00"),
            status=WalletAccountStatusEnum.ACTIVE
        )
        db.add(db_wallet)
        db.commit()
        db.refresh(db_wallet)
        return db_wallet

    def get_wallet_by_phone(self, db: Session, phone_number: str) -> Optional[models.WalletAccount]:
        return db.query(models.WalletAccount).filter(models.WalletAccount.phone_number == phone_number).first()

    async def wallet_to_wallet_transfer(
        self, db: Session, 
        sender_phone: str, 
        receiver_phone: str, 
        amount: decimal.Decimal,
        narration: Optional[str] = None
    ) -> dict:
        """
        Instant P2P transfer between two Weezy wallets using phone numbers.
        """
        sender = self.get_wallet_by_phone(db, sender_phone)
        receiver = self.get_wallet_by_phone(db, receiver_phone)
        
        if not sender: raise NotFoundException(f"Sender wallet ({sender_phone}) not found.")
        if not receiver: raise NotFoundException(f"Receiver wallet ({receiver_phone}) not found.")
            
        if sender.balance < amount:
            raise InsufficientFundsException("Insufficient wallet balance.")

        # Execute via the core Transaction Engine (Internal Double Entry)
        from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
        
        txn_req = TransactionCreateRequest(
            transaction_type="TRANSFER",
            channel="MOBILE_APP",
            amount=amount,
            currency="NGN",
            debit_account_number=sender.nuban_account_number,
            credit_account_number=receiver.nuban_account_number,
            narration=narration or f"P2P from {sender_phone} to {receiver_phone}"
        )
        
        txn = await initiate_transaction(db, txn_req)
        
        # Sync cached balances in wallet table (ledger is the source of truth)
        sender.balance -= amount
        receiver.balance += amount
        db.commit()
        
        return {
            "status": "SUCCESS",
            "transaction_id": txn.id,
            "amount": float(amount),
            "receiver_name": f"{receiver.customer.first_name} {receiver.customer.last_name}"
        }

# --- Card Services (Simulation for Verve/Mastercard) ---
class CardManagementService:
    def request_virtual_card(self, db: Session, customer_id: int, account_number: str) -> models.Card:
        # Mock PAN generation
        pan = "5061" + "".join(random.choices(string.digits, k=12)) # Verve starting with 5061
        
        db_card = models.Card(
            customer_id=customer_id,
            account_id=1, # Mock link
            card_number_masked=f"{pan[:4]}********{pan[-4:]}",
            card_number_hashed=hashlib.sha256(pan.encode()).hexdigest(),
            card_type="VIRTUAL",
            card_scheme="VERVE",
            expiry_date="12/28",
            cardholder_name="WEEY BANK CUSTOMER",
            status=CardStatusEnum.ACTIVE
        )
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card

wallet_service = MobileMoneyWalletService()
card_service = CardManagementService()
import hashlib
