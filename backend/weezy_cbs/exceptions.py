from fastapi import HTTPException, status

class WeezyBankingException(Exception):
    def __init__(self, message: str, status_code: int = 400, error_code: str = "BANKING_ERROR"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)

class NotFoundException(WeezyBankingException):
    def __init__(self, message="Resource not found"):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND, error_code="NOT_FOUND")

class InvalidOperationException(WeezyBankingException):
    def __init__(self, message="Invalid operation"):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST, error_code="INVALID_OPERATION")

class InsufficientFundsException(InvalidOperationException):
    def __init__(self, message="Insufficient funds"):
        super().__init__(message)
        self.error_code = "INSUFFICIENT_FUNDS"

class ConcurrencyLockException(WeezyBankingException):
    def __init__(self, message="System busy, please try again"):
        super().__init__(message, status_code=status.HTTP_409_CONFLICT, error_code="CONCURRENCY_ERROR")

class ComplianceViolationException(WeezyBankingException):
    def __init__(self, message="Action blocked by compliance policy"):
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN, error_code="COMPLIANCE_BLOCK")
