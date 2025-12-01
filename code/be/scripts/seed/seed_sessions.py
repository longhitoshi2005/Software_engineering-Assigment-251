"""
Seed tutoring sessions with various statuses.
Run this after seed_users.py.
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile
from app.models.internal.session import TutorSession, SessionStatus, RequestType, NegotiationProposal
from app.models.external.course import Course
from app.models.enums.location import LocationMode


async def seed_sessions():
    """Create tutoring sessions with various statuses."""
    print("📝 SEEDING TUTORING SESSIONS...")
    await init_db()
    
    # Get users
    user_tuan = await User.find_one(User.email_edu == "tuan.pham@hcmut.edu.vn")
    user_gioi = await User.find_one(User.email_edu == "student_gioi@hcmut.edu.vn")
    user_lan = await User.find_one(User.email_edu == "lan.tran@hcmut.edu.vn")
    
    if not user_tuan or not user_gioi or not user_lan:
        print("❌ ERROR: Users not found. Run seed_users.py first.")
        return
    
    # Get all student profiles
    all_tutor_profiles = await TutorProfile.find_all().to_list()
    all_student_profiles = await StudentProfile.find_all().to_list()
    
    tutor_tuan = None
    tutor_gioi = None
    student_lan = None
    student_gioi = None
    
    for tp in all_tutor_profiles:
        await tp.fetch_link(TutorProfile.user)
        if tp.user.id == user_tuan.id:
            tutor_tuan = tp
        elif tp.user.id == user_gioi.id:
            tutor_gioi = tp
    
    for sp in all_student_profiles:
        await sp.fetch_link(StudentProfile.user)
        if sp.user.id == user_lan.id:
            student_lan = sp
        elif sp.user.id == user_gioi.id:
            student_gioi = sp
    
    if not all([tutor_tuan, tutor_gioi, student_lan, student_gioi]):
        print("❌ ERROR: Profiles not found.")
        return
    
    # Get additional students for more sessions
    other_students = [sp for sp in all_student_profiles if sp not in [student_lan, student_gioi]]
    
    # Get courses
    co3005 = await Course.find_one(Course.code == "CO3005")
    co2003 = await Course.find_one(Course.code == "CO2003")
    as1001 = await Course.find_one(Course.code == "AS1001")
    
    now = datetime.now(timezone.utc)
    sessions = []
    
    # Session templates for variety
    locations_online = [
        "https://meet.google.com/abc-defg-hij",
        "https://zoom.us/j/123456789",
        "https://teams.microsoft.com/session-xyz",
        "https://meet.google.com/study-room-1",
    ]
    
    locations_campus = ["Room H1-101", "Room H6-202", "Room H3-303", "Library 2F", "Room B1-101"]
    
    notes = [
        "Need help with Software Architecture patterns",
        "Data Structures practice problems",
        "Algorithm optimization techniques",
        "Debugging complex code issues",
        "Exam preparation session",
        "Project guidance and code review",
        "Understanding recursion and DP",
        "Database design fundamentals",
        "Object-oriented programming concepts",
        "Web development basics",
    ]
    
    # --- COMPLETED SESSIONS (for feedback & progress) ---
    session1 = TutorSession(
        tutor=tutor_tuan,
        students=[student_lan],
        course=co3005,
        start_time=now - timedelta(days=7, hours=2),
        end_time=now - timedelta(days=7),
        mode=LocationMode.ONLINE,
        location="https://meet.google.com/abc-defg-hij",
        max_capacity=1,
        is_public=False,
        session_request_type=RequestType.ONE_ON_ONE,
        status=SessionStatus.COMPLETED,
        note="Need help with Software Architecture patterns"
    )
    await session1.save()
    sessions.append(session1)
    
    session2 = TutorSession(
        tutor=tutor_gioi,
        students=[student_lan],
        course=co3005,
        start_time=now - timedelta(days=5, hours=2),
        end_time=now - timedelta(days=5),
        mode=LocationMode.CAMPUS_1,
        location="Room H1-101",
        max_capacity=1,
        is_public=False,
        session_request_type=RequestType.ONE_ON_ONE,
        status=SessionStatus.COMPLETED,
        note="Data Structures practice problems"
    )
    await session2.save()
    sessions.append(session2)
    
    session3 = TutorSession(
        tutor=tutor_tuan,
        students=[student_lan, student_gioi],
        course=as1001,
        start_time=now - timedelta(days=3, hours=2),
        end_time=now - timedelta(days=3),
        mode=LocationMode.ONLINE,
        location="https://meet.google.com/group-study",
        max_capacity=5,
        is_public=True,
        session_request_type=RequestType.PUBLIC_GROUP,
        status=SessionStatus.COMPLETED,
        note="Group study for midterm exam"
    )
    await session3.save()
    sessions.append(session3)
    
    # --- CONFIRMED SESSIONS (upcoming) ---
    session4 = TutorSession(
        tutor=tutor_tuan,
        students=[student_lan],
        course=co3005,
        start_time=now + timedelta(days=4, hours=10),
        end_time=now + timedelta(days=4, hours=12),
        mode=LocationMode.CAMPUS_1,
        location="Room H6-202",
        max_capacity=1,
        is_public=False,
        session_request_type=RequestType.ONE_ON_ONE,
        status=SessionStatus.CONFIRMED,
        note="Need help with Design Patterns implementation"
    )
    await session4.save()
    sessions.append(session4)
    
    session5 = TutorSession(
        tutor=tutor_gioi,
        students=[student_lan],
        course=co2003,
        start_time=now + timedelta(days=6, hours=14),
        end_time=now + timedelta(days=6, hours=16),
        mode=LocationMode.ONLINE,
        location="https://meet.google.com/algo-study",
        max_capacity=10,
        is_public=True,
        session_request_type=RequestType.PUBLIC_GROUP,
        status=SessionStatus.CONFIRMED,
        note="Algorithm study group - Tree traversal"
    )
    await session5.save()
    sessions.append(session5)
    
    # --- PENDING SESSIONS ---
    session6 = TutorSession(
        tutor=tutor_tuan,
        students=[student_lan],
        course=co3005,
        start_time=now + timedelta(days=8, hours=15),
        end_time=now + timedelta(days=8, hours=17),
        mode=LocationMode.ONLINE,
        location=None,
        max_capacity=1,
        is_public=False,
        session_request_type=RequestType.ONE_ON_ONE,
        status=SessionStatus.WAITING_FOR_TUTOR,
        note="Help with UML diagrams for project"
    )
    await session6.save()
    sessions.append(session6)
    
    # --- NEGOTIATION SESSION ---
    session7 = TutorSession(
        tutor=tutor_gioi,
        students=[student_lan],
        course=co2003,
        start_time=now + timedelta(days=9, hours=10),
        end_time=now + timedelta(days=9, hours=12),
        mode=LocationMode.CAMPUS_1,
        location="Room H3-303",
        max_capacity=1,
        is_public=False,
        session_request_type=RequestType.ONE_ON_ONE,
        status=SessionStatus.WAITING_FOR_STUDENT,
        proposal=NegotiationProposal(
            new_start_time=now + timedelta(days=9, hours=14),
            new_end_time=now + timedelta(days=9, hours=16),
            new_mode=LocationMode.ONLINE,
            new_location="https://meet.google.com/xyz-counter",
            tutor_message="Sorry, I have class in the morning. Can we do online at 2pm instead?"
        ),
        note="Graph algorithms practice"
    )
    await session7.save()
    sessions.append(session7)
    
    # --- REJECTED SESSION ---
    session8 = TutorSession(
        tutor=tutor_tuan,
        students=[student_lan],
        course=as1001,
        start_time=now + timedelta(days=2, hours=8),
        end_time=now + timedelta(days=2, hours=10),
        mode=LocationMode.CAMPUS_2,
        location="Room B1-101",
        max_capacity=1,
        is_public=False,
        session_request_type=RequestType.ONE_ON_ONE,
        status=SessionStatus.REJECTED,
        note="Early morning session request"
    )
    await session8.save()
    sessions.append(session8)
    
    # --- CANCELLED SESSION ---
    session9 = TutorSession(
        tutor=tutor_gioi,
        students=[student_lan],
        course=co3005,
        start_time=now - timedelta(days=1, hours=10),
        end_time=now - timedelta(days=1, hours=8),
        mode=LocationMode.ONLINE,
        location="https://meet.google.com/cancelled",
        max_capacity=1,
        is_public=False,
        session_request_type=RequestType.ONE_ON_ONE,
        status=SessionStatus.CANCELLED,
        cancelled_by=str(student_lan.id),
        cancellation_reason="Student sick, late cancellation (< 2 hours)",
        note="Review for final exam"
    )
    await session9.save()
    sessions.append(session9)
    
    # --- CREATE ADDITIONAL 11+ COMPLETED SESSIONS FOR MORE FEEDBACK/PROGRESS DATA ---
    import random
    
    for i in range(11):
        days_ago = random.randint(8, 30)
        tutor = random.choice([tutor_tuan, tutor_gioi])
        student = random.choice([student_lan, student_gioi] + other_students[:3])
        course = random.choice([co3005, co2003, as1001])
        mode = random.choice([LocationMode.ONLINE, LocationMode.CAMPUS_1])
        location = random.choice(locations_online if mode == LocationMode.ONLINE else locations_campus)
        
        session = TutorSession(
            tutor=tutor,
            students=[student],
            course=course,
            start_time=now - timedelta(days=days_ago, hours=2),
            end_time=now - timedelta(days=days_ago),
            mode=mode,
            location=location,
            max_capacity=1,
            is_public=False,
            session_request_type=RequestType.ONE_ON_ONE,
            status=SessionStatus.COMPLETED,
            note=random.choice(notes)
        )
        await session.save()
        sessions.append(session)
    
    # --- CREATE ADDITIONAL UPCOMING/PENDING SESSIONS ---
    for i in range(5):
        days_ahead = random.randint(3, 15)
        tutor = random.choice([tutor_tuan, tutor_gioi])
        student = random.choice([student_lan] + other_students[:4])
        course = random.choice([co3005, co2003, as1001])
        status = random.choice([SessionStatus.CONFIRMED, SessionStatus.WAITING_FOR_TUTOR])
        
        session = TutorSession(
            tutor=tutor,
            students=[student],
            course=course,
            start_time=now + timedelta(days=days_ahead, hours=10),
            end_time=now + timedelta(days=days_ahead, hours=12),
            mode=LocationMode.ONLINE,
            location="https://meet.google.com/upcoming-session" if status == SessionStatus.CONFIRMED else None,
            max_capacity=1,
            is_public=False,
            session_request_type=RequestType.ONE_ON_ONE,
            status=status,
            note=random.choice(notes)
        )
        await session.save()
        sessions.append(session)
    
    completed = sum(1 for s in sessions if s.status == SessionStatus.COMPLETED)
    confirmed = sum(1 for s in sessions if s.status == SessionStatus.CONFIRMED)
    waiting_tutor = sum(1 for s in sessions if s.status == SessionStatus.WAITING_FOR_TUTOR)
    waiting_student = sum(1 for s in sessions if s.status == SessionStatus.WAITING_FOR_STUDENT)
    rejected = sum(1 for s in sessions if s.status == SessionStatus.REJECTED)
    cancelled = sum(1 for s in sessions if s.status == SessionStatus.CANCELLED)
    
    print(f"✅ Created {len(sessions)} sessions")
    print(f"   - COMPLETED: {completed}")
    print(f"   - CONFIRMED: {confirmed}")
    print(f"   - WAITING_FOR_TUTOR: {waiting_tutor}")
    print(f"   - WAITING_FOR_STUDENT: {waiting_student}")
    print(f"   - REJECTED: {rejected}")
    print(f"   - CANCELLED: {cancelled}")


if __name__ == "__main__":
    asyncio.run(seed_sessions())
