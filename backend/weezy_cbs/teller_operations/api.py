from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import teller_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Branch & Teller Operations"],
)

@router.get("/till/status", response_model=schemas.TillStatusResponse)
async def get_my_till_status(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the current status and balance of the logged-in teller's till."""
    till = teller_service.get_or_create_till(db, current_user.id)
    branch = db.query(models.Branch).filter(models.Branch.id == till.branch_id).first()
    
    return {
        "till_id": till.id,
        "branch_name": branch.name,
        "status": till.status,
        "current_cash_balance": till.current_cash_balance,
        "max_holding_limit": till.max_holding_limit
    }

@router.post("/till/open", response_model=schemas.TillStatusResponse)
async def open_my_till(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Opens the teller till for the day."""
    till = teller_service.open_till(db, current_user.id)
    branch = db.query(models.Branch).filter(models.Branch.id == till.branch_id).first()
    return {
        "till_id": till.id,
        "branch_name": branch.name,
        "status": till.status,
        "current_cash_balance": till.current_cash_balance,
        "max_holding_limit": till.max_holding_limit
    }

@router.post("/till/close", response_model=schemas.TillStatusResponse)
async def close_my_till(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Closes the teller till at end of shift."""
    till = teller_service.close_till(db, current_user.id)
    branch = db.query(models.Branch).filter(models.Branch.id == till.branch_id).first()
    return {
        "till_id": till.id,
        "branch_name": branch.name,
        "status": till.status,
        "current_cash_balance": till.current_cash_balance,
        "max_holding_limit": till.max_holding_limit
    }

@router.post("/post", response_model=schemas.TellerPostingResponse)
async def post_cash_transaction(
    req: schemas.TellerPostingCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Posts a cash deposit or withdrawal over the counter."""
    try:
        return await teller_service.post_transaction(db, current_user.id, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/vault/request")
async def request_vault_transfer(
    req: schemas.VaultTransactionRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Requests to move cash between the till and the branch vault."""
    try:
        txn = await teller_service.request_vault_transaction(db, current_user.id, req)
        return {"message": "Vault transaction processed.", "transaction_id": txn.id, "status": txn.status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
