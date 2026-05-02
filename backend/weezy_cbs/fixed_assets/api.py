from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import assets_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Internal Fixed Assets Management"],
)

@router.get("/categories", response_model=List[schemas.AssetCategoryResponse])
async def list_asset_categories(db: Session = Depends(get_db)):
    """Returns all configured asset categories and depreciation rates."""
    # Auto-seed if empty
    assets_service.seed_categories(db)
    return db.query(models.AssetCategory).all()

@router.post("/register", response_model=schemas.FixedAssetResponse)
async def register_new_asset(
    req: schemas.FixedAssetCreate,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Registers a new bank asset and posts acquisition entries."""
    try:
        return assets_service.register_asset(db, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/inventory", response_model=List[schemas.FixedAssetResponse])
async def list_bank_assets(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns the full inventory of bank-owned fixed assets."""
    return db.query(models.FixedAsset).all()

@router.post("/depreciation/run-batch", response_model=schemas.DepreciationBatchStats)
async def trigger_depreciation_batch(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Manually triggers the monthly depreciation batch for all active assets."""
    return assets_service.run_monthly_depreciation(db)
