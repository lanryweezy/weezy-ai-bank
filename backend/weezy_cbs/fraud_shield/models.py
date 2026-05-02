from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class FraudRiskLevelEnum(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class FraudStatusEnum(enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED_GENUINE = "APPROVED_GENUINE"
    BLOCKED_FRAUD = "BLOCKED_FRAUD"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class FraudRule(Base):
    __tablename__ = "fraud_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Simple rule logic: logic_code links to a python function or a JSON rule engine
    logic_code = Column(String(50), nullable=False) # e.g. VELOCITY_CHECK, TIER_LIMIT_BREACH
    
    is_active = Column(Boolean, default=True)
    severity = Column(SQLAlchemyEnum(FraudRiskLevelEnum), default=FraudRiskLevelEnum.MEDIUM)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    risk_score = Column(Float, default=0.0) # AI Score 0-100
    risk_level = Column(SQLAlchemyEnum(FraudRiskLevelEnum), default=FraudRiskLevelEnum.MEDIUM)
    
    ai_analysis_report = Column(JSON, nullable=True)
    triggered_rules = Column(JSON, nullable=True) # List of rule names
    
    status = Column(SQLAlchemyEnum(FraudStatusEnum), default=FraudStatusEnum.PENDING_REVIEW)
    
    decision_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    decision_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")
    transaction = relationship("FinancialTransaction")
