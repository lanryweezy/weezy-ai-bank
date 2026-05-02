from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import standing_instruction_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Standing Instructions & ACH"],
)

@router.post("/create", response_model=schemas.SIResponse)
async def create_standing_instruction(
    req: schemas.SICreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Creates a new recurring payment instruction."""
    try:
        return standing_instruction_service.create_instruction(db, current_user.id, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=List[schemas.SIResponse])
async def list_my_instructions(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns all active recurring schedules for the logged-in user."""
    return db.query(models.StandingInstruction).filter(models.StandingInstruction.customer_id == current_user.id).all()

@router.post("/{si_id}/cancel")
async def cancel_instruction(
    si_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Permanently stops a recurring payment schedule."""
    si = db.query(models.StandingInstruction).filter(
        models.StandingInstruction.id == si_id,
        models.StandingInstruction.customer_id == current_user.id
    ).first()
    if not si: raise HTTPException(status_code=404, detail="Instruction not found")
    
    si.status = models.SIStatusEnum.CANCELLED
    db.commit()
    return {"message": "Instruction cancelled."}

@router.get("/{si_id}/logs", response_model=List[schemas.SIExecutionLogResponse])
async def get_instruction_logs(
    si_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the execution history for a specific instruction."""
    return db.query(models.SIExecutionLog).filter(models.SIExecutionLog.si_id == si_id).order_by(models.SIExecutionLog.execution_date.desc()).all()

@router.post("/admin/process-batch")
async def trigger_si_batch(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to manually trigger the daily SI processing batch."""
    count = await standing_instruction_service.process_due_instructions(db)
    return {"message": f"Processed {count} instructions."}
