from typing import List, Optional, Annotated
from datetime import datetime
from enum import Enum

from beanie import Document, Indexed, Link
from pydantic import BaseModel, Field

# Import External & Master Data
from ..internal.user import User
from ..external.course import Course

# --- ENUMS ---

class LearningMode(str, Enum):
    ONLINE = "Online (Google Meet/Zoom)"
    OFFLINE = "Offline (Tại trường/Thư viện)"
    HYBRID = "Linh hoạt (Cả hai)"

class SupportType(str, Enum):
    HOMEWORK_HELP = "Giải đáp bài tập"
    EXAM_PREPARATION = "Ôn thi cuối kỳ"
    PROJECT_GUIDANCE = "Hướng dẫn Đồ án/BTL"
    CONCEPT_REVIEW = "Củng cố kiến thức nền"

# --- SUB-MODELS ---

class LearningGoal(BaseModel):
    """
    Mục tiêu cụ thể của sinh viên.
    Dùng để Tutor hiểu rõ nhu cầu trước khi nhận lớp.
    """
    target_subject: Link[Course]     # Môn đang cần support (VD: Giải tích 1)
    support_type: SupportType        # VD: Ôn thi
    note: Optional[str] = None       # VD: "Em mất gốc phần Tích phân"
    
    # Mức độ ưu tiên (để AI gợi ý trước)
    priority: int = 1 # 1: High, 2: Medium, 3: Low

class StudentStats(BaseModel):
    """
    Thống kê hoạt động học tập (Dùng cho báo cáo CTSV/Học bổng)
    """
    total_learning_hours: float = 0.0 # Tổng giờ đã học
    total_sessions: int = 0           # Tổng số buổi đã tham gia
    total_tutors_met: int = 0         # Đã học bao nhiêu gia sư khác nhau
    
    # Chỉ số chuyên cần (để Tutor đánh giá ngược lại Mentee)
    attendance_rate: int = 100        # Tỷ lệ đi học đúng giờ (%)

# --- MAIN DOCUMENT ---

class StudentProfile(Document):
    """
    Hồ sơ Người học (Mentee).
    Lưu trữ preferences để Matching tốt hơn.
    """
    # 1. Liên kết 1-1 với SSO
    user: Annotated[Link[User], Indexed(unique=True)]
    
    # 2. Profile Information
    bio: Optional[str] = None # Short introduction about learning goals and interests
    
    # 3. Cài đặt Tìm kiếm (Search Preferences)
    # Những setting này sẽ được điền sẵn (pre-fill) khi sinh viên tìm Tutor
    default_learning_mode: LearningMode = LearningMode.OFFLINE
    interested_topics: List[str] = [] # Tag quan tâm: ["AI", "Web Dev", "IELTS"]
    
    # 4. Nhu cầu học tập hiện tại (The "Demand")
    # Danh sách các môn đang gặp khó khăn và cần tìm Tutor
    learning_goals: List[LearningGoal] = []
    
    # 5. Thống kê & Gamification
    stats: StudentStats = StudentStats()
    
    # 6. Personal Avatar (Student can upload custom avatar separate from university photo)
    avatar_url: Optional[str] = None
    avatar_public_id: Optional[str] = None  # Cloudinary public ID for deletion
    
    # 7. Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "student_profiles"