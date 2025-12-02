from pydantic import BaseModel
from datetime import datetime


class AttendanceResponse(BaseModel):
    """Response model for attendance logging."""
    id: str
    session_id: str
    student_id: str
    student_name: str
    tutor_id: str
    attended_at: datetime
    message: str = "Attendance marked successfully"
