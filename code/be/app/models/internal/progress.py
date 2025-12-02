from datetime import datetime
from typing import List, Optional
from beanie import Document, Link

from .session import TutorSession
from .tutor_profile import TutorProfile
from .student_profile import StudentProfile

class ProgressRecord(Document):
    """
    FR-FBK.02: Progress Recording (Tutor -> Student)
    """
    session: Link[TutorSession]
    tutor: Link[TutorProfile]
    student: Link[StudentProfile]
    
    topic_covered: str             # Nội dung đã dạy
    student_performance: str       # Nhận xét mức độ hiểu bài
    next_steps: Optional[str] = None 
    
    attachment_urls: List[str] = []
    
    created_at: datetime = datetime.now()
    
    class Settings:
        name = "progress_records"