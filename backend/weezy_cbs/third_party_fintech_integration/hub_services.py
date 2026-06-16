
import importlib
import logging
import json
from sqlalchemy.orm import Session
from .hub_models import IntegrationProvider, IntegrationService
from .security import encrypt_value, decrypt_value, mask_sensitive_data

logger = logging.getLogger(__name__)

class IntegrationHubService:
    def seed_initial_providers(self, db: Session):
        providers = [
            {
                "name": "paystack",
                "display_name": "Paystack",
                "description": "The gold standard for developer-friendly payment gateways in Nigeria.",
                "icon_name": "CreditCard",
                "services": [
                    {"key": "CHECKOUT", "name": "Modern Checkout", "desc": "Web/mobile payment forms for collections.", "schema": {"secret_key": "string", "public_key": "string"}},
                    {"key": "VIRTUAL_ACCOUNTS", "name": "Dedicated Virtual Accounts", "desc": "Generating static NUBANs for automated reconciliation.", "schema": {"secret_key": "string"}},
                    {"key": "TRANSFERS", "name": "Transfers & Payouts", "desc": "Bulk and single payouts to any bank account.", "schema": {"secret_key": "string"}},
                    {"key": "IDENTITY", "name": "Identity Verification", "desc": "KYC, BVN and Account Name lookups.", "schema": {"secret_key": "string"}},
                    {"key": "SUBSCRIPTIONS", "name": "Recurring Payments", "desc": "Automatic debiting for subscriptions.", "schema": {"secret_key": "string"}}
                ]
            },
            {
                "name": "interswitch",
                "display_name": "Interswitch",
                "description": "Africa's leading integrated payment and transaction processing company.",
                "icon_name": "Layers",
                "services": [
                    {"key": "SWITCHING", "name": "Transaction Switching", "desc": "Routing ATM and POS transactions locally.", "schema": {"client_id": "string", "client_secret": "string"}},
                    {"key": "BILLS_PAYMENT", "name": "Quickteller Paypoint", "desc": "Utility bills, airtime and cable TV APIs.", "schema": {"terminal_id": "string", "auth_token": "string"}},
                    {"key": "CARD_ISSUANCE", "name": "Verve Card Issuance", "desc": "Issuing and managing Verve physical/virtual cards.", "schema": {"auth_token": "string"}},
                    {"key": "WALLETS", "name": "Wallet-as-a-Service", "desc": "Scalable wallet infrastructure for fintechs.", "schema": {"auth_token": "string"}}
                ]
            },
            {
                "name": "mono",
                "display_name": "Mono",
                "description": "The open banking infrastructure for Africa. Connect and verify user accounts.",
                "icon_name": "Link",
                "services": [
                    {"key": "CONNECT", "name": "Mono Connect", "desc": "Securely access bank statements and real-time data.", "schema": {"mono_secret_key": "string"}},
                    {"key": "DIRECT_PAY", "name": "Mono DirectPay", "desc": "Accept payments via direct bank transfer.", "schema": {"mono_secret_key": "string"}},
                    {"key": "STATEMENT_PAGES", "name": "Statement Pages", "desc": "No-code way to collect bank statements.", "schema": {"mono_secret_key": "string"}},
                    {"key": "LOOKUP", "name": "Mono Lookup", "desc": "Verify identities and account information.", "schema": {"mono_secret_key": "string"}}
                ]
            },
            {
                "name": "fincra",
                "display_name": "Fincra",
                "description": "Global payment infrastructure for platforms and businesses.",
                "icon_name": "Globe",
                "services": [
                    {"key": "COLLECTIONS", "name": "Virtual Accounts (NGN/USD/EUR)", "desc": "Receive payments globally in multiple currencies.", "schema": {"api_key": "string", "secret_key": "string"}},
                    {"key": "PAYOUTS", "name": "Global Payouts", "desc": "Send money to 50+ countries via API.", "schema": {"api_key": "string"}},
                    {"key": "CHECKOUT", "name": "White-label Checkout", "desc": "Customizable payment gateway for your brand.", "schema": {"api_key": "string"}}
                ]
            }
        ]
        
        for p_data in providers:
            provider = db.query(IntegrationProvider).filter(IntegrationProvider.name == p_data["name"]).first()
            if not provider:
                provider = IntegrationProvider(
                    name=p_data["name"],
                    display_name=p_data["display_name"],
                    description=p_data["description"],
                    icon_name=p_data["icon_name"]
                )
                db.add(provider)
                db.flush()
                
                for s_data in p_data["services"]:
                    service = IntegrationService(
                        provider_id=provider.id,
                        service_key=s_data["key"],
                        display_name=s_data["name"],
                        description=s_data["desc"],
                        config_schema=s_data.get("schema")
                    )
                    db.add(service)
        
        db.commit()

    def get_all_providers(self, db: Session):
        providers = db.query(IntegrationProvider).all()
        # Ensure we mask sensitive data before returning to frontend
        for p in providers:
            for s in p.services:
                if s.config_values:
                    s.config_values = mask_sensitive_data(s.config_values)
        return providers

    def toggle_provider(self, db: Session, provider_id: int, status: bool):
        provider = db.query(IntegrationProvider).get(provider_id)
        if provider:
            provider.is_active = status
            db.commit()
            return provider
        return None

    def toggle_service(self, db: Session, service_id: int, status: bool):
        service = db.query(IntegrationService).get(service_id)
        if service:
            service.is_enabled = status
            db.commit()
            return service
        return None

    def update_service_config(self, db: Session, service_id: int, config: dict):
        service = db.query(IntegrationService).get(service_id)
        if not service:
            return None
        
        # Encrypt sensitive fields
        encrypted_config = {}
        for k, v in config.items():
            if any(s in k.lower() for s in ["key", "secret", "password", "token", "auth"]):
                encrypted_config[k] = encrypt_value(v)
            else:
                encrypted_config[k] = v
        
        service.config_values = encrypted_config
        db.commit()
        return service

integration_hub_service = IntegrationHubService()

