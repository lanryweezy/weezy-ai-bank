from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class CollectionStageEnum(enum.Enum):
    PRE_DUE = "PRE_DUE" # Reminder before due date
    DELINQUENT = "DELINQUENT" # 1-30 days late
    DEFAULT = "DEFAULT" # 31-90 days late
    RECOVERY = "RECOVERY" # 90+ days late
    LEGAL = "LEGAL"

class LoanRecoveryAction(Base):
    __tablename__ = "loan_recovery_actions"

    id = Column(Integer, primary_key=True, index=True)
    loan_account_id = Column(Integer, ForeignKey("loan_accounts.id"), nullable=False)
    
    stage = Column(SQLAlchemyEnum(CollectionStageEnum), default=CollectionStageEnum.PRE_DUE)
    action_type = Column(String(50), nullable=False) # AI_SMS, AI_EMAIL, HUMAN_CALL
    
    # AI Context
    ai_drafted_message = Column(Text, nullable=True)
    ai_sentiment_analysis = Column(String(50), nullable=True) # e.g. COOPERATIVE, EVASIVE
    
    status = Column(String(20), default="SENT") # SENT, READ, REPLIED, FAILED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    loan_account = relationship("LoanAccount")

class RepaymentPromise(Base):
    __tablename__ = "repayment_promises"

    id = Column(Integer, primary_key=True, index=True)
    loan_account_id = Column(Integer, ForeignKey("loan_accounts.id"), nullable=False)
    
    promised_amount = Column(Numeric(precision=18, scale=2), nullable=False)
    promised_date = Column(DateTime(timezone=True), nullable=False)
    
    status = Column(String(20), default="ACTIVE") # ACTIVE, KEPT, BROKEN
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
