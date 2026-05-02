from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import CognitiveIntentEnum

class CognitiveChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None # Pass None to start a new session
    history: List[Dict[str, Any]] = []

class CognitiveChatResponse(BaseModel):
    session_id: str
    reply: str
    detected_intent: CognitiveIntentEnum
    executed_actions: List[str]
    timestamp: datetime
    
    class Config:
        orm_mode = True

class ActionLogResponse(BaseModel):
    id: int
    user_prompt: str
    detected_intent: CognitiveIntentEnum
    system_response: str
    executed_tools: Optional[List[Dict[str, Any]]]
    created_at: datetime
    
    class Config:
        orm_mode = True
