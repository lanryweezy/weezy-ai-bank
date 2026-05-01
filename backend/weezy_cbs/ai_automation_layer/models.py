# Database models for AI & Automation Layer Module
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLAlchemyEnum, Float, Index, JSON
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid

from weezy_cbs.database import Base # Use the shared Base

class AIModelTypeEnum(enum.Enum):
    CREDIT_SCORING_ML = "CREDIT_SCORING_ML"
    FRAUD_DETECTION_ML = "FRAUD_DETECTION_ML"
    TRANSACTION_CLASSIFICATION_ML = "TRANSACTION_CLASSIFICATION_ML"
    CUSTOMER_SEGMENTATION_ML = "CUSTOMER_SEGMENTATION_ML"
    LLM_TEXT_GENERATION = "LLM_TEXT_GENERATION"
    LLM_EMBEDDING = "LLM_EMBEDDING"
    LLM_TASK_AUTOMATION = "LLM_TASK_AUTOMATION"
    RECOMMENDATION_ENGINE_ML = "RECOMMENDATION_ENGINE_ML"
    OCR_DOCUMENT_PARSING = "OCR_DOCUMENT_PARSING"
    FACE_MATCH_BIOMETRIC = "FACE_MATCH_BIOMETRIC"
    OTHER_AI_SERVICE = "OTHER_AI_SERVICE"

class AIModelStatusEnum(enum.Enum):
    ACTIVE = "ACTIVE"; INACTIVE = "INACTIVE"; EXPERIMENTAL = "EXPERIMENTAL"
    TRAINING = "TRAINING"; DEPLOYING = "DEPLOYING"; ERROR = "ERROR"; ARCHIVED = "ARCHIVED"

class AITaskStatusEnum(enum.Enum):
    PENDING = "PENDING"; PROCESSING = "PROCESSING"; SUCCESS = "SUCCESS"
    FAILED = "FAILED"; REQUIRES_HUMAN_REVIEW = "REQUIRES_HUMAN_REVIEW"; CANCELLED = "CANCELLED"

class WorkflowStatusEnum(enum.Enum):
    PENDING = "pending"; RUNNING = "running"; IN_PROGRESS = "in_progress"
    COMPLETED = "completed"; FAILED = "failed"; CANCELLED = "cancelled"

class TaskTypeEnum(enum.Enum):
    AGENT_EXECUTION = "agent_execution"; HUMAN_REVIEW = "human_review"
    DATA_INPUT = "data_input"; DECISION = "decision"; SUB_WORKFLOW = "sub_workflow"

class TaskStatusEnum(enum.Enum):
    PENDING = "pending"; ASSIGNED = "assigned"; IN_PROGRESS = "in_progress"
    COMPLETED = "completed"; FAILED = "failed"; SKIPPED = "skipped"
    REQUIRES_ESCALATION = "requires_escalation"

class AIModelMetadata(Base):
    __tablename__ = "ai_model_metadata"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name = Column(String(150), unique=True, nullable=False, index=True)
    model_type = Column(SQLAlchemyEnum(AIModelTypeEnum), nullable=False, index=True)
    version = Column(String(20), nullable=False, default="1.0.0")
    description = Column(Text, nullable=True)

    source_type = Column(String(50), nullable=False)
    source_identifier = Column(Text, nullable=False)

    input_schema_json = Column(JSON, nullable=True)
    output_schema_json = Column(JSON, nullable=True)

    status = Column(SQLAlchemyEnum(AIModelStatusEnum), default=AIModelStatusEnum.ACTIVE, nullable=False, index=True)
    deployed_at = Column(DateTime(timezone=True), nullable=True)
    performance_metrics_json = Column(JSON, nullable=True)

    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    task_logs = relationship("AITaskLog", back_populates="model_metadata")
    agent_configs = relationship("AIAgentConfig", back_populates="template")

class AITaskLog(Base):
    __tablename__ = "ai_task_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_metadata_id = Column(UUID(as_uuid=True), ForeignKey("ai_model_metadata.id"), nullable=True)

    task_name = Column(String(150), index=True, nullable=False)
    related_entity_type = Column(String(50), nullable=True, index=True)
    related_entity_id = Column(String(50), nullable=True, index=True)

    input_data_summary_json = Column(JSON, nullable=True)
    output_data_summary_json = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)

    status = Column(SQLAlchemyEnum(AITaskStatusEnum), default=AITaskStatusEnum.PENDING, nullable=False, index=True)
    error_message = Column(Text, nullable=True)
    processing_duration_ms = Column(Integer, nullable=True)

    user_triggering_task_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    correlation_id = Column(String(100), index=True, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    model_metadata = relationship("AIModelMetadata", back_populates="task_logs")

class AIAgentConfig(Base):
    __tablename__ = "ai_agent_configs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("ai_model_metadata.id"), nullable=True)
    agent_name = Column(String(100), unique=True, nullable=False, index=True)
    role_description = Column(Text, nullable=False)
    goal_description = Column(Text, nullable=False)
    backstory = Column(Text, nullable=True)

    llm_config_json = Column(JSON, nullable=True)
    tools_config_json = Column(JSON, nullable=True)
    configuration_json = Column(JSON, nullable=True) # For template-based config

    is_active = Column(Boolean, default=True, nullable=False, index=True)
    version = Column(String(20), default="1.0", nullable=False)

    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    template = relationship("AIModelMetadata", back_populates="agent_configs")
    tasks = relationship("Task", back_populates="assigned_agent")

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    definition_json = Column(JSON, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    runs = relationship("WorkflowRun", back_populates="workflow")

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    triggering_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    triggering_data_json = Column(JSON, nullable=True)
    status = Column(SQLAlchemyEnum(WorkflowStatusEnum), default=WorkflowStatusEnum.PENDING, nullable=False)
    current_step_name = Column(String(255), nullable=True)
    context_json = Column(JSON, nullable=True)
    
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    results_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    workflow = relationship("Workflow", back_populates="runs")
    tasks = relationship("Task", back_populates="run")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_runs.id", ondelete="CASCADE"), nullable=False)
    step_name_in_workflow = Column(String(255), nullable=False)
    type = Column(SQLAlchemyEnum(TaskTypeEnum), nullable=False)
    assigned_to_agent_id = Column(UUID(as_uuid=True), ForeignKey("ai_agent_configs.id"), nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to_role = Column(String(50), nullable=True)
    
    status = Column(SQLAlchemyEnum(TaskStatusEnum), default=TaskStatusEnum.PENDING, nullable=False)
    input_data_json = Column(JSON, nullable=True)
    output_data_json = Column(JSON, nullable=True)
    
    due_date = Column(DateTime(timezone=True), nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    run = relationship("WorkflowRun", back_populates="tasks")
    assigned_agent = relationship("AIAgentConfig", back_populates="tasks")
    comments = relationship("TaskComment", back_populates="task")

class TaskComment(Base):
    __tablename__ = "task_comments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_text = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    task = relationship("Task", back_populates="comments")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(UUID(as_uuid=True), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

