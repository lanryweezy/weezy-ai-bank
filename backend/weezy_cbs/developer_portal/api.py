from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
import secrets
import hashlib

from weezy_cbs.database import get_db
from . import models
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Developer Portal"],
)

@router.post("/keys/generate")
async def generate_api_key(
    key_name: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Generates a new API Key for developer access."""
    raw_key = f"wzy_{secrets.token_urlsafe(32)}"
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
    
    db_key = models.APIKey(
        user_id=current_user.id,
        key_name=key_name,
        api_key_hashed=hashed_key,
        api_key_hint=f"{raw_key[:7]}...{raw_key[-4:]}"
    )
    db.add(db_key)
    db.commit()
    
    return {
        "key_name": key_name,
        "api_key": raw_key,
        "message": "Copy this key now. It will not be shown again."
    }

@router.get("/keys/me")
async def list_my_keys(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Lists all active API keys for the current user."""
    return db.query(models.APIKey).filter(models.APIKey.user_id == current_user.id).all()

@router.get("/mcp/config")
async def get_mcp_configuration(
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the configuration needed to connect an external AI to Weezy Bank via MCP."""
    return {
        "mcp_server_name": "Weezy AI Bank",
        "transport": "sse",
        "endpoint": "http://localhost:8000/api/mcp/sse",
        "capabilities": ["tools", "resources"],
        "instructions": "Add this to your Claude desktop config or Cursor MCP settings."
    }
