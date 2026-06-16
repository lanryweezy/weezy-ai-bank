
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from weezy_cbs.database import Base

class IntegrationProvider(Base):
    __tablename__ = "integration_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # e.g. Paystack, Mono
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), nullable=True) # Lucide icon key
    is_active = Column(Boolean, default=False)
    
    services = relationship("IntegrationService", back_populates="provider", cascade="all, delete-orphan")

class IntegrationService(Base):
    __tablename__ = "integration_services"
    
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("integration_providers.id"), nullable=False)
    service_key = Column(String(100), nullable=False) # e.g. IDENTITY, VIRTUAL_ACCOUNTS
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=False)
    config_schema = Column(JSON, nullable=True) # JSON Schema for required config
    config_values = Column(JSON, nullable=True) # Encrypted or sensitive values should be handled carefully
    
    provider = relationship("IntegrationProvider", back_populates="services")
