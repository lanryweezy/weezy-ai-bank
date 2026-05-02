from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class ChequeLeafStatusEnum(enum.Enum):
    UNUSED = "UNUSED"
    USED = "USED"
    STOPPED = "STOPPED"
    LOST = "LOST"
    CANCELLED = "CANCELLED"

class StopPaymentReasonEnum(enum.Enum):
    LOST = "LOST"
    STOLEN = "STOLEN"
    WRONG_AMOUNT = "WRONG_AMOUNT"
    DISPUTED_TRANSACTION = "DISPUTED_TRANSACTION"
    OTHERS = "OTHERS"

class ChequeBook(Base):
    """
    A collection of cheque leaves issued to a customer.
    """
    __tablename__ = "cheque_books"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    account_number = Column(String(10), nullable=False) # Linked NUBAN
    
    start_leaf_number = Column(String(20), nullable=False)
    end_leaf_number = Column(String(20), nullable=False)
    
    total_leaves = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    
    leaves = relationship("ChequeLeaf", back_populates="book")

class ChequeLeaf(Base):
    """
    Individual tracking for every single cheque leaf.
    """
    __tablename__ = "cheque_leaves"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("cheque_books.id"), nullable=False)
    
    leaf_number = Column(String(20), unique=True, index=True, nullable=False)
    status = Column(SQLAlchemyEnum(ChequeLeafStatusEnum), default=ChequeLeafStatusEnum.UNUSED)
    
    # Metadata if used
    used_amount = Column(Numeric(precision=18, scale=2), nullable=True)
    used_at = Column(DateTime(timezone=True), nullable=True)
    payee_name = Column(String(150), nullable=True)
    
    book = relationship("ChequeBook", back_populates="leaves")

class StopPaymentOrder(Base):
    """
    Legal instruction to the bank not to honor a specific cheque.
    """
    __tablename__ = "stop_payment_orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    cheque_number = Column(String(20), nullable=False)
    account_number = Column(String(10), nullable=False)
    
    reason = Column(SQLAlchemyEnum(StopPaymentReasonEnum), nullable=False)
    details = Column(Text, nullable=True)
    
    # Maker-Checker
    is_approved = Column(Boolean, default=False)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
