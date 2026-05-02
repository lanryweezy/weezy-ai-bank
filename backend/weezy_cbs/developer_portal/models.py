from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from weezy_cbs.database import Base

class APIKey(Base):
    __tablename__ = "developer_api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    key_name = Column(String(50), nullable=False)
    api_key_hashed = Column(String(255), unique=True, index=True, nullable=False)
    api_key_hint = Column(String(10), nullable=False) # e.g. "wzy_...abcd"
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
