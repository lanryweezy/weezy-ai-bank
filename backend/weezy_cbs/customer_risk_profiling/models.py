from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class RiskLevelEnum(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class CustomerRiskProfile(Base):
    __tablename__ = "customer_risk_profiles"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True, nullable=False)
    
    risk_level = Column(SQLAlchemyEnum(RiskLevelEnum), default=RiskLevelEnum.LOW)
    risk_score = Column(Float, default=0.0) # 0 to 100
    
    ai_assessment_report = Column(JSON, nullable=True)
    last_assessment_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Specific Flags (Nigerian AML Context)
    is_pep = Column(Boolean, default=False) # Politically Exposed Person
    sanction_list_match = Column(Boolean, default=False)
    unusual_transaction_velocity = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")
    risk_events = relationship("RiskEvent", back_populates="risk_profile")

class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(Integer, primary_key=True, index=True)
    risk_profile_id = Column(Integer, ForeignKey("customer_risk_profiles.id"), nullable=False)
    
    event_type = Column(String(50), nullable=False) # e.g. TRANSACTION_SPIKE, KYC_UPDATE, SANCTION_HIT
    description = Column(Text, nullable=False)
    severity = Column(SQLAlchemyEnum(RiskLevelEnum), default=RiskLevelEnum.LOW)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    risk_profile = relationship("CustomerRiskProfile", back_populates="risk_events")
