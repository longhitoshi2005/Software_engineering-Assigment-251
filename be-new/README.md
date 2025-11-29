be-new — minimal Beanie + FastAPI scaffold

Quick start (Windows / PowerShell):

# 1) Start MongoDB
docker compose -f docker-compose.yml up -d

# 2) Create virtualenv & install deps
python -m venv .venv; .\.venv\Scripts\Activate; pip install -r requirements.txt

# 3) Run the app
python -m uvicorn app.main:app --reload --port 8000

Endpoints
- GET / -> health
- POST /auth/login { username, password } -> { access_token }
- GET /users/profile (requires header `Authorization: Bearer mock:<email>`)

Notes
- This is a minimal scaffold for local development and demonstration only.
- Real SSO integration and production hardening are left as followups.
