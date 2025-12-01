"""
Background tasks and scheduled jobs for the application.
"""
import asyncio
from datetime import datetime, timedelta
from app.services.feedback_service import FeedbackService


async def auto_skip_expired_feedbacks_task():
    """
    Background task to automatically finalize expired PENDING feedbacks.
    - Feedbacks with ratings → SUBMITTED + update tutor stats
    - Feedbacks without ratings → SKIPPED
    Runs every hour to check for feedbacks past their 1-week deadline.
    """
    while True:
        try:
            print(f"[{datetime.now()}] Running auto-finalize expired feedbacks task...")
            finalized_count = await FeedbackService.auto_skip_expired_feedbacks()
            print(f"[{datetime.now()}] Finalized {finalized_count} expired feedback(s)")
        except Exception as e:
            print(f"[{datetime.now()}] Error in auto-finalize task: {e}")
        
        # Run every hour
        await asyncio.sleep(3600)


async def auto_complete_past_sessions_task():
    """
    Background task to automatically mark CONFIRMED sessions as COMPLETED
    if their end_time has passed.
    Runs every 30 minutes.
    """
    while True:
        try:
            print(f"[{datetime.now()}] Running auto-complete past sessions task...")
            
            from app.models.internal.session import TutorSession, SessionStatus
            from app.services.feedback_service import FeedbackService
            
            now = datetime.now()
            
            # Find all CONFIRMED sessions that have ended
            past_sessions = await TutorSession.find(
                TutorSession.status == SessionStatus.CONFIRMED,
                TutorSession.end_time < now
            ).to_list()
            
            for session in past_sessions:
                session.status = SessionStatus.COMPLETED
                await session.save()
                
                # Auto-create feedback records
                await FeedbackService.create_feedback_records_for_session(session)
            
            print(f"[{datetime.now()}] Auto-completed {len(past_sessions)} sessions")
            
        except Exception as e:
            print(f"[{datetime.now()}] Error in auto-complete task: {e}")
        
        # Run every 30 minutes
        await asyncio.sleep(1800)
