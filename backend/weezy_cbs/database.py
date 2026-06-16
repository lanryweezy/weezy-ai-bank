from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./weezy_cbs.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_all_tables():
    print("Importing models for table creation...")
    from weezy_cbs.customer_identity_management import models as cust_id_models
    from weezy_cbs.accounts_ledger_management import models as acc_models
    from weezy_cbs.loan_management_module import models as loan_models
    from weezy_cbs.transaction_management import models as txn_models
    from weezy_cbs.cards_wallets_management import models as card_models
    from weezy_cbs.payments_integration_layer import models as pay_integ_models
    from weezy_cbs.deposit_collection_module import models as dep_coll_models
    from weezy_cbs.compliance_regulatory_reporting import models as comp_rep_models
    from weezy_cbs.treasury_liquidity_management import models as treasury_models
    from weezy_cbs.fees_charges_commission_engine import models as fee_models
    from weezy_cbs.core_infrastructure_config_engine import models as core_infra_models
    from weezy_cbs.digital_channels_modules import models as digital_chan_models
    from weezy_cbs.crm_customer_support import models as crm_models
    from weezy_cbs.reports_analytics import models as report_models
    from weezy_cbs.third_party_fintech_integration import models as third_party_models
    from weezy_cbs.ai_automation_layer import models as ai_models
    from weezy_cbs.fixed_deposits import models as fd_models
    from weezy_cbs.teller_operations import models as teller_models
    from weezy_cbs.bills_payment import models as bills_models
    from weezy_cbs.messaging_notifications import models as msg_models
    from weezy_cbs.customer_risk_profiling import models as risk_models
    
    print(f"Tables in metadata: {Base.metadata.tables.keys()}")
    print("Creating all tables in the database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

if __name__ == "__main__":
    create_all_tables()
