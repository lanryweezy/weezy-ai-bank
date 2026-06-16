from pydantic import BaseModel, Field, field_validator, ValidationInfo, Json
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import json

from .models import (
    ReportQueryLogicTypeEnum, ReportStatusEnum, ScheduledReportStatusEnum
)

# --- Helper Schemas for JSON fields ---

class ReportParameterDefinition(BaseModel):
    name: str
    type: str = Field("string", description="e.g., string, integer, date, boolean, enum")
    label: Optional[str] = None
    required: bool = False
    default_value: Optional[Any] = None
    options: Optional[List[Any]] = Field(None, description="For enum type")

class ReportParametersSchema(BaseModel):
    parameters: List[ReportParameterDefinition] = []


class QueryDetailsSQL(BaseModel):
    sql_template: str = Field(..., description="SQL query with placeholders like :param_name")

class QueryDetailsDynamicFilters(BaseModel):
    base_model_name: str = Field(..., description="e.g., Customer, Account, Transaction")
    allowed_filter_fields: List[str]
    default_select_fields: Optional[List[str]] = None
    default_sort_by: Optional[str] = None


class DashboardWidgetConfig(BaseModel):
    id: str = Field(..., description="Unique ID for the widget on the dashboard")
    report_code: Optional[str] = Field(None, description="ReportDefinition code to source data for this widget")
    metric_key: Optional[str] = Field(None, description="Specific metric key")
    viz_type: str = Field(..., description="e.g., LINE_CHART, BAR_CHART, KPI_VALUE, TABLE")
    title: Optional[str] = None
    col: int
    row: int
    width: int
    height: int
    report_params: Optional[Dict[str, Any]] = None
    viz_options: Optional[Dict[str, Any]] = None


# --- ReportDefinition Schemas ---
class ReportDefinitionBase(BaseModel):
    report_code: str = Field(..., max_length=50, pattern=r"^[A-Z0-9_]+$", description="Unique code")
    report_name: str = Field(..., max_length=150)
    description: Optional[str] = None
    source_modules_json: Optional[List[str]] = Field(None)
    query_logic_type: ReportQueryLogicTypeEnum
    query_details_json: Union[QueryDetailsSQL, QueryDetailsDynamicFilters, Dict[str, Any]]
    parameters_schema_json: Optional[ReportParametersSchema] = Field(None)
    default_output_formats_json: Optional[List[str]] = Field(["CSV", "JSON"])
    allowed_roles_json: Optional[List[str]] = Field(None)
    is_system_report: bool = False
    version: int = Field(1, ge=1)

    @field_validator('source_modules_json', 'default_output_formats_json', 'allowed_roles_json', 'query_details_json', 'parameters_schema_json', mode='before')
    @classmethod
    def parse_json_fields_v2(cls, value, info: ValidationInfo):
        field_name = info.field_name
        if value is None: return None
        if isinstance(value, str):
            try:
                parsed_value = json.loads(value)
                if field_name == 'parameters_schema_json' and parsed_value is not None:
                    return ReportParametersSchema.model_validate(parsed_value)
                return parsed_value
            except json.JSONDecodeError:
                raise ValueError(f"Invalid JSON string for {field_name}")
        if field_name == 'parameters_schema_json' and isinstance(value, dict) and value is not None:
             return ReportParametersSchema.model_validate(value)
        return value


class ReportDefinitionCreate(ReportDefinitionBase):
    pass

class ReportDefinitionUpdate(BaseModel):
    report_name: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    source_modules_json: Optional[List[str]] = None
    query_logic_type: Optional[ReportQueryLogicTypeEnum] = None
    query_details_json: Optional[Union[QueryDetailsSQL, QueryDetailsDynamicFilters, Dict[str, Any]]] = None
    parameters_schema_json: Optional[ReportParametersSchema] = None
    default_output_formats_json: Optional[List[str]] = None
    allowed_roles_json: Optional[List[str]] = None
    is_system_report: Optional[bool] = None
    version: Optional[int] = Field(None, ge=1)

    @field_validator('source_modules_json', 'default_output_formats_json', 'allowed_roles_json', 'query_details_json', 'parameters_schema_json', mode='before')
    @classmethod
    def parse_update_json_fields(cls, value, info: ValidationInfo):
        field_name = info.field_name
        if value is None: return None
        if isinstance(value, str):
            try:
                parsed_value = json.loads(value)
                if field_name == 'parameters_schema_json' and parsed_value is not None:
                    return ReportParametersSchema.model_validate(parsed_value)
                return parsed_value
            except json.JSONDecodeError:
                raise ValueError(f"Invalid JSON string for {field_name}")
        if field_name == 'parameters_schema_json' and isinstance(value, dict) and value is not None:
             return ReportParametersSchema.model_validate(value)
        return value

class ReportDefinitionResponse(ReportDefinitionBase):
    id: int
    created_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


# --- ScheduledReport Schemas ---
class ScheduledReportBase(BaseModel):
    report_definition_id: int
    schedule_name: Optional[str] = Field(None, max_length=150)
    cron_expression: str = Field(..., max_length=100)
    parameters_values_json: Optional[Dict[str, Any]] = Field(None)
    output_format: str = Field("CSV", max_length=10)
    recipients_json: Optional[List[str]] = Field(None)
    status: ScheduledReportStatusEnum = ScheduledReportStatusEnum.ACTIVE

    @field_validator('parameters_values_json', 'recipients_json', mode='before')
    @classmethod
    def parse_json_fields_scheduled(cls, value):
        if isinstance(value, str):
            try: return json.loads(value)
            except json.JSONDecodeError: raise ValueError("Invalid JSON string")
        return value

class ScheduledReportCreate(ScheduledReportBase):
    pass

class ScheduledReportUpdate(BaseModel):
    schedule_name: Optional[str] = Field(None, max_length=150)
    cron_expression: Optional[str] = Field(None, max_length=100)
    parameters_values_json: Optional[Dict[str, Any]] = None
    output_format: Optional[str] = Field(None, max_length=10)
    recipients_json: Optional[List[str]] = None
    status: Optional[ScheduledReportStatusEnum] = None

    @field_validator('parameters_values_json', 'recipients_json', mode='before')
    @classmethod
    def parse_update_json_fields_scheduled(cls, value):
        if value is None: return None
        if isinstance(value, str):
            try: return json.loads(value)
            except json.JSONDecodeError: raise ValueError("Invalid JSON string")
        return value

class ScheduledReportResponse(ScheduledReportBase):
    id: int
    report_definition: Optional[ReportDefinitionResponse] = None
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    last_run_status: Optional[ReportStatusEnum] = None
    last_error_message: Optional[str] = None
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


# --- GeneratedReportLog Schemas ---
class GeneratedReportLogResponse(BaseModel):
    id: int
    report_definition_id: Optional[int] = None
    scheduled_report_id: Optional[int] = None
    report_name_generated: str
    generated_by_user_id: int
    generation_timestamp: datetime
    parameters_used_json: Optional[Dict[str, Any]] = None
    output_format: str
    status: ReportStatusEnum
    file_name: Optional[str] = None
    file_path_or_link: Optional[str] = None
    file_size_bytes: Optional[int] = None
    error_message: Optional[str] = None
    processing_time_seconds: Optional[int] = None
    report_definition_code: Optional[str] = None

    @field_validator('parameters_used_json', mode='before')
    @classmethod
    def parse_params_json(cls, value):
        if isinstance(value, str):
            try: return json.loads(value)
            except json.JSONDecodeError: return None
        return value

    class Config:
        from_attributes = True
        use_enum_values = True


# --- DashboardLayout Schemas ---
class DashboardLayoutBase(BaseModel):
    dashboard_name: str = Field(..., max_length=100)
    layout_config_json: List[DashboardWidgetConfig]
    is_default: bool = False

    @field_validator('layout_config_json', mode='before')
    @classmethod
    def parse_layout_json(cls, value):
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [DashboardWidgetConfig.model_validate(item) for item in parsed]
                raise ValueError("layout_config_json must be a list of widget configurations")
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON string for layout_config_json")
        elif isinstance(value, list):
             return [DashboardWidgetConfig.model_validate(item) for item in value]
        return value


class DashboardLayoutCreate(DashboardLayoutBase):
    pass

class DashboardLayoutUpdate(BaseModel):
    dashboard_name: Optional[str] = Field(None, max_length=100)
    layout_config_json: Optional[List[DashboardWidgetConfig]] = None
    is_default: Optional[bool] = None

    @field_validator('layout_config_json', mode='before')
    @classmethod
    def parse_update_layout_json(cls, value):
        if value is None: return None
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [DashboardWidgetConfig.model_validate(item) for item in parsed]
                raise ValueError("layout_config_json must be a list of widget configurations")
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON string for layout_config_json")
        elif isinstance(value, list):
             return [DashboardWidgetConfig.model_validate(item) for item in value]
        return value


class DashboardLayoutResponse(DashboardLayoutBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- AdHoc Report Request & Response ---
class AdHocReportRequest(BaseModel):
    report_name: str = Field("Ad-hoc Report", max_length=200)
    query_logic_type: ReportQueryLogicTypeEnum
    query_details: Union[QueryDetailsSQL, QueryDetailsDynamicFilters, Dict[str, Any]]
    parameters: Optional[Dict[str, Any]] = Field(None)
    output_format: str = Field("JSON")

class ReportDataResponse(BaseModel):
    report_name: str
    generation_timestamp: datetime
    output_format: str
    data: Union[List[Dict[str, Any]], str, Dict[str, Any]]
    row_count: Optional[int] = None
    error_message: Optional[str] = None
    log_id: Optional[int] = Field(None)


# --- Paginated Responses ---
class PaginatedReportDefinitionResponse(BaseModel):
    items: List[ReportDefinitionResponse]
    total: int
    page: int
    size: int

class PaginatedScheduledReportResponse(BaseModel):
    items: List[ScheduledReportResponse]
    total: int
    page: int
    size: int

class PaginatedGeneratedReportLogResponse(BaseModel):
    items: List[GeneratedReportLogResponse]
    total: int
    page: int
    size: int

class PaginatedDashboardLayoutResponse(BaseModel):
    items: List[DashboardLayoutResponse]
    total: int
    page: int
    size: int
