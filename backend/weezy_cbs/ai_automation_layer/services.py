import json
from typing import List, Optional, Type, Dict, Any, Tuple, Union
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from uuid import UUID
import uuid
import asyncio
import random

from . import models, schemas
from weezy_cbs.core_infrastructure_config_engine.services import AuditLogService

# --- Base AI Service ---
class BaseAIService:
    def _audit_log(self, db: Session, action: str, entity_type: str, entity_id: Any, summary: str = "", performing_user: str = "SYSTEM"):
        AuditLogService.create_audit_log_entry(
            db, username_performing_action=performing_user, action_type=action,
            entity_type=entity_type, entity_id=str(entity_id), summary=summary
        )

# --- AIModelMetadata Service ---
class AIModelMetadataService(BaseAIService):
    def create_model_metadata(self, db: Session, metadata_in: schemas.AIModelMetadataCreate, user_id: Optional[int], username: str) -> models.AIModelMetadata:
        if db.query(models.AIModelMetadata).filter(models.AIModelMetadata.model_name == metadata_in.model_name).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"AI Model with name '{metadata_in.model_name}' already exists.")

        db_metadata = models.AIModelMetadata(
            model_name=metadata_in.model_name,
            model_type=metadata_in.model_type,
            version=metadata_in.version,
            description=metadata_in.description,
            source_type=metadata_in.source_type,
            source_identifier=metadata_in.source_identifier,
            input_schema_json=metadata_in.input_schema_json,
            output_schema_json=metadata_in.output_schema_json,
            status=metadata_in.status,
            performance_metrics_json=metadata_in.performance_metrics_json,
            created_by_user_id=user_id,
            deployed_at=datetime.utcnow() if metadata_in.status == models.AIModelStatusEnum.ACTIVE else None
        )
        db.add(db_metadata)
        db.commit()
        db.refresh(db_metadata)
        self._audit_log(db, "AI_MODEL_METADATA_CREATE", "AIModelMetadata", db_metadata.id, f"AI Model '{db_metadata.model_name}' metadata created.", username)
        return db_metadata

    def get_model_metadata_by_id(self, db: Session, model_id: UUID) -> Optional[models.AIModelMetadata]:
        return db.query(models.AIModelMetadata).filter(models.AIModelMetadata.id == model_id).first()

    def get_all_model_metadata(self, db: Session, skip: int = 0, limit: int = 100) -> Tuple[List[models.AIModelMetadata], int]:
        query = db.query(models.AIModelMetadata)
        total = query.count()
        metadata_list = query.order_by(models.AIModelMetadata.model_name).offset(skip).limit(limit).all()
        return metadata_list, total

# --- AIAgentConfig Service ---
class AIAgentConfigService(BaseAIService):
    def create_agent_config(self, db: Session, agent_in: schemas.AIAgentConfigCreate, user_id: Optional[int], username: str) -> models.AIAgentConfig:
        db_agent = models.AIAgentConfig(
            agent_name=agent_in.agent_name,
            template_id=agent_in.template_id,
            role_description=agent_in.role_description,
            goal_description=agent_in.goal_description,
            backstory=agent_in.backstory,
            llm_config_json=agent_in.llm_config_json,
            tools_config_json=agent_in.tools_config_json,
            configuration_json=agent_in.configuration_json,
            is_active=agent_in.is_active,
            version=agent_in.version,
            created_by_user_id=user_id
        )
        db.add(db_agent)
        db.commit()
        db.refresh(db_agent)
        self._audit_log(db, "AI_AGENT_CONFIG_CREATE", "AIAgentConfig", db_agent.id, f"AI Agent '{db_agent.agent_name}' created.", username)
        return db_agent

    def get_all_agents(self, db: Session) -> List[models.AIAgentConfig]:
        return db.query(models.AIAgentConfig).filter(models.AIAgentConfig.is_active == True).all()

from .engine import WorkflowEngine

# --- Workflow Service ---
class WorkflowService(BaseAIService):
    def create_workflow(self, db: Session, workflow_in: schemas.WorkflowCreate, username: str) -> models.Workflow:
        db_workflow = models.Workflow(
            name=workflow_in.name,
            description=workflow_in.description,
            definition_json=workflow_in.definition_json,
            version=workflow_in.version,
            is_active=workflow_in.is_active
        )
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)
        self._audit_log(db, "WORKFLOW_CREATE", "Workflow", db_workflow.id, f"Workflow '{db_workflow.name}' created.", username)
        return db_workflow

    def get_all_workflows(self, db: Session) -> List[models.Workflow]:
        return db.query(models.Workflow).filter(models.Workflow.is_active == True).all()

    def get_workflow_by_id(self, db: Session, workflow_id: UUID) -> Optional[models.Workflow]:
        return db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()

    def start_workflow_run(self, db: Session, workflow_id: UUID, triggering_data: Optional[Dict[str, Any]], user_id: Optional[int], username: str) -> models.WorkflowRun:
        workflow = self.get_workflow_by_id(db, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        db_run = models.WorkflowRun(
            workflow_id=workflow_id,
            triggering_user_id=user_id,
            triggering_data_json=triggering_data,
            status=models.WorkflowStatusEnum.RUNNING,
            context_json=triggering_data or {}
        )
        db.add(db_run)
        db.commit()
        db.refresh(db_run)
        
        self._audit_log(db, "WORKFLOW_RUN_START", "WorkflowRun", db_run.id, f"Run started for workflow '{workflow.name}'.", username)
        
        # Trigger the engine
        engine = WorkflowEngine(db)
        engine.execute_next_steps(db_run.id)
        
        db.refresh(db_run)
        return db_run

# --- Task Service ---
class TaskService(BaseAIService):
    def create_task(self, db: Session, task_in: schemas.TaskBase, username: str) -> models.Task:
        db_task = models.Task(
            run_id=task_in.run_id,
            step_name_in_workflow=task_in.step_name_in_workflow,
            type=task_in.type,
            assigned_to_agent_id=task_in.assigned_to_agent_id,
            assigned_to_user_id=task_in.assigned_to_user_id,
            assigned_to_role=task_in.assigned_to_role,
            input_data_json=task_in.input_data_json,
            status=models.TaskStatusEnum.PENDING
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        self._audit_log(db, "TASK_CREATE", "Task", db_task.id, f"Task '{db_task.step_name_in_workflow}' created.", username)
        return db_task

    def get_tasks_for_user(self, db: Session, user_id: int) -> List[models.Task]:
        return db.query(models.Task).filter(models.Task.assigned_to_user_id == user_id).all()

# --- Notification Service ---
class NotificationService(BaseAIService):
    def create_notification(self, db: Session, user_id: int, type: str, message: str, related_type: str = None, related_id: UUID = None) -> models.Notification:
        db_notif = models.Notification(
            user_id=user_id,
            type=type,
            message=message,
            related_entity_type=related_type,
            related_entity_id=related_id
        )
        db.add(db_notif)
        db.commit()
        db.refresh(db_notif)
        return db_notif

# Instances
ai_model_metadata_service = AIModelMetadataService()
ai_agent_config_service = AIAgentConfigService()
workflow_service = WorkflowService()
task_service = TaskService()
notification_service = NotificationService()
