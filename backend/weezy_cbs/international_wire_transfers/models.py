from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class WireStatusEnum(enum.Enum):
    DRAFT = "DRAFT"
    AWAITING_DOCS = "AWAITING_DOCS" # Form M/KYC for Nigeria
    PENDING_APPROVAL = "PENDING_APPROVAL"
    MT103_GENERATED = "MT103_GENERATED"
    SENT_TO_SWIFT = "SENT_TO_SWIFT"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REVERSED = "REVERSED"

class InternationalWireTransfer(Base):
    """
    International Outbound Transfers (SWIFT).
    Tailored for Nigerian FX compliance (Form M, PTA/BTA).
    """
    __tablename__ = "international_wire_transfers"

    id = Column(Integer, primary_key=True, index=True)
    reference_number = Column(String(50), unique=True, index=True, nullable=False)
    
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    source_account_number = Column(String(20), nullable=False) # Usually a Domiciliary Account
    
    # Recipient Details
    beneficiary_name = Column(String(150), nullable=False)
    beneficiary_account = Column(String(50), nullable=False)
    beneficiary_address = Column(Text, nullable=True)
    beneficiary_bank_name = Column(String(150), nullable=False)
    beneficiary_bank_swift_bic = Column(String(11), nullable=False)
    beneficiary_bank_address = Column(Text, nullable=True)
    
    # Correspondent/Intermediary (Optional)
    intermediary_bank_swift_bic = Column(String(11), nullable=True)
    
    # Financials
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    currency = Column(String(3), nullable=False) # USD, EUR, GBP
    purpose_of_payment = Column(String(100), nullable=False) # e.g. "School Fees", "Medical"
    
    # Compliance (Nigerian Market Specific)
    form_m_number = Column(String(50), nullable=True)
    pta_bta_eligible = Column(Boolean, default=False)
    
    status = Column(SQLAlchemyEnum(WireStatusEnum), default=WireStatusEnum.DRAFT)
    
    # SWIFT Message Content (MT103)
    mt103_payload = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    customer = relationship("Customer")

class CorrespondentBank(Base):
    """Registry of international banks Weezy Bank has Nostro accounts with."""
    __tablename__ = "correspondent_banks"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String(150), nullable=False)
    swift_bic = Column(String(11), unique=True, index=True, nullable=False)
    country = Column(String(50), nullable=False)
    
    nostro_account_number = Column(String(50), nullable=False)
    currency = Column(String(3), nullable=False)
    
    is_active = Column(Boolean, default=True)
