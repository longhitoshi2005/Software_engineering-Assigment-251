import asyncio
import os
import sys

# Setup path để import được app module
sys.path.append(os.getcwd())

from app.db.mongodb import init_db

# Import ALL Models cần xóa
from app.models.external.hcmut_sso import HCMUT_SSO
from app.models.external.faculty import Faculty
from app.models.external.major import Major
from app.models.external.course import Course

from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile
from app.models.internal.session import TutorSession
from app.models.internal.availability import AvailabilitySlot
from app.models.internal.notification import Notification
from app.models.internal.feedback import SessionFeedback
from app.models.internal.progress import ProgressRecord

async def clean_database():
    print("🧹 STARTING DATABASE CLEANUP...")
    
    # 1. Kết nối DB
    await init_db()
    
    # 2. Xóa dữ liệu theo thứ tự (Con trước -> Cha sau để an toàn, dù NoSQL không bắt buộc)
    print("   - Deleting Transaction Data...")
    await SessionFeedback.delete_all()
    await ProgressRecord.delete_all()
    await Notification.delete_all()
    await TutorSession.delete_all()
    await AvailabilitySlot.delete_all()
    
    print("   - Deleting Profiles...")
    await TutorProfile.delete_all()
    await StudentProfile.delete_all()
    
    print("   - Deleting Identity Data...")
    await User.delete_all()
    await HCMUT_SSO.delete_all()
    
    print("   - Deleting Master Data...")
    await Course.delete_all()
    await Major.delete_all()
    await Faculty.delete_all()
    
    print("✨ DATABASE IS NOW EMPTY AND SPARKLY CLEAN!")

if __name__ == "__main__":
    asyncio.run(clean_database())