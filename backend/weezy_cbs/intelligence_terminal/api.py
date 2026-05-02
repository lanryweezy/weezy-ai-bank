from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import services
from .services import terminal_orchestrator
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Intelligence Terminal (BI CLI)"],
)

@router.post("/execute")
async def execute_terminal_command(
    command: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Executes a terminal command and returns AI-driven data insights."""
    return await terminal_orchestrator.execute_command(db, command)
