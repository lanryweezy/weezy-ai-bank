import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
from weezy_cbs.accounts_ledger_management.models import GeneralLedgerAccount, GLLedgerEntry, GLTypeEnum, CurrencyEnum
from . import schemas

logger = logging.getLogger(__name__)

class GLManagementService:
    
    def create_gl_account(self, db: Session, acc_in: schemas.GLAccountCreate) -> GeneralLedgerAccount:
        existing = db.query(GeneralLedgerAccount).filter(GeneralLedgerAccount.gl_code == acc_in.gl_code).first()
        if existing:
            raise Exception(f"GL Account with code {acc_in.gl_code} already exists.")
            
        gl_type_enum = GLTypeEnum(acc_in.gl_type)
        currency_enum = CurrencyEnum(acc_in.currency)
        
        gl = GeneralLedgerAccount(
            gl_code=acc_in.gl_code,
            name=acc_in.name,
            currency=currency_enum,
            gl_type=gl_type_enum,
            parent_gl_code=acc_in.parent_gl_code,
            is_control_account=acc_in.is_control_account,
        )
        db.add(gl)
        db.commit()
        db.refresh(gl)
        return gl
        
    def get_chart_of_accounts(self, db: Session) -> schemas.ChartOfAccountsResponse:
        all_gls = db.query(GeneralLedgerAccount).all()
        
        assets = [gl for gl in all_gls if gl.gl_type == GLTypeEnum.ASSET]
        liabilities = [gl for gl in all_gls if gl.gl_type == GLTypeEnum.LIABILITY]
        equity = [gl for gl in all_gls if gl.gl_type == GLTypeEnum.EQUITY]
        income = [gl for gl in all_gls if gl.gl_type == GLTypeEnum.INCOME]
        expenses = [gl for gl in all_gls if gl.gl_type == GLTypeEnum.EXPENSE]
        
        total_assets = sum(gl.current_balance for gl in assets)
        total_liabilities = sum(gl.current_balance for gl in liabilities)
        
        return schemas.ChartOfAccountsResponse(
            assets=assets,
            liabilities=liabilities,
            equity=equity,
            income=income,
            expenses=expenses,
            total_assets=total_assets,
            total_liabilities=total_liabilities
        )

    def get_gl_history(self, db: Session, gl_code: str):
        gl = db.query(GeneralLedgerAccount).filter(GeneralLedgerAccount.gl_code == gl_code).first()
        if not gl:
            raise Exception("GL Account not found")
        return db.query(GLLedgerEntry).filter(GLLedgerEntry.gl_account_id == gl.id).order_by(GLLedgerEntry.transaction_date.desc()).limit(100).all()

gl_service = GLManagementService()

gl_service = GLManagementService()
