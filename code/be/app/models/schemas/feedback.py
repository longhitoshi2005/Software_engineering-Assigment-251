from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# --- FEEDBACK (Student -> Tutor) ---
class FeedbackCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="1 to 5 stars")
    comment: Optional[str] = None

class FeedbackUpdateRequest(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="1 to 5 stars")
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    session: dict # Session info: id, tutor_name, course_code, course_name, start_time, end_time, mode, location
    rating: Optional[int] = None
    comment: Optional[str] = None
    status: str # PENDING, SUBMITTED, SKIPPED
    feedback_deadline: datetime
    created_at: datetime
    updated_at: datetime
    can_edit: bool # True if still within 1 week deadline

# For summary list
class FeedbackListItem(BaseModel):
    id: str
    session: dict # Session info
    rating: Optional[int] = None
    comment: Optional[str] = None
    status: str
    feedback_deadline: datetime
    created_at: datetime

# --- PROGRESS (Tutor -> Student) ---
class ProgressCreateRequest(BaseModel):
    topic_covered: str
    student_performance: str
    next_steps: Optional[str] = None
    attachment_urls: List[str] = []

class ProgressResponse(BaseModel):
    id: str
    session_id: str
    tutor_name: str
    topic_covered: str
    student_performance: str
    created_at: datetime