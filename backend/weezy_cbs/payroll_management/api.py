from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import payroll_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Bulk Payments & Payroll"],
)

@router.post("/upload", response_model=schemas.PayrollBatchResponse)
async def upload_payroll_batch(
    batch_in: schemas.PayrollBatchCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Uploads a payroll batch and triggers AI anomaly scanning."""
    batch = payroll_service.create_payroll_batch(db, batch_in)
    
    # Trigger AI analysis in background
    background_tasks.add_task(payroll_service.run_ai_anomaly_detection, db, batch.id)
    
    return batch

@router.get("/{batch_id}", response_model=schemas.PayrollBatchResponse)
async def get_payroll_batch_details(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the details and AI report of a payroll batch."""
    batch = db.query(models.PayrollBatch).filter(models.PayrollBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

@router.post("/{batch_id}/approve")
async def approve_and_disburse(
    batch_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Approves a batch and starts high-volume disbursement."""
    # In a real app, only specific corporate roles can approve
    background_tasks.add_task(payroll_service.execute_disbursement, db, batch_id)
    return {"message": "Disbursement initiated successfully."}
