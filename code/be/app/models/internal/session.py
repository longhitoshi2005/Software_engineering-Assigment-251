from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

from beanie import Document, Link
from pydantic import BaseModel, Field

# Local Imports
from .tutor_profile import TutorProfile
from .student_profile import StudentProfile
from app.models.external.course import Course
from ..enums.location import LocationMode

# --- ENUMS ---

class RequestType(str, Enum):
    ONE_ON_ONE = "ONE_ON_ONE"
    PRIVATE_GROUP = "PRIVATE_GROUP"
    PUBLIC_GROUP = "PUBLIC_GROUP"

class SessionStatus(str, Enum):
    """Trạng thái hiện tại của phiên học (State Machine)."""
    WAITING_FOR_TUTOR = "WAITING_FOR_TUTOR"
    WAITING_FOR_STUDENT = "WAITING_FOR_STUDENT"     # Chờ phản hồi từ Student sau khi Tutor mặc cả
    CONFIRMED = "CONFIRMED"                         # Đã chốt lịch, sẵn sàng diễn ra
    REJECTED = "REJECTED"                           # Tutor từ chối request
    CANCELLED = "CANCELLED"                         # Hủy sau khi đã CONFIRMED
    COMPLETED = "COMPLETED"                         # Đã diễn ra thành công

class ParticipationStatus(str, Enum):
    """Individual student participation status in a session."""
    CONFIRMED = "CONFIRMED"  # Student confirmed participation
    ATTENDED = "ATTENDED"    # Student attended the session
    ABSENT = "ABSENT"        # Student confirmed but didn't show up
    CANCELLED = "CANCELLED"  # Student cancelled their participation

# --- STUDENT PARTICIPATION (Embedded Model) ---

class StudentParticipation(BaseModel):
    """
    Tracks individual student participation in a session.
    """
    student: Link[StudentProfile]
    status: ParticipationStatus = ParticipationStatus.CONFIRMED
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# --- NEGOTIATION PROPOSAL (Embedded Model) ---

class NegotiationProposal(BaseModel):
    """
    Thông tin đề xuất thay đổi từ Tutor (được nhúng trong Session).
    """
    new_topic: Optional[str] = None
    new_start_time: Optional[datetime] = None
    new_end_time: Optional[datetime] = None
    new_mode: Optional[LocationMode] = None
    new_location: Optional[str] = None # Link meet (ONLINE) HOẶC phòng cụ thể (CAMPUS_1/2)
    
    tutor_message: str
    
    # Tutor có quyền override RequestType của Student
    new_max_capacity: Optional[int] = None
    new_is_public: Optional[bool] = None

# --- TUTOR SESSION (Main Document) ---

class TutorSession(Document):
    """
    Phiên học: Bản ghi booking đã chốt hoặc đang được yêu cầu.
    Chứa tất cả thông tin về thời gian, địa điểm và danh sách người tham gia.
    """
    # 1. Identity Links
    tutor: Link[TutorProfile]
    students: List[Link[StudentProfile]] # Danh sách người tham gia (Người book đầu tiên luôn nằm trong list này)
    
    # Individual student participation tracking
    student_participations: Optional[List[StudentParticipation]] = None

    # 2. Session Details
    course: Link[Course]
    topic: Optional[str] = None  # The specific topic or title set by tutor when confirming (e.g., "Introduction to Calculus", "Java OOP Concepts")
    start_time: datetime
    end_time: datetime
    mode: LocationMode  # ONLINE, CAMPUS_1, or CAMPUS_2
    location: Optional[str] = None # Meeting link (ONLINE) hoặc phòng cụ thể (CAMPUS_1/2)
    
    # 3. Capacity & Publicity (Được set cứng khi CONFIRMED)
    max_capacity: int = 1
    is_public: bool = False
    
    # Nhu cầu ban đầu của Student (Giúp Tutor dễ dàng đặt Capacity/Publicity)
    session_request_type: RequestType = RequestType.ONE_ON_ONE
    
    # Student's note when making the booking request
    note: Optional[str] = None
    
    # 4. Status & History
    status: SessionStatus
    proposal: Optional[NegotiationProposal] = None
    
    cancelled_by: Optional[str] = None
    cancellation_reason: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "tutor_sessions"
        indexes = [
            # Index cho việc tìm kiếm session của Tutor/Student (Timeline)
            [("tutor", 1), ("start_time", -1)],
            [("students", 1), ("start_time", -1)],
            # Index cho việc tìm kiếm session công khai (Discovery)
            [("is_public", 1), ("course", 1), ("status", 1)]
        ]