from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
import uuid

from weezy_cbs.database import get_db
from . import schemas, services, models
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Payments & NIP Integrations"],
)

@router.get("/banks", response_model=List[Dict[str, str]])
async def get_nigerian_banks(
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a list of supported Nigerian Banks and Fintechs."""
    return NigerianMarketUtils.NIGERIAN_BANKS

@router.post("/nip/name-enquiry")
async def nip_name_enquiry(
    bank_code: str = Body(..., embed=True),
    account_number: str = Body(..., embed=True),
    current_user: Any = Depends(get_current_active_user)
):
    """Performs a NIBSS NIP Name Enquiry to verify a destination account."""
    result = await NigerianMarketUtils.nip_name_enquiry(bank_code, account_number)
    if result["status"] != "success":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

# --- Webhooks and Admin could be added below as needed ---
