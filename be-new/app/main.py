from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.mongodb import init_db
from app.routes import auth, users, academic, tutors, availability, sessions, feedback, attendance, reports, notifications, library

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    print("Shutting down...")

app = FastAPI(
    title="HCMUT Tutor System API",
    version="1.0.0",
    lifespan=lifespan
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(academic.router)
app.include_router(tutors.router)
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