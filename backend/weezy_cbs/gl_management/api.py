from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services
from .services import gl_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["General Ledger (Chart of Accounts)"],
)

@router.get("/coa", response_model=schemas.ChartOfAccountsResponse)
async def get_chart_of_accounts(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Retrieves the full Chart of Accounts grouped by GL type."""
    return gl_service.get_chart_of_accounts(db)

@router.post("/accounts", response_model=schemas.GLAccountResponse)
async def create_new_gl_account(
    acc_in: schemas.GLAccountCreate,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Creates a new General Ledger account."""
    try:
        gl = gl_service.create_gl_account(db, acc_in)
        # Ensure enum values are returned as strings if necessary
        # SQLA Enum often returns the enum member. We might need a small patch depending on Pydantic config.
        # For safety, pydantic ORM mode usually handles it, but let's test if it crashes.
        return gl
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
