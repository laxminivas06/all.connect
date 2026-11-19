import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_DIR = BASE_DIR / "database"
UPLOADS_DIR = BASE_DIR / "uploads"

SECRET_KEY = os.getenv("SECRET_KEY", "allconnect_secret_key_super_secure_2026_prototype")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Ensure upload directories exist
for sub in ["prescriptions", "reports", "organization_logos", "advertisements"]:
    (UPLOADS_DIR / sub).mkdir(parents=True, exist_ok=True)
