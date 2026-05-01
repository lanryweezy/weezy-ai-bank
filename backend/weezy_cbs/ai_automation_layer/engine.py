# Workflow Execution Engine for Weezy AI Bank
import json
import logging
from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas, services

logger = logging.getLogger(__name__)

class WorkflowEngine:
    """
    Core engine responsible for executing workflow steps, 
    managing state transitions, and invoking AI agents.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.workflow_service = services.workflow_service
        self.task_service = services.task_service

    def execute_next_steps(self, run_id: UUID):
        """
        Determines and executes the next set of tasks for a given workflow run.
        """
        run = self.db.query(models.WorkflowRun).filter(models.WorkflowRun.id == run_id).first()
        if not run or run.status != models.WorkflowStatusEnum.RUNNING:
            return

        workflow = run.workflow
        definition = workflow.definition_json
        
        # 1. Identify current progress
        # For this MVP, we assume a sequential flow defined in definition['steps']
        steps = definition.get('steps', [])
        current_step_name = run.current_step_name
        
        next_step = self._get_next_step(steps, current_step_name)
        
        if not next_step:
            # Workflow completed
            run.status = models.WorkflowStatusEnum.COMPLETED
            run.end_time = datetime.utcnow()
            self.db.commit()
            logger.info(f"Workflow Run {run_id} completed successfully.")
            return

        # 2. Execute the next step
        self._execute_step(run, next_step)

    def _get_next_step(self, steps: List[Dict], current_step_name: Optional[str]) -> Optional[Dict]:
        if not current_step_name:
            return steps[0] if steps else None
        
        found = False
        for step in steps:
            if found:
                return step
            if step.get('name') == current_step_name:
                found = True
        return None

    def _execute_step(self, run: models.WorkflowRun, step: Dict):
        step_name = step.get('name')
        step_type = step.get('type')
        
        logger.info(f"Executing step '{step_name}' of type '{step_type}' for Run {run.id}")
        
        run.current_step_name = step_name
        self.db.commit()

        if step_type == 'agent_execution':
            self._handle_agent_step(run, step)
        elif step_type == 'human_review':
            self._handle_human_step(run, step)
        else:
            logger.error(f"Unknown step type: {step_type}")

    def _handle_agent_step(self, run: models.WorkflowRun, step: Dict):
        # Create a task for the agent
        agent_id = step.get('agent_id')
        if agent_id:
            agent_id = UUID(agent_id)
            
        task_in = schemas.TaskBase(
            run_id=run.id,
            step_name_in_workflow=step.get('name'),
            type=models.TaskTypeEnum.AGENT_EXECUTION,
            assigned_to_agent_id=agent_id,
            input_data_json=run.context_json
        )
        task = self.task_service.create_task(self.db, task_in, "SYSTEM")
        
        # In a real system, this would trigger an async celery task or agent worker.
        # For the "Improving" phase, we'll simulate an immediate successful execution 
        # if it's a mock/demo logic.
        self._simulate_agent_work(task)

    def _handle_human_step(self, run: models.WorkflowRun, step: Dict):
        # Human review tasks stop the automated flow until completed
        task_in = schemas.TaskBase(
            run_id=run.id,
            step_name_in_workflow=step.get('name'),
            type=models.TaskTypeEnum.HUMAN_REVIEW,
            assigned_to_role=step.get('assigned_role'),
            input_data_json=run.context_json
        )
        self.task_service.create_task(self.db, task_in, "SYSTEM")
        # Workflow status remains RUNNING but no more automated steps until this task is COMPLETED

    def _simulate_agent_work(self, task: models.Task):
        """Simulates agent logic for demo purposes."""
        task.status = models.TaskStatusEnum.COMPLETED
        task.output_data_json = {"result": "Success", "summary": f"Agent processed step {task.step_name_in_workflow}"}
        self.db.commit()
        
        # Continue workflow
        self.execute_next_steps(task.run_id)

    def complete_task(self, task_id: UUID, output_data: Dict[str, Any], username: str):
        """Called when a human or agent completes a task."""
        task = self.db.query(models.Task).filter(models.Task.id == task_id).first()
        if not task:
            return
            
        task.status = models.TaskStatusEnum.COMPLETED
        task.output_data_json = output_data
        
        # Merge task output into workflow context
        run = task.run
        context = run.context_json or {}
        context[task.step_name_in_workflow] = output_data
        run.context_json = context
        
        self.db.commit()
        
        # Trigger next steps
        self.execute_next_steps(run.id)
