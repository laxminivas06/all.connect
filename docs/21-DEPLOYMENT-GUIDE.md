# 21: Local Execution & Production Deployment Guide

## 1. Local Development Setup

### Backend (Python FastAPI)
```bash
# 1. From root directory
python backend/run.py
# Server listens on http://127.0.0.1:8000
# Automatic swagger docs on http://127.0.0.1:8000/docs
```
Or double-click `start_backend.bat`.

### Frontend (Vite + React)
```bash
# 2. In a separate terminal
cd frontend
npm run dev
# Application listens on http://localhost:5173
```
Or double-click `start_frontend.bat`.

---

## 2. Production Deployment Blueprint
- **Containerization**:
  - `backend/Dockerfile`: Multi-stage Python 3.11-slim container running `gunicorn -k uvicorn.workers.UvicornWorker -w 4 main:app`.
  - `frontend/Dockerfile`: Multi-stage Node.js build container outputting static assets served via Nginx with Brotli/Gzip compression.
- **Reverse Proxy**: Nginx routing `/api` and `/uploads` to the FastAPI upstream and all other requests to the React SPA index.
- **Database Transition**: Point `backend/config.py` to PostgreSQL connection string; transition `backend/database/db.py` to SQLAlchemy session pools.
- **Environment Variables**: Configure `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, and CORS allowed origins.
