
import decimal
import json
import uuid
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from weezy_cbs.database import SessionLocal, Base, engine
from weezy_cbs.customer_identity_management.models import Customer, CBNSupportedAccountTier, CustomerTypeEnum, GenderEnum
from weezy_cbs.accounts_ledger_management.models import Account, AccountStatusEnum, AccountTypeEnum, CurrencyEnum as AccCurrencyEnum
from weezy_cbs.fixed_deposits.models import FixedDepositAccount, FixedDepositProduct, FDStatusEnum
from weezy_cbs.loan_management_module.models import LoanAccount, LoanAccountStatusEnum, LoanApplication, LoanApplicationStatusEnum, CurrencyEnum as LoanCurrencyEnum
from weezy_cbs.transaction_management.models import FinancialTransaction, TransactionStatusEnum, TransactionChannelEnum, TransactionTypeCategoryEnum, CurrencyEnum as TxnCurrencyEnum
from weezy_cbs.core_infrastructure_config_engine.models import ProductConfig, ProductTypeEnum
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils

def seed_demo_banking():
    db = SessionLocal()
    try:
        print("Starting Demo Banking Seeding...")
        
        # 0. Seed Product Config (Required for Account)
        product_code = "SAVINGS_ELITE"
        existing_prod = db.query(ProductConfig).filter(ProductConfig.product_code == product_code).first()
        if not existing_prod:
            prod_config = ProductConfig(
                product_code=product_code,
                product_name="Elite Savings Account",
                product_type=ProductTypeEnum.SAVINGS_ACCOUNT,
                config_parameters_json=json.dumps({"interest_rate": 4.5, "min_balance": 1000}),
                is_active=True
            )
            db.add(prod_config)
            db.flush()
            print(f"Created Product Config: {product_code}")

        # 1. Create the Golden Customer
        customer_email = "ceo@streetheart.tech"
        customer = db.query(Customer).filter(Customer.email == customer_email).first()
        if not customer:
            customer = Customer(
                customer_type=CustomerTypeEnum.INDIVIDUAL,
                first_name="Sulaiman",
                last_name="Adebayo",
                middle_name="Olanrewaju",
                email=customer_email,
                phone_number="+2348137502933",
                bvn="22216142222",
                nin="12345678901",
                gender=GenderEnum.MALE,
                date_of_birth=date(1990, 1, 1),
                is_active=True,
                account_tier=CBNSupportedAccountTier.TIER_3,
                state="Lagos"
            )
            db.add(customer)
            db.flush()
            print(f"Created Customer: {customer.first_name} {customer.last_name}")

        # 2. Create Main Savings Account with Wealthy Balance
        account = db.query(Account).filter(Account.customer_id == customer.id).first()
        if not account:
            nuban = NigerianMarketUtils.generate_nuban()
            account = Account(
                account_number=nuban,
                customer_id=customer.id,
                product_code=product_code,
                account_type=AccountTypeEnum.SAVINGS,
                currency=AccCurrencyEnum.NGN,
                ledger_balance=decimal.Decimal("52450000.00"),
                available_balance=decimal.Decimal("52450000.00"),
                status=AccountStatusEnum.ACTIVE,
                opened_date=date.today()
            )
            db.add(account)
            db.flush()
            print(f"Created Account: {account.account_number} with ₦52.45M")

        # 3. Create Fixed Deposit Product & Account
        fd_prod_code = "WZY-FD-90"
        fd_prod = db.query(FixedDepositProduct).filter(FixedDepositProduct.product_code == fd_prod_code).first()
        if not fd_prod:
            fd_prod = FixedDepositProduct(
                product_code=fd_prod_code,
                name="90-Day High Yield Vault",
                interest_rate_pa=decimal.Decimal("15.50"),
                tenor_days=90,
                minimum_amount=decimal.Decimal("100000.00")
            )
            db.add(fd_prod)
            db.flush()

        fd_acc = db.query(FixedDepositAccount).filter(FixedDepositAccount.customer_id == customer.id).first()
        if not fd_acc:
            fd_acc = FixedDepositAccount(
                fd_account_number=NigerianMarketUtils.generate_nuban(),
                customer_id=customer.id,
                product_id=fd_prod.id,
                principal_amount=decimal.Decimal("10000000.00"),
                interest_rate_applied=fd_prod.interest_rate_pa,
                booking_date=date.today() - timedelta(days=30),
                maturity_date=date.today() + timedelta(days=60),
                accrued_interest=decimal.Decimal("127397.26"), # Approx 30 days interest
                status=FDStatusEnum.ACTIVE,
                linked_savings_account=account.account_number
            )
            db.add(fd_acc)
            print("Booked ₦10M Fixed Deposit.")

        # 4. Create an Active Loan
        loan = db.query(LoanAccount).filter(LoanAccount.customer_id == customer.id).first()
        if not loan:
            # Create a dummy application first
            app = LoanApplication(
                application_reference=f"APP-{NigerianMarketUtils.generate_nuban()}",
                customer_id=customer.id,
                loan_product_id=1, # Assume first product exists or use dummy
                requested_amount=decimal.Decimal("5000000.00"),
                requested_tenor_months=12,
                status=LoanApplicationStatusEnum.APPROVED,
                approved_amount=decimal.Decimal("5000000.00"),
                approved_tenor_months=12
            )
            db.add(app)
            db.flush()

            loan = LoanAccount(
                loan_account_number=f"LN-{NigerianMarketUtils.generate_nuban()}",
                application_id=app.id,
                customer_id=customer.id,
                principal_disbursed=decimal.Decimal("5000000.00"),
                principal_outstanding=decimal.Decimal("4200000.00"),
                interest_rate_pa=decimal.Decimal("22.00"),
                currency=LoanCurrencyEnum.NGN,
                tenor_months=12,
                disbursement_date=date.today() - timedelta(days=60),
                first_repayment_date=date.today() - timedelta(days=30),
                maturity_date=date.today() + timedelta(days=300),
                status=LoanAccountStatusEnum.ACTIVE,
                disbursement_account_number=account.account_number
            )
            db.add(loan)
            print("Disbursed ₦5M SME Growth Loan.")

        # 5. Seed Transactions (History)
        if db.query(FinancialTransaction).count() < 3:
            transactions = [
                FinancialTransaction(
                    id=str(uuid.uuid4()),
                    transaction_type=TransactionTypeCategoryEnum.FUNDS_TRANSFER,
                    channel=TransactionChannelEnum.MOBILE_APP,
                    status=TransactionStatusEnum.SUCCESSFUL,
                    amount=decimal.Decimal("250000.00"),
                    currency=TxnCurrencyEnum.NGN,
                    credit_account_number=account.account_number,
                    credit_account_name=f"{customer.last_name} {customer.first_name}",
                    narration="NIP/WEB/FROM ZENITH/ADEBAYO SUL",
                    initiated_at=datetime.now() - timedelta(days=1)
                ),
                FinancialTransaction(
                    id=str(uuid.uuid4()),
                    transaction_type=TransactionTypeCategoryEnum.BILL_PAYMENT,
                    channel=TransactionChannelEnum.MOBILE_APP,
                    status=TransactionStatusEnum.SUCCESSFUL,
                    amount=decimal.Decimal("12500.00"),
                    currency=TxnCurrencyEnum.NGN,
                    debit_account_number=account.account_number,
                    narration="BILL: DSTV PREMIUM RENEWAL",
                    initiated_at=datetime.now() - timedelta(hours=5)
                ),
                FinancialTransaction(
                    id=str(uuid.uuid4()),
                    transaction_type=TransactionTypeCategoryEnum.TAX_DUTY,
                    channel=TransactionChannelEnum.INTERNAL,
                    status=TransactionStatusEnum.SUCCESSFUL,
                    amount=decimal.Decimal("50.00"),
                    currency=TxnCurrencyEnum.NGN,
                    debit_account_number=account.account_number,
                    narration="STAMP DUTY CHARGE @ N50",
                    initiated_at=datetime.now() - timedelta(hours=5)
                )
            ]
            db.bulk_save_objects(transactions)
            print("Seeded transaction history.")

        db.commit()
        print("Demo Banking Seeded Successfully. Application is ready for Bank Presentation.")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_banking()
