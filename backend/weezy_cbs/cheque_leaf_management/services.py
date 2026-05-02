import logging
from sqlalchemy.orm import Session
from . import models, schemas

logger = logging.getLogger(__name__)

class ChequeLeafService:
    
    def issue_cheque_book(self, db: Session, req: schemas.ChequeBookIssueRequest) -> models.ChequeBook:
        """
        Generates individual leaves and assigns a book to a customer.
        """
        start_num = int(req.start_leaf_number)
        end_num = start_num + req.leaf_count - 1
        
        book = models.ChequeBook(
            customer_id=req.customer_id,
            account_number=req.account_number,
            start_leaf_number=str(start_num),
            end_leaf_number=str(end_num),
            total_leaves=req.leaf_count
        )
        db.add(book)
        db.flush()
        
        # Generate individual leaves
        for i in range(start_num, end_num + 1):
            leaf = models.ChequeLeaf(
                book_id=book.id,
                leaf_number=str(i),
                status=models.ChequeLeafStatusEnum.UNUSED
            )
            db.add(leaf)
            
        db.commit()
        db.refresh(book)
        return book

    def stop_payment(self, db: Session, customer_id: int, req: schemas.StopPaymentRequest) -> models.StopPaymentOrder:
        """
        Registers a stop payment instruction.
        Updates the leaf status if it exists in the system.
        """
        # 1. Check if leaf exists
        leaf = db.query(models.ChequeLeaf).filter(models.ChequeLeaf.leaf_number == req.cheque_number).first()
        if leaf:
            leaf.status = models.ChequeLeafStatusEnum.STOPPED
            
        # 2. Log Order
        order = models.StopPaymentOrder(
            customer_id=customer_id,
            cheque_number=req.cheque_number,
            account_number=req.account_number,
            reason=req.reason,
            details=req.details
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    def validate_leaf_for_clearing(self, db: Session, account_number: str, cheque_number: str) -> bool:
        """
        Checks if a cheque is valid for processing.
        Must be UNUSED and belong to the specified account.
        """
        leaf = db.query(models.ChequeLeaf).join(models.ChequeBook).filter(
            models.ChequeBook.account_number == account_number,
            models.ChequeLeaf.leaf_number == cheque_number
        ).first()
        
        if not leaf:
            return False # Not in our records
            
        if leaf.status != models.ChequeLeafStatusEnum.UNUSED:
            return False # Stopped, Lost, or Already used
            
        return True

cheque_leaf_service = ChequeLeafService()
