from datetime import datetime, timezone
from beanie import Document, Link
from pydantic import Field

# Import các model liên quan
from .session import TutorSession
from .tutor_profile import TutorProfile
from .student_profile import StudentProfile


class AttendanceLog(Document):
    """
    FR-ATT.01: Attendance Logging
    Tracks student attendance for tutoring sessions.
    """
    session_ref: Link[TutorSession]
    student_ref: Link[StudentProfile]
    tutor_ref: Link[TutorProfile]
    
    attended_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "attendance_logs"
        indexes = [
            # Index for querying attendance by session
            [("session_ref", 1)],
            # Index for querying attendance by student
            [("student_ref", 1), ("attended_at", -1)],
            # Index for querying attendance by tutor
            [("tutor_ref", 1), ("attended_at", -1)],
            # Ensure a student can only mark attendance once per session
            [("session_ref", 1), ("student_ref", 1)]
        ]
