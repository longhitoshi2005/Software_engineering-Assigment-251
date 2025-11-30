from fastapi import HTTPException, status
from datetime import datetime
from typing import List

# Models
from app.models.internal.user import User
from app.models.internal.session import TutorSession, SessionStatus
from app.models.internal.feedback import SessionFeedback
from app.models.internal.progress import ProgressRecord
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile

# Schemas
from app.models.schemas.feedback import (
    FeedbackCreateRequest, FeedbackResponse,
    ProgressCreateRequest, ProgressResponse
)

class FeedbackService:

    # ==========================================
    # 1. STUDENT GIVES FEEDBACK (FR-FBK.01)
    # ==========================================
    @staticmethod
    async def create_feedback(session_id: str, user: User, payload: FeedbackCreateRequest) -> FeedbackResponse:
        """Allows the student to submit a rating and comment on the session."""
        
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

        # 1. Permission Check (Only Student of this session)
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        
        # Check if the current user (student_profile) is a member of the session's students list
        is_student_of_session = student_profile and any(s.ref.id == student_profile.id for s in session.students)
        
        if not is_student_of_session:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only students of this session can provide feedback.")

        # 2. Check Timing (Must be COMPLETED)
        if session.status.value != SessionStatus.COMPLETED.value:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Feedback can only be provided for COMPLETED sessions.")
        
        # 3. Check for existing feedback (Prevent duplicate submissions per student/session)
        if await SessionFeedback.find_one(SessionFeedback.session.id == session.id, SessionFeedback.student.id == student_profile.id):
             raise HTTPException(status.HTTP_400_BAD_REQUEST, "Feedback already submitted for this session by this user.")

        # 4. Create Feedback Record
        feedback = SessionFeedback(
            session=session,
            student=student_profile,
            tutor=session.tutor,
            rating=payload.rating,
            comment=payload.comment
        )
        await feedback.save()

        # 5. UPDATE TUTOR RATING (Logic required for FR-RPT.02)
        tutor_profile = await session.tutor.fetch() # Get Tutor Profile object
        
        old_avg = tutor_profile.stats.average_rating
        old_count = tutor_profile.stats.total_feedbacks
        
        new_count = old_count + 1
        new_avg = ((old_avg * old_count) + payload.rating) / new_count
        
        # Update Stats
        tutor_profile.stats.average_rating = round(new_avg, 2)
        tutor_profile.stats.total_feedbacks = new_count
        await tutor_profile.save()

        return FeedbackResponse(
            id=str(feedback.id),
            session_id=str(session.id),
            student_name=user.full_name, # Snapshot name from User
            rating=feedback.rating,
            comment=feedback.comment,
            created_at=feedback.created_at
        )

    # ==========================================
    # 2. TUTOR RECORDS PROGRESS (FR-FBK.02)
    # ==========================================
    @staticmethod
    async def get_progress_record(session_id: str, user: User) -> ProgressResponse:
        """
        Retrieves the progress record for a specific session.
        
        Business Rules:
        - Any authenticated user can view progress records
        - Returns the progress record if it exists
        
        Args:
            session_id: The ID of the session
            user: The authenticated user
            
        Returns:
            ProgressResponse with progress details
            
        Raises:
            HTTPException: If session or progress record not found
        """
        # 1. Verify session exists
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        
        # 2. Find progress record for this session
        progress = await ProgressRecord.find_one(ProgressRecord.session.id == session.id)
        if not progress:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Progress record not found for this session")
        
        # 3. Fetch tutor info for response
        tutor_profile = await progress.tutor.fetch()
        tutor_user = await tutor_profile.user.fetch()
        
        return ProgressResponse(
            id=str(progress.id),
            session_id=str(session.id),
            tutor_name=tutor_user.full_name,
            topic_covered=progress.topic_covered,
            student_performance=progress.student_performance,
            created_at=progress.created_at
        )

    @staticmethod
    async def create_progress(session_id: str, user: User, payload: ProgressCreateRequest) -> ProgressResponse:
        """Allows the tutor to record mentee progress and generate summaries."""
        
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

        # 1. Permission Check (Only the assigned Tutor)
        tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        # FIX: Access .ref.id for Link comparison
        is_assigned_tutor = tutor_profile and session.tutor.ref.id == tutor_profile.id
        
        if not is_assigned_tutor:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the assigned Tutor can record progress.")
        
        # 2. Check Timing (Must be COMPLETED)
        if session.status != SessionStatus.COMPLETED:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Progress can only be recorded for COMPLETED sessions.")

        # 3. Create Record
        # MVP Logic: Progress applies to the primary session initiator (or the first in the list)
        target_student = session.students[0] 
        
        progress = ProgressRecord(
            session=session,
            tutor=tutor_profile,
            student=target_student,
            topic_covered=payload.topic_covered,
            student_performance=payload.student_performance,
            next_steps=payload.next_steps,
            attachment_urls=payload.attachment_urls
        )
        await progress.save()
        
        # 4. Update Stats (Count total sessions taught - FR-RPT)
        tutor_profile.stats.total_sessions = tutor_profile.stats.total_sessions + 1
        num_students_in_session = len(session.students)
        tutor_profile.stats.total_students = tutor_profile.stats.total_students + num_students_in_session
        
        await tutor_profile.save()

        return ProgressResponse(
            id=str(progress.id),
            session_id=str(session.id),
            tutor_name=user.full_name,
            topic_covered=progress.topic_covered,
            student_performance=progress.student_performance,
            created_at=progress.created_at
        )