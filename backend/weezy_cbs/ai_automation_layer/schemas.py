from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID
import enum

from .models import (
    AIModelTypeEnum, AIModelStatusEnum, AITaskStatusEnum,
    WorkflowStatusEnum, TaskTypeEnum, TaskStatusEnum
)

# --- AI Model Metadata Schemas ---
class AIModelMetadataBase(BaseModel):
    model_name: str
    model_type: AIModelTypeEnum
    version: str = "1.0.0"
    description: Optional[str] = None
    source_type: str
    source_identifier: str
    input_schema_json: Optional[Dict[str, Any]] = None
    output_schema_json: Optional[Dict[str, Any]] = None
    status: AIModelStatusEnum = AIModelStatusEnum.ACTIVE
    performance_metrics_json: Optional[Dict[str, Any]] = None

class AIModelMetadataCreate(AIModelMetadataBase):
    pass

class AIModelMetadataUpdate(BaseModel):
    model_name: Optional[str] = None
    model_type: Optional[AIModelTypeEnum] = None
    version: Optional[str] = None
    description: Optional[str] = None
    status: Optional[AIModelStatusEnum] = None
    performance_metrics_json: Optional[Dict[str, Any]] = None

class AIModelMetadataResponse(AIModelMetadataBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedAIModelMetadataResponse(BaseModel):
    items: List[AIModelMetadataResponse]
    total: int
    page: int
    size: int

# --- AI Agent Config Schemas ---
class AIAgentConfigBase(BaseModel):
    agent_name: str
    template_id: Optional[UUID] = None
    role_description: str
    goal_description: str
    backstory: Optional[str] = None
    llm_config_json: Optional[Dict[str, Any]] = None
    tools_config_json: Optional[Dict[str, Any]] = None
    configuration_json: Optional[Dict[str, Any]] = None
    is_active: bool = True
    version: str = "1.0"

class AIAgentConfigCreate(AIAgentConfigBase):
    pass

class AIAgentConfigUpdate(BaseModel):
    agent_name: Optional[str] = None
    role_description: Optional[str] = None
    goal_description: Optional[str] = None
    is_active: Optional[bool] = None

class AIAgentConfigResponse(AIAgentConfigBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Workflow Schemas ---
class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    definition_json: Dict[str, Any]
    version: int = 1
    is_active: bool = True

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowResponse(WorkflowBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Workflow Run Schemas ---
class WorkflowRunBase(BaseModel):
    workflow_id: UUID
    triggering_data_json: Optional[Dict[str, Any]] = None

class WorkflowRunCreate(WorkflowRunBase):
    pass

class WorkflowRunResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    status: WorkflowStatusEnum
    current_step_name: Optional[str] = None
    context_json: Optional[Dict[str, Any]] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    results_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    run_id: UUID
    step_name_in_workflow: str
    type: TaskTypeEnum
    assigned_to_agent_id: Optional[UUID] = None
    assigned_to_user_id: Optional[int] = None
    assigned_to_role: Optional[str] = None
    input_data_json: Optional[Dict[str, Any]] = None

class TaskResponse(TaskBase):
    id: UUID
    status: TaskStatusEnum
    output_data_json: Optional[Dict[str, Any]] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: UUID
    user_id: int
    type: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True
