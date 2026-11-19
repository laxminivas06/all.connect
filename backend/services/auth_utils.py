import hashlib
import hmac
import base64
import json
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Optional PyJWT with built-in standard-library fallback
try:
    import jwt
    HAS_PYJWT = True
except ImportError:
    HAS_PYJWT = False

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, key_hex = hashed_password.split("$")
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return key == expected_key
    except Exception:
        return False

# Standard-library base64url helpers for JWT HS256
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def _builtin_jwt_encode(payload: dict, key: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    h_bytes = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    
    p_copy = {}
    for k, v in payload.items():
        if isinstance(v, datetime):
            p_copy[k] = int(v.timestamp())
        else:
            p_copy[k] = v
    p_bytes = _b64url_encode(json.dumps(p_copy, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{h_bytes}.{p_bytes}".encode('utf-8')
    sig = hmac.new(key.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_bytes = _b64url_encode(sig)
    return f"{h_bytes}.{p_bytes}.{sig_bytes}"

def _builtin_jwt_decode(token: str, key: str) -> Optional[dict]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        h_str, p_str, sig_str = parts
        signing_input = f"{h_str}.{p_str}".encode('utf-8')
        expected_sig = hmac.new(key.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_str)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64url_decode(p_str).decode('utf-8'))
        if 'exp' in payload:
            exp_val = payload['exp']
            if isinstance(exp_val, (int, float)):
                if datetime.now(timezone.utc).timestamp() > exp_val:
                    return None
        return payload
    except Exception:
        return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    if HAS_PYJWT:
        try:
            return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        except Exception:
            pass
    return _builtin_jwt_encode(to_encode, SECRET_KEY)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    if HAS_PYJWT:
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except Exception:
            pass
    return _builtin_jwt_decode(token, SECRET_KEY)

def get_current_user_payload(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
