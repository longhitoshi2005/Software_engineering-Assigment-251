# app/db/mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

from app.models.external.hcmut_sso import HCMUT_SSO
from app.models.external.faculty import Faculty
from app.models.external.major import Major
from app.models.external.course import Course
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile
from app.models.internal.session import TutorSession
from app.models.internal.feedback import SessionFeedback
from app.models.internal.progress import ProgressRecord
from app.models.internal.notification import Notification
from app.models.internal.availability import AvailabilitySlot

async def init_db():
    """
    Hàm này sẽ được gọi 1 lần duy nhất khi Server start.
    """
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    # 2. Chọn Database
    db_name = settings.DATABASE_NAME # VD: "tutor_system_db"
    
    # 3. Khởi tạo Beanie
    await init_beanie(
        database=client[db_name],
        document_models=[
            # Danh sách các bảng (Collection) sẽ được quản lý
            HCMUT_SSO,
            User,
            Faculty, Major, Course,
            TutorProfile, StudentProfile,
            TutorSession,
            SessionFeedback, ProgressRecord,
            Notification,
            AvailabilitySlot
        ]
    )
    print("✅ Database initialized! Connected to MongoDB.")