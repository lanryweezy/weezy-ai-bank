import decimal
import random
import string
import uuid
import json
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
from weezy_cbs.accounts_ledger_management.services import post_double_entry_transaction

logger = logging.getLogger(__name__)

class MerchantManagementService:
    
    def create_merchant(self, db: Session, merchant_in: schemas.MerchantProfileCreate) -> models.MerchantProfile:
        mer_id = f"WZY-MER-{random.randint(10000, 99999)}"
        
        db_merchant = models.MerchantProfile(
            **merchant_in.dict(),
            merchant_id=mer_id,
            status=models.MerchantStatusEnum.ACTIVE
        )
        db.add(db_merchant)
        db.commit()
        db.refresh(db_merchant)
        return db_merchant

    def register_terminal(self, db: Session, merchant_id: int, serial: str) -> models.POSTerminal:
        tid = "".join(random.choices(string.digits, k=8)) # 8-digit TID
        db_terminal = models.POSTerminal(
            merchant_id=merchant_id,
            terminal_id=tid,
            serial_number=serial,
            model="PAX S90 (WEEZY Edition)",
            is_active=True
        )
        db.add(db_terminal)
        db.commit()
        db.refresh(db_terminal)
        return db_terminal

    async def authorize_pos_transaction(self, db: Session, request: schemas.POSTransactionRequest) -> dict:
        """
        Simulates card switch authorization (Interswitch/UPSL).
        Deducts funds from Cardholder -> Credits Bank's Merchant Collection GL.
        """
        terminal = db.query(models.POSTerminal).filter(models.POSTerminal.terminal_id == request.terminal_id).first()
        if not terminal or not terminal.is_active:
            raise Exception("Invalid or Inactive Terminal")

        merchant = terminal.merchant
        
        # 1. Initiate the master transaction
        # Debit: Customer Account (found via masked PAN for demo)
        # Credit: Bank Merchant Collection GL (Settlement pool)
        try:
            # (In a real app, we'd lookup the actual account linked to this card PAN)
            # For demo, we use a generic customer account
            txn_req = TransactionCreateRequest(
                transaction_type="MERCHANT_PAYMENT",
                channel="POS",
                amount=request.amount,
                currency="NGN",
                debit_account_number="9990011223", # Demo Cardholder
                credit_account_number="GL-MERCHANT-POOL-001", # Settlement GL
                narration=request.narration or f"POS PURCHASE - {merchant.business_name} - {terminal.terminal_id}"
            )
            
            from weezy_cbs.transaction_management.services import initiate_transaction
            txn = await initiate_transaction(db, txn_req)
            
            terminal.last_interaction_at = datetime.utcnow()
            db.commit()
            
            return {
                "status": "APPROVED",
                "response_code": "00",
                "transaction_id": txn.id,
                "merchant_name": merchant.business_name,
                "terminal_id": terminal.terminal_id,
                "auth_id": uuid.uuid4().hex[:6].upper()
            }

        except Exception as e:
            logger.error(f"POS Auth Error: {str(e)}")
            return {"status": "DECLINED", "response_code": "05", "message": str(e)}

    async def run_daily_settlement(self, db: Session):
        """
        Nigerian T+1 Settlement Engine.
        Aggregates POS transactions from yesterday and pays out to merchants.
        """
        yesterday = datetime.utcnow().date() - timedelta(days=1)
        
        # Find all merchants with profiles
        merchants = db.query(models.MerchantProfile).filter(models.MerchantProfile.status == models.MerchantStatusEnum.ACTIVE).all()
        
        for merchant in merchants:
            # Find all successful POS transactions for this merchant's terminals yesterday
            # (This is simplified - in reality, we'd query FinancialTransaction with POS channel and merchant metadata)
            from weezy_cbs.transaction_management.models import FinancialTransaction, TransactionStatusEnum, TransactionChannelEnum
            
            txns = db.query(FinancialTransaction).filter(
                FinancialTransaction.channel == TransactionChannelEnum.POS,
                FinancialTransaction.status == TransactionStatusEnum.SUCCESSFUL,
                FinancialTransaction.credit_account_number == "GL-MERCHANT-POOL-001",
                # Ideally filter by merchant ID in a JSON field or related table
                FinancialTransaction.narration.like(f"%{merchant.business_name}%")
            ).all()

            if not txns:
                continue
                
            total_vol = sum(t.amount for t in txns)
            # Calculate Merchant Service Commission (MSC) - standard 0.5% cap at N1000 or custom
            msc_rate = decimal.Decimal("0.005") # 0.5%
            total_fees = (total_vol * msc_rate).quantize(decimal.Decimal("0.01"))
            net_amt = total_vol - total_fees
            
            # Create Settlement Entry
            settlement = models.POSSettlement(
                merchant_id=merchant.id,
                total_volume=total_vol,
                total_fees=total_fees,
                net_amount=net_amt,
                transaction_ids_json=[t.id for t in txns],
                settlement_reference=f"SET-{uuid.uuid4().hex[:10].upper()}",
                status="PROCESSING"
            )
            db.add(settlement)
            db.flush()
            
            # Execute Settlement Payout (Credit Merchant Account)
            try:
                # Credit: Merchant's NUBAN, Debit: Bank Merchant Collection GL
                await post_double_entry_transaction(
                    db,
                    debit_account_number="GL-MERCHANT-POOL-001",
                    credit_account_number=merchant.settlement_account_number,
                    amount=net_amt,
                    currency="NGN",
                    narration=f"POS Settlement {yesterday} - {settlement.settlement_reference}",
                    financial_transaction_id=f"PAYOUT-{settlement.settlement_reference}"
                )
                settlement.status = "PROCESSED"
            except Exception as e:
                logger.error(f"Settlement Failed for {merchant.business_name}: {str(e)}")
                settlement.status = "FAILED"
            
            db.commit()

merchant_service = MerchantManagementService()
