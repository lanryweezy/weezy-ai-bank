from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import interest_engine
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Automated Interest Engine"],
)

@router.post("/accrue-daily")
async def trigger_daily_accrual(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to run daily interest accrual across all accounts."""
    count = interest_engine.run_daily_accrual(db)
    return {"message": f"Daily accrual completed for {count} accounts."}

@router.post("/capitalize-monthly")
async def trigger_monthly_payout(
    month: int = Body(..., embed=True),
    year: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to process monthly interest payout (Capitalization)."""
    await interest_engine.capitalize_monthly_interest(db, month, year)
    return {"message": "Monthly interest payout process initiated."}

@router.get("/accruals/me")
async def get_my_accrued_interest(
    account_number: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the total interest accrued but not yet paid for an account."""
    total = db.query(models.func.sum(models.InterestAccrual.amount_accrued)).filter(
        models.InterestAccrual.account_number == account_number,
        models.InterestAccrual.status == "ACCRUED"
    ).scalar() or 0
    return {"account_number": account_number, "total_accrued": float(total), "currency": "NGN"}
