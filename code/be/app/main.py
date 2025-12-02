from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.mongodb import init_db
from app.routes import auth, users, academic, tutors, students, availability, sessions, feedback, attendance, reports, notifications, library
from app.core.tasks import auto_skip_expired_feedbacks_task, auto_complete_past_sessions_task

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    
    # Start background tasks
    asyncio.create_task(auto_skip_expired_feedbacks_task())
    asyncio.create_task(auto_complete_past_sessions_task())
    print("Background tasks started")
    
    yield
    print("Shutting down...")

app = FastAPI(
    title="HCMUT Tutor System API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(academic.router)
app.include_router(tutors.router)
app.include_router(students.router)
app.include_router(availability.router)
app.include_router(sessions.router)
app.include_router(feedback.router)
app.include_router(attendance.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(library.router)

@app.get("/")
async def root():
    return {"message": "HCMUT Tutor System is running!"}