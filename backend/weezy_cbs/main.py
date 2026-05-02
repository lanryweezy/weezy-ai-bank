from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from .database import engine, Base, get_db, create_all_tables # Import your DB setup

# Import API routers from various modules
from weezy_cbs.customer_identity_management import api as cim_api
from weezy_cbs.accounts_ledger_management import api as alm_api
from weezy_cbs.loan_management_module import api as loan_api
from weezy_cbs.transaction_management import api as txn_api
from weezy_cbs.cards_wallets_management import api as card_api
from weezy_cbs.payments_integration_layer import api as pay_integ_api
from weezy_cbs.deposit_collection_module import api as dep_coll_api
from weezy_cbs.compliance_regulatory_reporting import api as comp_rep_api
from weezy_cbs.treasury_liquidity_management import api as treasury_api
from weezy_cbs.fees_charges_commission_engine import api as fee_api
from weezy_cbs.core_infrastructure_config_engine import api as core_infra_api
from weezy_cbs.digital_channels_modules import api as digital_chan_api
from weezy_cbs.crm_customer_support import api as crm_api
from weezy_cbs.reports_analytics import api as report_api
from weezy_cbs.third_party_fintech_integration import api as third_party_api
from weezy_cbs.ai_automation_layer import api as ai_api

# Create all database tables if they don't exist
# In a production setup, you'd likely use Alembic for migrations.
# This is suitable for initial development.
# Base.metadata.create_all(bind=engine)
# It's better to call create_all_tables() from database.py as it imports all models.
# To run this manually: `python -m weezy_cbs.database` (if database.py has `if __name__ == "__main__": create_all_tables()`)
# Or, add a startup event.

app = FastAPI(
    title="Weezy Core Banking System (CBS)",
    description="API for the Weezy CBS, providing comprehensive banking functionalities.",
    version="0.1.0",
)

@app.on_event("startup")
async def startup_event():
    # This is a good place to run create_all_tables() if you want it on app start for dev
    # However, for production, Alembic is preferred.
    # For now, we can comment it out and assume tables are created manually via script.
    # print("Creating database tables on startup...")
    # create_all_tables() # This function needs to be defined in database.py and ensure all models are imported there
    # print("Database tables checked/created.")
    pass

# AI & Automation Layer (Unified with bank-ai-orchestrator frontend)
app.include_router(ai_api.ai_api_router, prefix="/api", tags=["AI & Automation"])

from weezy_cbs.interest_engine import api as interest_api
from weezy_cbs.open_banking import api as open_banking_api
from weezy_cbs.eod_processing import api as eod_api
from weezy_cbs.cheque_clearing import api as cheque_api
from weezy_cbs.cognitive_core import api as cognitive_api
from weezy_cbs.teller_operations import api as teller_api
from weezy_cbs.gl_management import api as gl_api
from weezy_cbs.fixed_deposits import api as fd_api

# Core CBS Modules
app.include_router(cim_api.router, prefix="/api/corebanking/cim", tags=["Customer Identity"])
app.include_router(alm_api.router, prefix="/api/corebanking/alm", tags=["Accounts & Ledger"])
app.include_router(gl_api.router, prefix="/api/corebanking/gl", tags=["General Ledger (Chart of Accounts)"])
app.include_router(teller_api.router, prefix="/api/corebanking/teller", tags=["Branch & Teller Operations"])
app.include_router(fd_api.router, prefix="/api/corebanking/investments/fd", tags=["Fixed & Term Deposits"])
app.include_router(loan_api.router, prefix="/api/corebanking/loans", tags=["Loans"])
app.include_router(txn_api.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(comp_rep_api.router, prefix="/api/compliance", tags=["Compliance & Reporting"])
app.include_router(agent_api.router, prefix="/api/agent-banking", tags=["Agent Banking (SANEF)"])
app.include_router(wallet_api.router, prefix="/api/wallets", tags=["Wallets & Mobile Money"])
app.include_router(payroll_api.router, prefix="/api/payroll", tags=["Bulk Payments & Payroll"])
app.include_router(bills_api.router, prefix="/api/bills", tags=["Utility & Bills Payment"])
app.include_router(risk_api.router, prefix="/api/risk", tags=["Customer Risk & AML Profiling"])
app.include_router(merchant_api.router, prefix="/api/merchant", tags=["Merchant Management & POS"])
app.include_router(recovery_api.router, prefix="/api/recovery", tags=["Loan Recovery & Collections"])
app.include_router(savings_api.router, prefix="/api/savings", tags=["Savings & Investments"])
app.include_router(va_api.router, prefix="/api/virtual-accounts", tags=["Virtual Accounts & Collections"])
app.include_router(fx_api.router, prefix="/api/fx", tags=["International FX & Domiciliary"])
app.include_router(wire_api.router, prefix="/api/fx/wire", tags=["International Wire & SWIFT"])
app.include_router(biometric_api.router, prefix="/api/biometric", tags=["Biometric Identity & Face Match"])
app.include_router(fraud_api.router, prefix="/api/fraud", tags=["AI Fraud Shield"])
app.include_router(qr_api.router, prefix="/api/qr", tags=["NQR Payments (NIBSS Standard)"])
app.include_router(dual_api.router, prefix="/api/admin/dual-control", tags=["Dual Authorization (Maker-Checker)"])
app.include_router(treasury_api.router, prefix="/api/corebanking/treasury", tags=["Treasury & Liquidity"])
app.include_router(interest_api.router, prefix="/api/interest", tags=["Automated Interest Engine"])
app.include_router(open_banking_api.router, prefix="/api/open-banking", tags=["Nigerian Open Banking"])
app.include_router(eod_api.router, prefix="/api/corebanking/eod", tags=["EOD Processing & System Integrity"])
app.include_router(cheque_api.router, prefix="/api/cheques", tags=["Cheque Clearing (NACS)"])
app.include_router(cognitive_api.router, prefix="/api/cognitive", tags=["AI-Native Cognitive Core"])

app.include_router(dev_api.router, prefix="/api/dev", tags=["Developer Portal"])
app.include_router(fee_api.router, prefix="/api/corebanking/fees", tags=["Fees & Charges"])

# Auth & Channels
app.include_router(core_infra_api.auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(digital_chan_api.digital_channels_api_router, prefix="/api/digital-channels", tags=["Digital Channels"])
app.include_router(crm_api.crm_api_router, prefix="/api/crm", tags=["CRM"])
app.include_router(report_api.reports_api_router, prefix="/api/reports", tags=["Reports"])
app.include_router(third_party_api.integrations_api_router, prefix="/api/integrations", tags=["Integrations"])


@app.get("/health", tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint. Verifies API is running and can connect to the database.
    """
    try:
        # Try a simple query to check DB connection
        db.execute(text("SELECT 1")).fetchone()
        db_status = "connected"
    except Exception as e:
        # print(f"Database connection error: {e}") # Log this
        db_status = "disconnected"
        # Optionally, raise HTTPException if DB connection is critical for health
        # raise HTTPException(status_code=503, detail=f"Database connection error: {e}")

    return {"status": "ok", "database": db_status, "timestamp": datetime.utcnow().isoformat()}

# To run this application (after installing dependencies):
# uvicorn weezy_cbs.main:app --reload
#
# And to create database tables (if not using Alembic and not running in startup event):
# Ensure your PostgreSQL server is running and the database 'weezy_cbs_db' is created.
# Then run: python -m weezy_cbs.database
# (This assumes your project root is the parent of 'weezy_cbs' directory and it's in PYTHONPATH)
# Or, from within the 'weezy_cbs' directory's parent: python weezy_cbs/database.py
