from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# --- FEEDBACK (Student -> Tutor) ---
class FeedbackCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="1 to 5 stars")
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    session_id: str
    student_name: str
    rating: int
    comment: Optional[str] = None
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