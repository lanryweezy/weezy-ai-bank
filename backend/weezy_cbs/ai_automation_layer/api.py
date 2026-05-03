from typing import List, Optional, Any, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import (
    ai_model_metadata_service, ai_agent_config_service,
    workflow_service, task_service, notification_service
)
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser, get_current_active_user
from weezy_cbs.core_infrastructure_config_engine.models import User as CoreUser

# Main router for AI & Automation Layer
ai_api_router = APIRouter(
    tags=["AI & Automation Layer"],
)

# --- Agent Templates (AI Model Metadata) ---
@ai_api_router.get("/agent-templates", response_model=List[schemas.AIModelMetadataResponse])
async def list_agent_templates(db: Session = Depends(get_db)):
    templates, _ = ai_model_metadata_service.get_all_model_metadata(db)
    return templates

@ai_api_router.get("/agent-templates/{template_id}", response_model=schemas.AIModelMetadataResponse)
async def get_agent_template(template_id: UUID, db: Session = Depends(get_db)):
    template = ai_model_metadata_service.get_model_metadata_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

# --- Configured Agents ---
@ai_api_router.get("/configured-agents", response_model=List[schemas.AIAgentConfigResponse])
async def list_configured_agents(db: Session = Depends(get_db)):
    return ai_agent_config_service.get_all_agents(db)

@ai_api_router.post("/configured-agents", response_model=schemas.AIAgentConfigResponse)
async def create_configured_agent(
    agent_in: schemas.AIAgentConfigCreate,
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_superuser)
):
    return ai_agent_config_service.create_agent_config(db, agent_in, current_user.id, current_user.username)

# --- Workflows ---
@ai_api_router.get("/workflows", response_model=List[schemas.WorkflowResponse])
async def list_workflows(db: Session = Depends(get_db)):
    return workflow_service.get_all_workflows(db)

@ai_api_router.post("/workflows", response_model=schemas.WorkflowResponse)
async def create_workflow(
    workflow_in: schemas.WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_superuser)
):
    return workflow_service.create_workflow(db, workflow_in, current_user.username)

@ai_api_router.post("/workflows/{workflow_id}/start", response_model=schemas.WorkflowRunResponse)
async def run_workflow(
    workflow_id: UUID,
    triggering_data: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_user)
):
    return workflow_service.start_workflow_run(db, workflow_id, triggering_data, current_user.id, current_user.username)

@ai_api_router.get("/task-logs", response_model=List[schemas.AITaskLogResponse])
async def list_ai_task_logs(
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_superuser)
):
    """Admin tool to audit all AI autonomous decisions and processing logs."""
    return db.query(models.AITaskLog).order_by(models.AITaskLog.created_at.desc()).limit(100).all()

from .engine import WorkflowEngine

from weezy_cbs.agentic_engine.core import weezy_agentic_core

# --- Fully Agentic Prime ---
@ai_api_router.post("/prime/chat")
async def agentic_prime_chat(
    message: str = Body(..., embed=True),
    history: List[Dict] = Body([], embed=True),
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_user)
):
    """
    Talk to 'Weezy Prime', a fully agentic banking core that can execute tools.
    """
    # Prime needs customer context for certain tools
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback

    # We could inject customer_id into the prompt context here
    enriched_query = f"[Customer ID: {customer.id}, Name: {customer.first_name}] {message}"

    result = await weezy_agentic_core.chat(enriched_query, history)
    return result

