from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class DocumentTypeEnum(enum.Enum):
    NIN_SLIP = "NIN_SLIP"
    BVN_CONFIRMATION = "BVN_CONFIRMATION"
    UTILITY_BILL = "UTILITY_BILL"
    EMPLOYMENT_LETTER = "EMPLOYMENT_LETTER"
    BANK_STATEMENT = "BANK_STATEMENT"
    PASSPORT_PHOTO = "PASSPORT_PHOTO"
    COLLATERAL_DEED = "COLLATERAL_DEED"

class AppraisalStatusEnum(enum.Enum):
    PENDING = "PENDING"
    AUTO_PASSED = "AUTO_PASSED"
    AUTO_FAILED = "AUTO_FAILED"
    MANUAL_PASSED = "MANUAL_PASSED"
    MANUAL_FAILED = "MANUAL_FAILED"

class LoanApplicationDocument(Base):
    __tablename__ = "loan_application_documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    
    document_type = Column(SQLAlchemyEnum(DocumentTypeEnum), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False) # In prod, this would be an S3/Blob storage link
    
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LoanAppraisal(Base):
    """
    AI & Human Appraisal of a loan application.
    Calculates key risk metrics like DTI (Debt-to-Income).
    """
    __tablename__ = "loan_appraisals"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("loan_applications.id"), unique=True, nullable=False)
    
    status = Column(SQLAlchemyEnum(AppraisalStatusEnum), default=AppraisalStatusEnum.PENDING)
    
    # Financial Metrics
    monthly_income_declared = Column(Numeric(precision=18, scale=2))
    monthly_income_verified = Column(Numeric(precision=18, scale=2))
    existing_monthly_obligations = Column(Numeric(precision=18, scale=2), default=0.00)
    
    debt_to_income_ratio = Column(Numeric(precision=5, scale=2)) # %
    
    # Scoring
    ai_risk_score = Column(Integer) # 0-100
    ai_recommendation = Column(Text)
    
    manual_review_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LoanApplicationWorkflow(Base):
    """Maker-Checker Audit Trail for Loan Origination."""
    __tablename__ = "loan_application_workflow"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    
    from_status = Column(String(50))
    to_status = Column(String(50))
    
    action_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comments = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
