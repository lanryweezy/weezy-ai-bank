import os
import base64
import logging
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

logger = logging.getLogger(__name__)

# In production, this MUST be a strong, persistent environment variable.
# For local dev, we generate one if missing, but it will lose data on restart.
MASTER_KEY = os.getenv("WEEZY_VAULT_MASTER_KEY", "weezy-ai-bank-default-insecure-key-for-dev")

def get_fernet():
    # Derive a 32-byte key from the MASTER_KEY
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'weezy-salt-2026', # Static salt for consistent key derivation
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(MASTER_KEY.encode()))
    return Fernet(key)

def encrypt_value(value: str) -> str:
    if not value:
        return value
    try:
        f = get_fernet()
        return f.encrypt(value.encode()).decode()
    except Exception as e:
        logger.error(f"Encryption failed: {str(e)}")
        return value

def decrypt_value(encrypted_value: str) -> str:
    if not encrypted_value:
        return encrypted_value
    try:
        f = get_fernet()
        return f.decrypt(encrypted_value.encode()).decode()
    except Exception as e:
        logger.error(f"Decryption failed: {str(e)}")
        return "********" # Return masked if decryption fails

def mask_sensitive_data(data: dict) -> dict:
    """Recursively masks keys that look sensitive."""
    masked = {}
    for k, v in data.items():
        if isinstance(v, dict):
            masked[k] = mask_sensitive_data(v)
        elif isinstance(v, str) and any(s in k.lower() for s in ["key", "secret", "password", "token", "auth"]):
            masked[k] = "********"
        else:
            masked[k] = v
    return masked
