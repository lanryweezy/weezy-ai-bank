import uuid
import logging
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta

from . import models, schemas
from weezy_cbs.transaction_management.services import post_double_entry_transaction

logger = logging.getLogger(__name__)

class FixedAssetsService:
    
    def register_asset(self, db: Session, req: schemas.FixedAssetCreate) -> models.FixedAsset:
        """
        Registers a new asset and posts the initial acquisition to the ledger.
        """
        category = db.query(models.AssetCategory).filter(models.AssetCategory.id == req.category_id).first()
        if not category:
            raise Exception("Invalid asset category.")
            
        tag = f"WZY/ASSET/{uuid.uuid4().hex[:6].upper()}/{req.purchase_date.year}"
        
        asset = models.FixedAsset(
            asset_tag=tag,
            name=req.name,
            category_id=req.category_id,
            purchase_price=req.purchase_price,
            purchase_date=req.purchase_date,
            current_book_value=req.purchase_price,
            location=req.location,
            serial_number=req.serial_number
        )
        db.add(asset)
        
        # GL Posting: Debit Asset GL, Credit Bank Cash/Payables GL
        # For simplicity, we credit a general Bank Cash GL
        post_double_entry_transaction(
            db=db,
            debit_account_number=category.asset_gl_code,
            credit_account_number="GL-BANK-CASH-001",
            amount=req.purchase_price,
            currency="NGN",
            narration=f"ASSET ACQUISITION: {req.name} ({tag})",
            channel="SYSTEM"
        )
        
        db.commit()
        db.refresh(asset)
        return asset

    def run_monthly_depreciation(self, db: Session):
        """
        Calculates and posts monthly depreciation for all active assets.
        Called by EOD Orchestrator on month-end or manually by Admin.
        """
        active_assets = db.query(models.FixedAsset).filter(models.FixedAsset.status == models.AssetStatusEnum.ACTIVE).all()
        
        total_posted = Decimal("0.00")
        processed_count = 0
        
        for asset in active_assets:
            category = asset.category
            
            # Straight Line: (Annual % / 12) * Purchase Price
            monthly_rate = (category.annual_depreciation_pct / Decimal("100")) / Decimal("12")
            monthly_amount = asset.purchase_price * monthly_rate
            
            # Don't depreciate below ₦1.00 (Salvage value)
            if asset.current_book_value - monthly_amount < Decimal("1.00"):
                monthly_amount = asset.current_book_value - Decimal("1.00")
                asset.status = models.AssetStatusEnum.FULLY_DEPRECIATED
            
            if monthly_amount <= 0:
                continue

            # 1. Update Asset
            asset.current_book_value -= monthly_amount
            asset.accumulated_depreciation += monthly_amount
            asset.last_depreciation_date = date.today()
            
            # 2. Post GL Entry
            # Debit: Depreciation Expense (P&L)
            # Credit: Accumulated Depreciation (Contra-Asset)
            post_double_entry_transaction(
                db=db,
                debit_account_number=category.depreciation_expense_gl_code,
                credit_account_number=category.accumulated_depr_gl_code,
                amount=monthly_amount,
                currency="NGN",
                narration=f"MONTHLY DEPR: {asset.asset_tag} - {asset.name}",
                channel="SYSTEM"
            )
            
            # 3. Log
            log = models.AssetDepreciationLog(
                asset_id=asset.id,
                depreciation_amount=monthly_amount,
                period_start=date.today().replace(day=1),
                period_end=date.today()
            )
            db.add(log)
            
            total_posted += monthly_amount
            processed_count += 1
            
        db.commit()
        return {"assets_processed": processed_count, "total_depreciation_posted": total_posted}

    def seed_categories(self, db: Session):
        """Initial setup of asset categories for a typical bank."""
        cats = [
            {"name": "IT Equipment", "rate": 33.33, "asset": "GL-ASSET-IT", "exp": "GL-EXP-DEPR-IT", "acc": "GL-ACC-DEPR-IT"},
            {"name": "Office Furniture", "rate": 20.00, "asset": "GL-ASSET-FUR", "exp": "GL-EXP-DEPR-FUR", "acc": "GL-ACC-DEPR-FUR"},
            {"name": "Motor Vehicles", "rate": 25.00, "asset": "GL-ASSET-VEH", "exp": "GL-EXP-DEPR-VEH", "acc": "GL-ACC-DEPR-VEH"},
            {"name": "Land & Buildings", "rate": 5.00, "asset": "GL-ASSET-BLD", "exp": "GL-EXP-DEPR-BLD", "acc": "GL-ACC-DEPR-BLD"},
        ]
        
        for c in cats:
            existing = db.query(models.AssetCategory).filter(models.AssetCategory.category_name == c["name"]).first()
            if not existing:
                new_cat = models.AssetCategory(
                    category_name=c["name"],
                    annual_depreciation_pct=Decimal(str(c["rate"])),
                    asset_gl_code=c["asset"],
                    depreciation_expense_gl_code=c["exp"],
                    accumulated_depr_gl_code=c["acc"]
                )
                db.add(new_cat)
        db.commit()

assets_service = FixedAssetsService()
