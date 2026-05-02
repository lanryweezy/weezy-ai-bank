from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import cognitive_orchestrator
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["AI-Native Cognitive Core"],
)

@router.post("/converse", response_model=schemas.CognitiveChatResponse)
async def converse_with_core(
    request: schemas.CognitiveChatRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """
    Main entry point for natural language banking.
    The Cognitive Core will interpret the intent and autonomously call the necessary backend tools.
    """
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    
    try:
        return await cognitive_orchestrator.process_intent(db, request, customer.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/me/logs", response_model=List[schemas.ActionLogResponse])
async def get_my_cognitive_logs(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a history of all AI-executed actions on behalf of the user."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first()
    
    sessions = db.query(models.CognitiveSession).filter(models.CognitiveSession.customer_id == customer.id).all()
    session_ids = [s.session_id for s in sessions]
    
    if not session_ids:
        return []
        
    return db.query(models.CognitiveActionLog).filter(
        models.CognitiveActionLog.session_id.in_(session_ids)
    ).order_by(models.CognitiveActionLog.created_at.desc()).limit(20).all()
