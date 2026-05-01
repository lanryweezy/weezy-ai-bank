import decimal
import random
import string
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class NigerianMarketUtils:
    """
    Utilities specifically for the Nigerian Banking Market.
    Includes NUBAN generation, BVN/NIN validation logic, and local tax (VAT/Stamp Duty).
    """

    @staticmethod
    def calculate_nuban_check_digit(bank_code: str, serial_number: str) -> int:
        """
        CBN NUBAN Algorithm.
        Bank Code (3 digits) + Serial (9 digits)
        Weights: 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3
        """
        if len(bank_code) != 3 or len(serial_number) != 9:
            raise ValueError("Bank code must be 3 digits and serial must be 9 digits")
        
        combined = bank_code + serial_number
        weights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]
        
        total_sum = 0
        for i in range(12):
            total_sum += int(combined[i]) * weights[i]
            
        mod = total_sum % 10
        check_digit = 10 - mod
        return 0 if check_digit == 10 else check_digit

    @classmethod
    def generate_nuban(cls, bank_code: str = "999") -> str:
        """Generates a valid 10-digit NUBAN for a given bank code."""
        serial = ''.join(random.choices(string.digits, k=9))
        check_digit = cls.calculate_nuban_check_digit(bank_code, serial)
        return serial + str(check_digit)

    @staticmethod
    def calculate_stamp_duty(amount: decimal.Decimal) -> decimal.Decimal:
        """
        Nigerian Stamp Duty: N50 on all electronic transfers above N10,000.
        (Based on Finance Act guidelines)
        """
        if amount >= decimal.Decimal("10000"):
            return decimal.Decimal("50.00")
        return decimal.Decimal("0.00")

    @staticmethod
    def calculate_vat(fee_amount: decimal.Decimal) -> decimal.Decimal:
        """
        Nigerian Value Added Tax (VAT): 7.5% on service fees.
        """
        vat_rate = decimal.Decimal("0.075")
        return (fee_amount * vat_rate).quantize(decimal.Decimal("0.01"))

    @staticmethod
    async def verify_bvn(bvn: str) -> Dict[str, Any]:
        """
        Mocked BVN verification against NIBSS.
        In production, this would call the NIBSS BVN API.
        """
        if len(bvn) != 11 or not bvn.isdigit():
            return {"status": "error", "message": "Invalid BVN format"}
        
        # Simulated NIBSS Response
        return {
            "status": "success",
            "data": {
                "first_name": "SULAIMAN",
                "last_name": "ADEBAYO",
                "dob": "1990-01-01",
                "phone": "+2348137502933",
                "verification_id": "NIBSS-BVN-MOCK-12345"
            }
        }

    @staticmethod
    async def verify_nin(nin: str) -> Dict[str, Any]:
        """
        Mocked NIN verification against NIMC.
        In production, this would call the NIMC API.
        """
        if len(nin) != 11 or not nin.isdigit():
            return {"status": "error", "message": "Invalid NIN format"}
            
        return {
            "status": "success",
            "data": {
                "full_name": "Sulaiman Olanrewaju Adebayo",
                "status": "VERIFIED",
                "source": "NIMC"
            }
        }
