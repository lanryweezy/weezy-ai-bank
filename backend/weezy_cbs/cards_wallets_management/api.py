from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
import decimal

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import wallet_service, card_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Wallets & Mobile Money"],
)

@router.post("/wallets/create", response_model=schemas.WalletAccountResponse)
async def create_new_wallet(
    phone_number: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Creates a new digital wallet for the logged-in customer."""
    # current_user would have a customer_id in a real app
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
        
    return wallet_service.create_wallet(db, customer.id, phone_number)

@router.post("/wallets/p2p-transfer")
async def wallet_p2p_transfer(
    receiver_phone: str = Body(...),
    amount: decimal.Decimal = Body(...),
    narration: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Sends money from current user's wallet to another phone number."""
    # Find user's wallet
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    user_wallet = db.query(models.WalletAccount).filter(models.WalletAccount.customer_id == customer.id).first()
    
    if not user_wallet:
        raise HTTPException(status_code=404, detail="You do not have an active wallet")
        
    return await wallet_service.wallet_to_wallet_transfer(
        db, 
        sender_phone=user_wallet.phone_number, 
        receiver_phone=receiver_phone, 
        amount=amount, 
        narration=narration
    )

@router.get("/me", response_model=schemas.WalletAccountResponse)
async def get_my_wallet(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the logged-in user's wallet details."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first()
    wallet = db.query(models.WalletAccount).filter(models.WalletAccount.customer_id == customer.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

# --- Card Endpoints ---
@router.post("/cards/request", response_model=schemas.CardResponse)
async def request_new_card(
    card_in: schemas.CardCreateRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Requests a new Virtual or Physical card."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    return card_service.request_card(db, customer.id, card_in)

@router.get("/cards/me", response_model=List[schemas.CardResponse])
async def list_my_cards(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns all cards issued to the current user."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first()
    return card_service.get_cards_for_customer(db, customer.id)

@router.patch("/cards/{card_id}/status", response_model=schemas.CardResponse)
async def update_my_card_status(
    card_id: int,
    new_status: models.CardStatusEnum = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Activates, Blocks, or Freezes a card."""
    return card_service.update_card_status(db, card_id, new_status)
