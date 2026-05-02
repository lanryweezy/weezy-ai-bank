from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from datetime import datetime, date

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import eod_orchestrator
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["EOD Processing & System Integrity"],
)

@router.get("/system-date")
async def get_current_banking_date(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns the current logical business date of the bank."""
    sys_date = db.query(models.SystemDate).first()
    if not sys_date:
        # Initialize if empty
        sys_date = models.SystemDate(current_business_date=date.today())
        db.add(sys_date)
        db.commit()
    return sys_date

@router.post("/run-eod")
async def trigger_end_of_day(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """
    Executes the End of Day batch process. 
    Interest Accrual -> Maturity Processing -> Trial Balance -> Date Roll.
    """
    return await eod_orchestrator.run_eod_batch(db)

@router.get("/job-logs")
async def list_eod_logs(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns a history of all EOD batch runs."""
    return db.query(models.EODJobLog).order_by(models.EODJobLog.business_date.desc()).limit(30).all()

@router.get("/trial-balance")
async def get_daily_trial_balance(
    business_date: date,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns the GL trial balance snapshot for a specific date."""
    return db.query(models.DailyTrialBalance).filter(models.DailyTrialBalance.business_date == business_date).all()
