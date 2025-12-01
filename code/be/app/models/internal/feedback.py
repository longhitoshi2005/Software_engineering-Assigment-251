from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document, Link

# Import các model liên quan
from .session import TutorSession
from .tutor_profile import TutorProfile
from .student_profile import StudentProfile

class FeedbackStatus(str, Enum):
    """Trạng thái feedback của student"""
    PENDING = "PENDING"       # Chưa submit, trong vòng 1 tuần
    SUBMITTED = "SUBMITTED"   # Đã submit feedback
    SKIPPED = "SKIPPED"       # Quá hạn 1 tuần, tự động mark là skipped

class SessionFeedback(Document):
    """
    FR-FBK.01: Session Feedback (Student -> Tutor)
    Logic:
    - Tạo tự động khi session COMPLETED
    - Student có 1 tuần để submit/edit
    - Sau 1 tuần tự động mark SKIPPED nếu chưa submit
    """
    session: Link[TutorSession] # Link 1-1
    
    # Denormalization: Lưu lại link Student và Tutor để query thống kê nhanh hơn
    # thay vì phải lookup qua session
    student: Link[StudentProfile]
    tutor: Link[TutorProfile]
    
    rating: Optional[int] = None # 1-5 sao, None nếu chưa submit
    comment: Optional[str] = None
    
    status: FeedbackStatus = FeedbackStatus.PENDING
    feedback_deadline: datetime # Session end_time + 7 days
    
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    
    class Settings:
        name = "session_feedbacks"