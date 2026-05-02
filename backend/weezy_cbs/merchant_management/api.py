from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import merchant_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Merchant Management & POS"],
)

@router.post("/register", response_model=schemas.MerchantProfileResponse)
async def register_merchant(
    merchant_in: schemas.MerchantProfileCreate,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Registers a new business merchant for POS services."""
    return merchant_service.create_merchant(db, merchant_in)

@router.post("/terminals/register", response_model=schemas.POSTerminalResponse)
async def register_pos_terminal(
    merchant_id: int = Body(...),
    serial_number: str = Body(...),
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Allocates a new POS terminal to a merchant."""
    return merchant_service.register_terminal(db, merchant_id, serial_number)

@router.post("/pos/authorize")
async def authorize_pos_purchase(
    request: schemas.POSTransactionRequest,
    db: Session = Depends(get_db)
):
    """Endpoint for POS terminals to authorize card purchases."""
    return await merchant_service.authorize_pos_transaction(db, request)

@router.post("/settlement/run-daily")
async def trigger_t1_settlement(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to run the Nigerian T+1 Merchant Settlement engine."""
    await merchant_service.run_daily_settlement(db)
    return {"message": "Settlement process completed."}

@router.get("/{merchant_id}/dashboard")
async def get_merchant_dashboard(
    merchant_id: int,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns sales volume and upcoming settlement stats for a merchant."""
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
        
    terminals = db.query(models.POSTerminal).filter(models.POSTerminal.merchant_id == merchant_id).count()
    settlements = db.query(models.POSSettlement).filter(models.POSSettlement.merchant_id == merchant_id).order_by(models.POSSettlement.settlement_date.desc()).limit(10).all()
    
    return {
        "business_name": merchant.business_name,
        "merchant_id_code": merchant.merchant_id,
        "active_terminals": terminals,
        "recent_settlements": settlements
    }
