from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import fd_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Fixed & Term Deposits"],
)

@router.get("/products", response_model=List[schemas.FDProductResponse])
async def list_fd_products(db: Session = Depends(get_db)):
    """Returns all active Fixed Deposit investment products."""
    return db.query(models.FixedDepositProduct).filter(models.FixedDepositProduct.is_active == True).all()

@router.post("/book", response_model=schemas.FDAccountResponse)
async def book_fixed_deposit(
    req: schemas.FDAccountCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Initiates a new Fixed Deposit investment for the current user."""
    try:
        return fd_service.book_fd(db, current_user.id, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=List[schemas.FDAccountResponse])
async def list_my_fixed_deposits(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns all active investments for the logged-in user."""
    return db.query(models.FixedDepositAccount).filter(models.FixedDepositAccount.customer_id == current_user.id).all()

@router.post("/{fd_id}/liquidate")
async def request_early_liquidation(
    fd_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Processes early liquidation of a Fixed Deposit (penalties apply)."""
    try:
        return await fd_service.liquidate_fd(db, fd_id, is_early=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin/stats")
async def get_fd_admin_stats(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to view total FD liabilities and accrual metrics."""
    from sqlalchemy import func
    total_principal = db.query(func.sum(models.FixedDepositAccount.principal_amount)).filter(models.FixedDepositAccount.status == models.FDStatusEnum.ACTIVE).scalar() or 0
    total_accrued = db.query(func.sum(models.FixedDepositAccount.accrued_interest)).filter(models.FixedDepositAccount.status == models.FDStatusEnum.ACTIVE).scalar() or 0
    
    return {
        "active_fd_count": db.query(models.FixedDepositAccount).filter(models.FixedDepositAccount.status == models.FDStatusEnum.ACTIVE).count(),
        "total_principal_liability": total_principal,
        "total_accrued_interest_liability": total_accrued
    }
