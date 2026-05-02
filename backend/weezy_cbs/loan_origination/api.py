from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import origination_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser
from weezy_cbs.loan_management_module.models import LoanApplication, LoanProduct

router = APIRouter(
    tags=["Loan Origination & Appraisal"],
)

@router.post("/apply", response_model=Any)
async def submit_loan_application(
    req: schemas.LoanApplicationSubmission,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Submits a new loan application and triggers initial appraisal."""
    try:
        app = origination_service.submit_application(db, current_user.id, req)
        # Background appraisal
        await origination_service.run_ai_appraisal(db, app.id)
        return app
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-applications", response_model=List[Any])
async def list_my_loan_applications(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a history of loan applications for the logged-in user."""
    return db.query(LoanApplication).filter(LoanApplication.customer_id == current_user.id).all()

@router.post("/{app_id}/documents")
async def upload_loan_document(
    app_id: int,
    doc_in: schemas.LoanDocumentUpload,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Uploads a required document for a specific loan application."""
    return origination_service.upload_document(db, app_id, doc_in)

@router.get("/{app_id}/status", response_model=schemas.LoanOriginationStatus)
async def get_application_status(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the comprehensive status of a loan application, including AI appraisal."""
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    
    appraisal = db.query(models.LoanAppraisal).filter(models.LoanAppraisal.application_id == app_id).first()
    docs_count = db.query(models.LoanApplicationDocument).filter(models.LoanApplicationDocument.application_id == app_id).count()
    
    return {
        "application_id": app.id,
        "reference": app.application_reference,
        "current_status": app.status.value,
        "required_documents": [models.DocumentTypeEnum.NIN_SLIP, models.DocumentTypeEnum.BANK_STATEMENT],
        "uploaded_documents_count": docs_count,
        "appraisal": appraisal
    }

@router.get("/admin/review-queue")
async def list_review_queue(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to see all applications awaiting manual review."""
    return db.query(LoanApplication).filter(LoanApplication.status == "UNDER_REVIEW").all()
