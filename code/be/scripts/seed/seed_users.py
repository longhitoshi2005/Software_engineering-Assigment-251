import asyncio
import os
import sys
from datetime import datetime
from enum import Enum

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.core.security import get_password_hash

from app.models.external.hcmut_sso import (
    HCMUT_SSO, UniversityIdentity, ContactInfo, WorkInfo, AcademicStatus, StudentStatus, Gender
)
from app.models.external.major import Major
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile, TutorStatus, TeachingSubject
from app.models.internal.student_profile import StudentProfile
from app.models.external.course import Course
from app.models.enums.role import UserRole

# --- MAIN SEED USER DATA ---

async def seed_user_data():
    print("👨‍🎓 [2/3] SEEDING USER ACCOUNTS & PROFILES...")
    await init_db()
    
    hashed_pwd = get_password_hash("123")

    # Lấy Master Data cần thiết để tạo Link
    cs_major = await Major.find_one(Major.code == "CSE_CS")
    if not cs_major:
        print("ERROR: Master Data not found. Run seed_master.py first.")
        return

    co3005 = await Course.find_one(Course.code == "CO3005")
    as1001 = await Course.find_one(Course.code == "AS1001")
    
    # ==========================================
    # DATA DEFINITIONS (Users)
    # ==========================================
    
    # --- USER 1: HEAD CSE (Dept Chair/Assigner) ---
    sso_head = HCMUT_SSO(
        username="head.cse", password_hash=hashed_pwd, identity_id="GV999", 
        identity_type=UniversityIdentity.LECTURER, full_name="PGS. TS. Truong Khoa", gender=Gender.MALE,
        contact=ContactInfo(email_edu="head.cse@hcmut.edu.vn", email_personal="head@gmail.com"),
        work_info=WorkInfo(department="CSE", position="TRUONG_KHOA")
    )
    await sso_head.save()
    user_head = User(
        sso_info=sso_head, full_name=sso_head.full_name, email_edu=sso_head.contact.email_edu,
        roles=[UserRole.DEPT_CHAIR, UserRole.TUTOR]
    )
    await user_head.save()
    await TutorProfile(user=user_head, display_name="Trưởng Khoa (Assigner)").save()
    print("   + Created: head.cse (Admin)")

    # --- USER 2: LECTURER TUTOR (Thầy Tuấn) ---
    sso_tuan = HCMUT_SSO(
        username="tuan.pham", password_hash=hashed_pwd, identity_id="GV001", 
        identity_type=UniversityIdentity.LECTURER, full_name="TS. Pham Quang Tuan", gender=Gender.MALE,
        contact=ContactInfo(email_edu="tuan.pham@hcmut.edu.vn"),
        work_info=WorkInfo(department="CSE", position="Lecturer")
    )
    await sso_tuan.save()
    
    user_tuan = User(
        sso_info=sso_tuan, full_name=sso_tuan.full_name, email_edu=sso_tuan.contact.email_edu, roles=[UserRole.TUTOR]
    )
    await user_tuan.save()
    
    await TutorProfile(
        user=user_tuan, display_name="Thầy Tuấn (CSE)", bio="Tiến sĩ KHMT, chuyên dạy các môn cốt lõi.",
        status=TutorStatus.AVAILABLE,
        teaching_subjects=[
            TeachingSubject(course_ref=co3005),
            TeachingSubject(course_ref=as1001)
        ]
    ).save()
    print("   + Created: tuan.pham (Tutor)")

    # --- USER 3: STUDENT TUTOR (Anh Giỏi) ---
    sso_gioi = HCMUT_SSO(
        username="student_gioi", password_hash=hashed_pwd, identity_id="1910001", 
        identity_type=UniversityIdentity.STUDENT, full_name="Nguyen Van Gioi", gender=Gender.MALE,
        contact=ContactInfo(email_edu="student_gioi@hcmut.edu.vn"),
        academic=AcademicStatus(major_link=cs_major, major=cs_major.name, class_code="CS19", current_year=4, student_status=StudentStatus.STUDYING)
    )
    await sso_gioi.save()
    
    user_gioi = User(
        sso_info=sso_gioi, full_name=sso_gioi.full_name, email_edu=sso_gioi.contact.email_edu,
        roles=[UserRole.STUDENT, UserRole.TUTOR]
    )
    await user_gioi.save()
    await StudentProfile(user=user_gioi).save()
    
    # Create TutorProfile for student tutor
    await TutorProfile(
        user=user_gioi, 
        display_name="Anh Giỏi (Student Tutor)", 
        bio="Senior CS student with strong fundamentals, passionate about helping juniors.",
        status=TutorStatus.AVAILABLE,
        tags=["Python", "Algorithms", "Data Structures", "Peer Tutoring"],
        teaching_subjects=[
            TeachingSubject(course_ref=co3005)
        ]
    ).save()
    print("   + Created: student_gioi (Student Tutor)")

    # --- USER 4: STUDENT MENTEE (Lan - Mentee) ---
    sso_lan = HCMUT_SSO(
        username="lan.tran", password_hash=hashed_pwd, identity_id="2110002", 
        identity_type=UniversityIdentity.STUDENT, full_name="Tran Thi Lan", gender=Gender.FEMALE,
        contact=ContactInfo(email_edu="lan.tran@hcmut.edu.vn"),
        academic=AcademicStatus(major_link=cs_major, major=cs_major.name, class_code="CS21", current_year=2, student_status=StudentStatus.STUDYING)
    )
    await sso_lan.save()
    
    user_lan = User(
        sso_info=sso_lan, full_name=sso_lan.full_name, email_edu=sso_lan.contact.email_edu,
        roles=[UserRole.STUDENT]
    )
    await user_lan.save()
    await StudentProfile(user=user_lan).save()
    print("   + Created: lan.tran (Mentee)")
    
    print("   ✅ User Data Ready.")

if __name__ == "__main__":
    asyncio.run(seed_user_data())