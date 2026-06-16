# Pydantic schemas for Cards & Wallets Management
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
import enum

# Schema Enums
class CurrencySchema(str, enum.Enum):
    NGN = "NGN"; USD = "USD"

class CardTypeSchema(str, enum.Enum):
    VIRTUAL = "VIRTUAL"; PHYSICAL = "PHYSICAL"

class CardSchemeSchema(str, enum.Enum):
    VERVE = "VERVE"; MASTERCARD = "MASTERCARD"; VISA = "VISA"

class CardStatusSchema(str, enum.Enum):
    REQUESTED = "REQUESTED"; INACTIVE = "INACTIVE"; ACTIVE = "ACTIVE"
    BLOCKED_TEMP = "BLOCKED_TEMP"; BLOCKED_PERM = "BLOCKED_PERM"; EXPIRED = "EXPIRED"

class WalletAccountStatusSchema(str, enum.Enum):
    ACTIVE = "ACTIVE"; INACTIVE = "INACTIVE"; SUSPENDED = "SUSPENDED"; CLOSED = "CLOSED"

class WalletTransactionTypeSchema(str, enum.Enum):
    TOP_UP = "TOP_UP"; WITHDRAWAL = "WITHDRAWAL"; P2P_SEND = "P2P_SEND"
    P2P_RECEIVE = "P2P_RECEIVE"; PAYMENT = "PAYMENT"; FEE = "FEE"; REVERSAL = "REVERSAL"

# --- Wallet Account Schemas ---
class WalletAccountBase(BaseModel):
    phone_number: str
    currency: CurrencySchema = CurrencySchema.NGN

class WalletAccountCreate(WalletAccountBase):
    customer_id: int

class WalletAccountResponse(WalletAccountBase):
    id: int
    nuban_account_number: Optional[str]
    balance: decimal.Decimal
    status: WalletAccountStatusSchema
    created_at: datetime

    class Config:
        orm_mode = True
        use_enum_values = True
        json_encoders = {decimal.Decimal: str}

class WalletTransactionResponse(BaseModel):
    id: int
    wallet_account_id: int
    transaction_type: WalletTransactionTypeSchema
    amount: decimal.Decimal
    currency: CurrencySchema
    narration: Optional[str]
    reference: str
    status: str
    balance_before: decimal.Decimal
    balance_after: decimal.Decimal
    transaction_date: datetime

    class Config:
        orm_mode = True
        use_enum_values = True
        json_encoders = {decimal.Decimal: str}

# --- Card Schemas ---
class CardBase(BaseModel):
    card_type: CardTypeSchema
    card_scheme: CardSchemeSchema
    cardholder_name: str
    # expiry_date: str - Not needed for creation, set by system

class CardCreateRequest(BaseModel):
    card_type: CardTypeSchema
    card_scheme: CardSchemeSchema
    cardholder_name: str
    linked_account_number: str

class CardResponse(CardBase):
    id: int
    customer_id: int
    card_number_masked: str
    expiry_date: str
    status: CardStatusSchema
    created_at: datetime

    class Config:
        orm_mode = True
        use_enum_values = True
