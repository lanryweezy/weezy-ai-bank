from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import decimal
from .models import DocumentTypeEnum, AppraisalStatusEnum

class LoanDocumentUpload(BaseModel):
    document_type: DocumentTypeEnum
    file_name: str
    file_url: str

class LoanAppraisalResponse(BaseModel):
    id: int
    status: AppraisalStatusEnum
    monthly_income_verified: Optional[decimal.Decimal]
    debt_to_income_ratio: Optional[decimal.Decimal]
    ai_risk_score: Optional[int]
    ai_recommendation: Optional[str]
    
    class Config:
        orm_mode = True

class LoanOriginationStatus(BaseModel):
    application_id: int
    reference: str
    current_status: str
    required_documents: List[DocumentTypeEnum]
    uploaded_documents_count: int
    appraisal: Optional[LoanAppraisalResponse]
    
    class Config:
        orm_mode = True

class LoanApplicationSubmission(BaseModel):
    product_id: int
    amount: decimal.Decimal
    tenor_months: int
    purpose: str
    monthly_income: decimal.Decimal
    guarantors: Optional[List[dict]] = None
    collaterals: Optional[List[dict]] = None
