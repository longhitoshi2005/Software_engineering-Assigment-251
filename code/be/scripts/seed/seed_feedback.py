"""
Seed feedback records for completed sessions.
Inspired by frontend mock data in tutor/feedback-from-students/page.tsx.
Run this after seed_sessions.py.
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
from app.models.internal.session import TutorSession, SessionStatus
from app.models.internal.feedback import SessionFeedback, FeedbackStatus


async def seed_feedback():
    """Create feedback records for completed sessions."""
    print("⭐ SEEDING FEEDBACK RECORDS...")
    await init_db()
    
    # Get users
    user_tuan = await User.find_one(User.email_edu == "tuan.pham@hcmut.edu.vn")
    user_gioi = await User.find_one(User.email_edu == "student_gioi@hcmut.edu.vn")
    user_lan = await User.find_one(User.email_edu == "lan.tran@hcmut.edu.vn")
    
    if not all([user_tuan, user_gioi, user_lan]):
        print("❌ ERROR: Users not found. Run seed_users.py first.")
        return
    
    # Get profiles
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
    
    # Get completed sessions
    completed_sessions = await TutorSession.find(
        TutorSession.status == SessionStatus.COMPLETED
    ).to_list()
    
    if len(completed_sessions) < 3:
        print("⚠️  WARNING: Not enough completed sessions. Run seed_sessions.py first.")
        return
    
    # Fetch links for all sessions
    for session in completed_sessions:
        await session.fetch_all_links()
    
    session1, session2, session3 = completed_sessions[0], completed_sessions[1], completed_sessions[2]
    now = datetime.now(timezone.utc)
    
    # Feedback inspired by frontend mock data
    feedbacks = [
        # Session 1 - SUBMITTED (5 stars)
        SessionFeedback(
            session=session1,
            student=student_lan,
            tutor=tutor_tuan,
            rating=5,
            comment="Very clear explanation! Excellent teaching style and great use of examples.",
            status=FeedbackStatus.SUBMITTED,
            feedback_deadline=session1.end_time + timedelta(days=7)
        ),
        # Session 2 - SUBMITTED (4 stars)
        SessionFeedback(
            session=session2,
            student=student_lan,
            tutor=tutor_gioi,
            rating=4,
            comment="Helpful examples. Good pacing and visuals made complex topics easier to understand.",
            status=FeedbackStatus.SUBMITTED,
            feedback_deadline=session2.end_time + timedelta(days=7)
        ),
        # Session 3 (student_lan) - PENDING (within deadline, not submitted)
        SessionFeedback(
            session=session3,
            student=student_lan,
            tutor=tutor_tuan,
            rating=None,
            comment=None,
            status=FeedbackStatus.PENDING,
            feedback_deadline=session3.end_time + timedelta(days=7)
        ),
        # Session 3 (student_gioi) - SKIPPED (deadline passed)
        SessionFeedback(
            session=session3,
            student=student_gioi,
            tutor=tutor_tuan,
            rating=None,
            comment=None,
            status=FeedbackStatus.SKIPPED,
            feedback_deadline=now - timedelta(days=1)
        ),
    ]
    
    # Create more diverse feedback based on frontend mock patterns
    # Expanded feedback templates for 20+ feedbacks
    additional_feedback_templates = [
        (5, "Great pacing & visuals. Step-by-step approach was perfect."),
        (5, "Loved the debugging demo. Clear strategies for practice."),
        (5, "Outstanding session! Really helped me understand complex concepts."),
        (5, "Excellent tutor, very patient and knowledgeable."),
        (4, "Nice recap at the end. Examples matched homework well."),
        (4, "Good understanding of the material. Patient with questions."),
        (4, "Very helpful session, learned a lot in short time."),
        (4, "Clear explanations, would recommend to others."),
        (4, "Solid teaching style, appreciated the real-world examples."),
        (3, "Ok but a bit fast. Need slower derivations for better understanding."),
        (3, "Decent session but could use more interactive examples."),
        (3, "Average experience, some parts were unclear."),
        (3, "Helpful but rushed through some important topics."),
        (2, "Hard to follow pointers. Would appreciate more basic explanations."),
        (2, "Not very engaging, struggled to stay focused."),
        (2, "Concepts explained too quickly for beginners."),
        (1, "Audio issues on Zoom made it difficult to hear clearly."),
        (1, "Session started 20 minutes late, very unprofessional."),
    ]
    
    # Create feedback for all completed sessions
    import random
    for i, session in enumerate(completed_sessions[3:]):
        await session.fetch_all_links()
        
        # Get first student from session
        if session.students:
            student = session.students[0]
            
            # Randomly decide status: 70% SUBMITTED, 20% PENDING, 10% SKIPPED
            status_roll = random.random()
            if status_roll < 0.7:  # SUBMITTED
                template_idx = i % len(additional_feedback_templates)
                rating, comment = additional_feedback_templates[template_idx]
                status = FeedbackStatus.SUBMITTED
            elif status_roll < 0.9:  # PENDING
                rating, comment = None, None
                status = FeedbackStatus.PENDING
            else:  # SKIPPED
                rating, comment = None, None
                status = FeedbackStatus.SKIPPED
            
            feedback = SessionFeedback(
                session=session,
                student=student,
                tutor=session.tutor,
                rating=rating,
                comment=comment,
                status=status,
                feedback_deadline=session.end_time + timedelta(days=7) if status != FeedbackStatus.SKIPPED 
                                 else now - timedelta(days=random.randint(1, 3))
            )
            feedbacks.append(feedback)
    
    for fb in feedbacks:
        await fb.save()
    
    # Count by status
    submitted = sum(1 for fb in feedbacks if fb.status == FeedbackStatus.SUBMITTED)
    pending = sum(1 for fb in feedbacks if fb.status == FeedbackStatus.PENDING)
    skipped = sum(1 for fb in feedbacks if fb.status == FeedbackStatus.SKIPPED)
    
    print(f"✅ Created {len(feedbacks)} feedback records")
    print(f"   - SUBMITTED: {submitted}")
    print(f"   - PENDING: {pending}")
    print(f"   - SKIPPED: {skipped}")
    
    # Calculate average rating
    rated_feedbacks = [fb for fb in feedbacks if fb.rating is not None]
    if rated_feedbacks:
        avg_rating = sum(fb.rating for fb in rated_feedbacks) / len(rated_feedbacks)
        print(f"   - Average rating: {avg_rating:.2f}")
    
    # Recalculate tutor stats after creating feedbacks
    print("\n📊 Recalculating tutor stats...")
    from app.services.tutor_service import TutorService
    result = await TutorService.recalculate_tutor_stats()
    print(f"✅ {result['message']}")
    
    # Recalculate student stats after creating feedbacks
    print("\n📚 Recalculating student stats...")
    from app.services.student_service import StudentService
    student_count = await StudentService.recalculate_student_stats()
    print(f"✅ Successfully recalculated stats for {student_count} students")


if __name__ == "__main__":
    asyncio.run(seed_feedback())
