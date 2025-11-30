# Frontend-Backend Integration Guide

This guide explains how to connect and run the frontend and backend together.

## Configuration Summary

### Backend (FastAPI)
- **Base URL**: `http://localhost:8000`
- **CORS**: Configured to accept requests from `http://localhost:5173`
- **Login Endpoint**: `POST /auth/login`

### Frontend (Next.js)
- **Base URL**: `http://localhost:5173`
- **API Client**: `src/lib/api.ts` configured to connect to `http://localhost:8000`
- **Login Page**: `app/auth/login/page.tsx` - now calls backend API

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd be
pip install -r requirements.txt
```

#### Start MongoDB
Make sure MongoDB is running on your system. You can use Docker:
```bash
docker-compose up -d
```

Or start MongoDB locally on the default port (27017).

#### Seed Test Accounts
Run the seeding script to create test accounts in the database:
```bash
cd be
python seed_db.py
```

This will create the following test accounts:
- `student@hcmut.edu.vn` / `student`
- `tutor@hcmut.edu.vn` / `tutor`
- `coord@hcmut.edu.vn` / `coord`
- `dept@hcmut.edu.vn` / `dept`
- `sa@hcmut.edu.vn` / `sa`
- `admin@hcmut.edu.vn` / `admin`

#### Start Backend Server
```bash
cd be
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

#### Install Dependencies
```bash
cd fe
npm install
```

#### Start Frontend Development Server
```bash
cd fe
npm run dev -- --port 5173
```

The frontend will be available at `http://localhost:5173`

## Testing the Login

1. Navigate to `http://localhost:5173/auth/login`
2. Use any of the test accounts:
   - Email: `student@hcmut.edu.vn`
   - Password: `student`
3. Click "Sign In"
4. If successful, you'll be redirected to the appropriate dashboard based on your role

## Authentication Flow

1. **Frontend** sends login request to backend `/auth/login`
2. **Backend** validates credentials against SSO database
3. **Backend** creates or updates user account and profiles
4. **Backend** sets an `access_token` cookie (HttpOnly)
5. **Backend** returns success message
6. **Frontend** stores user email and role in localStorage
7. **Frontend** redirects to role-specific dashboard

## Files Modified/Created

### Backend
- `be/app/main.py` - Added CORS middleware
- `be/seed_db.py` - New database seeding script

### Frontend
- `fe/src/lib/api.ts` - New API client utility
- `fe/src/types/auth.ts` - New authentication types
- `fe/app/auth/login/page.tsx` - Updated to call backend API

## Troubleshooting

### CORS Errors
If you see CORS errors, verify:
- Backend is running on `http://localhost:8000`
- Frontend is running on `http://localhost:5173`
- CORS middleware is properly configured in `be/app/main.py`

### Login Fails
If login fails:
- Check that MongoDB is running
- Verify test accounts were seeded with `python seed_db.py`
- Check backend logs for error messages
- Verify the backend endpoint at `http://localhost:8000/docs`

### Connection Refused
If you see "connection refused":
- Ensure backend server is running on port 8000
- Ensure frontend server is running on port 5173
- Check firewall settings

## Next Steps

- Add role-based data fetching from backend
- Implement proper logout functionality
- Add protected route middleware
- Implement user profile API endpoints
- Add session management
