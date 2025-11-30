from datetime import datetime
from typing import Optional
from beanie import Document, Link

# Import các model liên quan
from .session import TutorSession
from .tutor_profile import TutorProfile
from .student_profile import StudentProfile

class SessionFeedback(Document):
    """
    FR-FBK.01: Session Feedback (Student -> Tutor)
    """
    session: Link[TutorSession] # Link 1-1
    
    # Denormalization: Lưu lại link Student và Tutor để query thống kê nhanh hơn
    # thay vì phải lookup qua session
    student: Link[StudentProfile]
    tutor: Link[TutorProfile]
    
    rating: int # 1-5 sao
    comment: Optional[str] = None
    
    created_at: datetime = datetime.now()
    
    class Settings:
        name = "session_feedbacks"