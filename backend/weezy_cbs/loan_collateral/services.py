import os
import logging
import json
import google.generativeai as genai
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, date

from . import models, schemas

logger = logging.getLogger(__name__)

class CollateralManagementService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    def pledge_collateral(self, db: Session, req: schemas.CollateralCreate) -> models.Collateral:
        collateral = models.Collateral(
            customer_id=req.customer_id,
            application_id=req.application_id,
            collateral_type=req.collateral_type,
            description=req.description,
            estimated_market_value=req.estimated_market_value,
            forced_sale_value=req.estimated_market_value * Decimal("0.75"), # Default 75% for MFB standard
            document_reference=req.document_reference,
            physical_custody_location=req.physical_custody_location,
            status=models.CollateralStatusEnum.PENDING_VALUATION
        )
        db.add(collateral)
        db.commit()
        db.refresh(collateral)
        return collateral

    async def analyze_collateral_ai(self, db: Session, collateral_id: int):
        """
        Uses Gemini to analyze the asset description and provide a risk/authenticity opinion.
        """
        collateral = db.query(models.Collateral).filter(models.Collateral.id == collateral_id).first()
        if not collateral or not self.model: return

        prompt = f"""
        You are 'Weezy Asset Surveyor'. Analyze this collateral for a Nigerian loan:
        TYPE: {collateral.collateral_type.value}
        DESCRIPTION: {collateral.description}
        VALUE: ₦{float(collateral.estimated_market_value):,.2f}
        
        Tasks:
        1. Identify potential risk factors (e.g. depreciation for vehicles, land title issues).
        2. Verify if the description matches the declared market value based on current Nigerian market trends (Lagos/Abuja context).
        3. Provide an 'Asset Liquidity Score' (0-100).
        
        Return a concise JSON summary.
        """

        try:
            response = await self.model.generate_content_async(prompt)
            # Try to extract JSON if model returned it in text
            text = response.text
            # (Simplified storage for demo)
            collateral.ai_asset_analysis = {"raw_opinion": text}
            collateral.status = models.CollateralStatusEnum.ACTIVE_PLEDGED
            db.commit()
            return text
        except Exception as e:
            logger.error(f"AI Collateral Analysis Error: {str(e)}")
            return None

    def update_valuation(self, db: Session, collateral_id: int, user_id: int, req: schemas.ValuationUpdateRequest):
        collateral = db.query(models.Collateral).filter(models.Collateral.id == collateral_id).first()
        if not collateral: raise Exception("Collateral not found")
        
        # 1. Log History
        history = models.CollateralValuationHistory(
            collateral_id=collateral_id,
            valued_amount=req.valued_amount,
            valued_by_id=user_id,
            comments=req.comments
        )
        db.add(history)
        
        # 2. Update Current
        collateral.estimated_market_value = req.valued_amount
        collateral.forced_sale_value = req.valued_amount * Decimal("0.75")
        collateral.valuation_date = date.today()
        
        db.commit()
        return collateral

collateral_service = CollateralManagementService()
