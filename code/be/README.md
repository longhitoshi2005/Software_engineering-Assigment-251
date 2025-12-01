# Tutor Support System - Backend

FastAPI + MongoDB backend for the HCMUT Tutor Support System.

## 🚀 Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: MongoDB with Beanie ODM
- **Authentication**: Cookie-based sessions (mock SSO for development)
- **File Storage**: Cloudinary for avatars/images
- **Language**: Python 3.10+

## 📋 Prerequisites

- Docker & Docker Compose
- Git

## 🛠️ Installation & Setup

### 1. Environment Configuration

Create `.env` file in the `be` directory:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=tutor_support_db
SECRET_KEY=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Start All Services with Docker

```powershell
docker-compose up --build
```

This will:

- Start MongoDB on `localhost:27017`
- Build and run the FastAPI application on `localhost:8000`
- Automatically install all Python dependencies
- Set up the database connection
- Seed database with test data (24 users, courses, sessions)

API will be available at `http://localhost:8000`

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔑 Authentication

The system uses cookie-based authentication:

```bash
POST /auth/login
{
  "username": "student_gioi@hcmut.edu.vn",
  "password": "123"
}
```

### Test Accounts

| Email | Password | Roles |
|-------|----------|-------|
| head.cse@hcmut.edu.vn | 123 | DEPT_CHAIR, TUTOR |
| tuan.pham@hcmut.edu.vn | 123 | TUTOR |
| student_gioi@hcmut.edu.vn | 123 | STUDENT, TUTOR |
| lan.tran@hcmut.edu.vn | 123 | STUDENT |
| an.nguyen@hcmut.edu.vn | 123 | STUDENT |

*(24 total accounts - see seed_users.py for complete list)*

## 📁 Project Structure

```
be/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── core/                # Config, security, dependencies
│   ├── db/                  # Database connection
│   ├── models/              # Data models
│   │   ├── internal/        # MongoDB documents
│   │   ├── schemas/         # API request/response schemas
│   │   └── enums/           # Enumerations
│   ├── routes/              # API endpoints
│   │   ├── auth.py          # Authentication
│   │   ├── sessions.py      # Session booking & management
│   │   ├── tutors.py        # Tutor profiles
│   │   ├── students.py      # Student profiles
│   │   ├── availability.py  # Tutor availability
│   │   ├── feedback.py      # Feedback & progress
│   │   └── notifications.py # Notification system
│   ├── services/            # Business logic
│   └── scripts/             # Database seeding
├── docker-compose.yml       # MongoDB container
├── requirements.txt         # Python dependencies
└── README.md
```

## 🔧 Key Features

### Session Management
- Book one-on-one or group sessions
- Public session join/leave
- Negotiation workflow (propose/accept/reject)
- Time conflict detection
- Availability slot splitting

### Notification System
- Real-time notifications for:
  - Booking requests
  - Negotiation proposals
  - Session confirmations
  - Feedback submissions
- Mark as read functionality

### Feedback & Progress
- Student feedback on sessions
- Tutor progress logs
- Rating system (1-5 stars)
- Analytics and statistics

### User Management
- Role-based access control (RBAC)
- Multiple roles per user
- Profile management
- Avatar upload to Cloudinary

## 🐛 Development

### View Logs

```powershell
docker-compose logs -f backend
```

### Restart Services

```powershell
docker-compose restart
```

### Stop Services

```powershell
docker-compose down
```

### Rebuild After Code Changes

```powershell
docker-compose up --build
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|--------|
| MONGODB_URL | MongoDB connection string | mongodb://localhost:27017 |
| DATABASE_NAME | Database name | tutor_support_db |
| SECRET_KEY | JWT secret key | (required) |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | (optional) |
| CLOUDINARY_API_KEY | Cloudinary API key | (optional) |
| CLOUDINARY_API_SECRET | Cloudinary API secret | (optional) |

## 🔒 Security Notes

- Mock SSO authentication for development only
- Cookie-based sessions with HTTPOnly flag
- Role-based access control (RBAC)
- Input validation with Pydantic

## 📞 API Endpoints Overview

### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout and clear session
- `GET /auth/me` - Get current user profile

### Sessions
- `GET /sessions/` - List user's sessions
- `POST /sessions/` - Create session request
- `GET /sessions/public` - List public group sessions
- `POST /sessions/{id}/join` - Join public session
- `POST /sessions/{id}/leave` - Leave public session
- `POST /sessions/{id}/negotiate` - Propose changes (tutor)
- `POST /sessions/{id}/negotiate/accept` - Accept proposal (student)

### Tutors
- `GET /tutors/` - Search tutors
- `GET /tutors/me` - Get my tutor profile
- `PUT /tutors/me` - Update my profile
- `POST /tutors/me/avatar` - Upload avatar

### Availability
- `GET /availability/{tutor_id}` - Get tutor availability
- `POST /availability/` - Create availability slot
- `DELETE /availability/{slot_id}` - Delete slot

### Feedback
- `POST /feedback/` - Submit feedback
- `GET /feedback/received` - Get received feedback (tutor)
- `GET /feedback/my-feedbacks` - Get my feedback (student)

### Notifications
- `GET /notifications/` - Get my notifications
- `PUT /notifications/{id}/read` - Mark as read
- `GET /notifications/unread-count` - Get unread count
