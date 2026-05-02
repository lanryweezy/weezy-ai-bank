from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import collateral_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Loan Collateral Management"],
)

@router.post("/pledge", response_model=schemas.CollateralResponse)
async def pledge_loan_collateral(
    req: schemas.CollateralCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Pledges an asset against a loan. Initiates AI analysis."""
    try:
        collateral = collateral_service.pledge_collateral(db, req)
        # Trigger background AI analysis
        await collateral_service.analyze_collateral_ai(db, collateral.id)
        return collateral
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=List[schemas.CollateralResponse])
async def list_my_collaterals(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a list of all assets pledged by the current user."""
    return db.query(models.Collateral).filter(models.Collateral.customer_id == current_user.id).all()

@router.get("/application/{app_id}", response_model=List[schemas.CollateralResponse])
async def get_collateral_for_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns assets linked to a specific loan application."""
    return db.query(models.Collateral).filter(models.Collateral.application_id == app_id).all()

@router.post("/{collateral_id}/revalue")
async def update_asset_valuation(
    collateral_id: int,
    req: schemas.ValuationUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to update the market value of a pledged asset."""
    return collateral_service.update_valuation(db, collateral_id, current_admin.id, req)
