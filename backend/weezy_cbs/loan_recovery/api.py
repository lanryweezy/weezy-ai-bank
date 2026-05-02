from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import recovery_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Loan Recovery & Collections"],
)

@router.post("/scan-overdue")
async def trigger_overdue_scan(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to scan for overdue loans and trigger AI-personalized reminders."""
    background_tasks.add_task(recovery_service.scan_and_trigger_reminders, db)
    return {"message": "Recovery scan initiated."}

@router.get("/actions/recent", response_model=List[schemas.RecoveryActionResponse])
async def list_recent_recovery_actions(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns a history of all AI-drafted recovery actions."""
    return db.query(models.LoanRecoveryAction).order_by(models.LoanRecoveryAction.created_at.desc()).limit(100).all()

@router.post("/promise")
async def log_repayment_promise(
    promise: schemas.PromiseRequest,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Logs a customer's promise to repay, to be tracked by the system."""
    db_promise = models.RepaymentPromise(
        loan_account_id=promise.loan_account_id,
        promised_amount=promise.promised_amount,
        promised_date=promise.promised_date
    )
    db.add(db_promise)
    db.commit()
    return {"message": "Promise to pay recorded."}
