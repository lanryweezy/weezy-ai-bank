# Workflow Execution Engine for Weezy AI Bank
import json
import logging
from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas, services

logger = logging.getLogger(__name__)

from .gemini_service import gemini_agent_service
import asyncio

class WorkflowEngine:
    """
    Core engine responsible for executing workflow steps, 
    managing state transitions, and invoking AI agents.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.workflow_service = services.workflow_service
        self.task_service = services.task_service

    async def execute_next_steps(self, run_id: UUID):
        """
        Determines and executes the next set of tasks for a given workflow run.
        """
        run = self.db.query(models.WorkflowRun).filter(models.WorkflowRun.id == run_id).first()
        if not run or run.status != models.WorkflowStatusEnum.RUNNING:
            return

        workflow = run.workflow
        definition = workflow.definition_json
        
        steps = definition.get('steps', [])
        current_step_name = run.current_step_name
        
        next_step = self._get_next_step(steps, current_step_name)
        
        if not next_step:
            run.status = models.WorkflowStatusEnum.COMPLETED
            run.end_time = datetime.utcnow()
            self.db.commit()
            return

        await self._execute_step(run, next_step)

    async def _execute_step(self, run: models.WorkflowRun, step: Dict):
        step_name = step.get('name')
        step_type = step.get('type')
        
        run.current_step_name = step_name
        self.db.commit()

        if step_type == 'agent_execution':
            await self._handle_agent_step(run, step)
        elif step_type == 'human_review':
            self._handle_human_step(run, step)

    async def _handle_agent_step(self, run: models.WorkflowRun, step: Dict):
        agent_id = step.get('agent_id')
        agent = None
        if agent_id:
            agent = self.db.query(models.AIAgentConfig).filter(models.AIAgentConfig.id == UUID(agent_id)).first()
            
        task_in = schemas.TaskBase(
            run_id=run.id,
            step_name_in_workflow=step.get('name'),
            type=models.TaskTypeEnum.AGENT_EXECUTION,
            assigned_to_agent_id=agent.id if agent else None,
            input_data_json=run.context_json
        )
        task = self.task_service.create_task(self.db, task_in, "SYSTEM")
        
        if agent:
            # Real AI Execution
            result = await gemini_agent_service.execute_task(agent, task)
            task.status = models.TaskStatusEnum.COMPLETED
            task.output_data_json = result
            self.db.commit()
            
            # Continue workflow
            await self.execute_next_steps(run.id)
        else:
            task.status = models.TaskStatusEnum.FAILED
            task.output_data_json = {"error": "No agent configured for this step"}
            self.db.commit()

    def _handle_human_step(self, run: models.WorkflowRun, step: Dict):
        task_in = schemas.TaskBase(
            run_id=run.id,
            step_name_in_workflow=step.get('name'),
            type=models.TaskTypeEnum.HUMAN_REVIEW,
            assigned_to_role=step.get('assigned_role'),
            input_data_json=run.context_json
        )
        self.task_service.create_task(self.db, task_in, "SYSTEM")

    async def complete_task(self, task_id: UUID, output_data: Dict[str, Any], username: str):
        task = self.db.query(models.Task).filter(models.Task.id == task_id).first()
        if not task:
            return
            
        task.status = models.TaskStatusEnum.COMPLETED
        task.output_data_json = output_data
        
        run = task.run
        context = run.context_json or {}
        context[task.step_name_in_workflow] = output_data
        run.context_json = context
        
        self.db.commit()
        await self.execute_next_steps(run.id)
