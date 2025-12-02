from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import List

# Models
from app.models.internal.user import User
from app.models.internal.session import TutorSession, SessionStatus
from app.models.internal.feedback import SessionFeedback, FeedbackStatus
from app.models.internal.progress import ProgressRecord
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile

# Schemas
from app.models.schemas.feedback import (
    FeedbackCreateRequest, FeedbackUpdateRequest, FeedbackResponse, FeedbackListItem,
    ProgressCreateRequest, ProgressResponse
)

class FeedbackService:

    # ==========================================
    # HELPER: Build session info dict
    # ==========================================
    @staticmethod
    async def _build_session_info(session: TutorSession) -> dict:
        """Build session info dict for response"""
        await session.fetch_all_links()
        
        # After fetch_all_links, session.tutor is already TutorProfile, not Link
        # But we need to fetch the nested user link
        tutor_profile = session.tutor
        await tutor_profile.fetch_link(tutor_profile.__class__.user)
        tutor_user = tutor_profile.user
        
        # Course is already fetched by fetch_all_links
        course = session.course
        
        return {
            "id": str(session.id),
            "tutor_name": tutor_user.full_name,
            "course_code": course.code,
            "course_name": course.name,
            "topic": session.topic,
            "start_time": session.start_time.isoformat(),
            "end_time": session.end_time.isoformat(),
            "mode": session.mode.value,
            "location": session.location
        }

    # ==========================================
    # 1. GET MY FEEDBACKS (Student)
    # ==========================================
    @staticmethod
    async def get_my_feedbacks(user: User) -> List[FeedbackListItem]:
        """Get all feedbacks for current student"""
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not student_profile:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Student profile not found")
        
        # Find all feedbacks for this student
        feedbacks = await SessionFeedback.find(
            SessionFeedback.student.id == student_profile.id
        ).to_list()
        
        result = []
        for fb in feedbacks:
            session = await fb.session.fetch()
            session_info = await FeedbackService._build_session_info(session)
            
            result.append(FeedbackListItem(
                id=str(fb.id),
                session=session_info,
                rating=fb.rating,
                comment=fb.comment,
                status=fb.status.value,
                feedback_deadline=fb.feedback_deadline,
                created_at=fb.created_at
            ))
        
        return result

    # ==========================================
    # 1B. GET FEEDBACKS FOR TUTOR
    # ==========================================
    @staticmethod
    async def get_feedbacks_for_tutor(user: User) -> List[FeedbackListItem]:
        """Get all feedbacks received by current tutor"""
        tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        if not tutor_profile:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Tutor profile not found")
        
        # Find all feedbacks for this tutor
        feedbacks = await SessionFeedback.find(
            SessionFeedback.tutor.id == tutor_profile.id
        ).to_list()
        
        result = []
        for fb in feedbacks:
            # Fetch session and student info
            await fb.fetch_all_links()
            session = fb.session
            student = fb.student
            
            # Build session info with student details
            await session.fetch_link(TutorSession.course)
            await student.fetch_link(StudentProfile.user)
            await student.user.fetch_link(User.sso_info)
            
            course = session.course
            student_sso = student.user.sso_info
            
            # Build session info dict with student MSSV
            session_info = {
                "id": str(session.id),
                "student_id": student_sso.identity_id,  # MSSV
                "student_name": student.user.full_name,
                "course_code": course.code,
                "course_name": course.name,
                "start_time": session.start_time.isoformat(),
                "end_time": session.end_time.isoformat(),
                "mode": session.mode.value,
                "location": session.location
            }
            
            result.append(FeedbackListItem(
                id=str(fb.id),
                session=session_info,
                rating=fb.rating,
                comment=fb.comment,
                status=fb.status.value,
                feedback_deadline=fb.feedback_deadline,
                created_at=fb.created_at
            ))
        
        # Sort by created_at descending (newest first)
        result.sort(key=lambda x: x.created_at, reverse=True)
        
        return result

    # ==========================================
    # 2. GET FEEDBACK BY SESSION (Student/Tutor)
    # ==========================================
    @staticmethod
    async def get_feedback_by_session(session_id: str, user: User) -> FeedbackResponse:
        """Get feedback for a specific session"""
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        
        # For student: get their own feedback
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if student_profile:
            feedback = await SessionFeedback.find_one(
                SessionFeedback.session.id == session.id,
                SessionFeedback.student.id == student_profile.id
            )
        else:
            # For tutor: get feedback from first student (or modify as needed)
            feedback = await SessionFeedback.find_one(SessionFeedback.session.id == session.id)
        
        if not feedback:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Feedback not found")
        
        session_info = await FeedbackService._build_session_info(session)
        now = datetime.now()
        can_edit = feedback.status == FeedbackStatus.PENDING and now < feedback.feedback_deadline
        
        return FeedbackResponse(
            id=str(feedback.id),
            session=session_info,
            rating=feedback.rating,
            comment=feedback.comment,
            status=feedback.status.value,
            feedback_deadline=feedback.feedback_deadline,
            created_at=feedback.created_at,
            updated_at=feedback.updated_at,
            can_edit=can_edit
        )

    # ==========================================
    # 3. SUBMIT/UPDATE FEEDBACK (Student)
    # ==========================================
    @staticmethod
    async def submit_or_update_feedback(
        session_id: str, 
        user: User, 
        payload: FeedbackUpdateRequest
    ) -> FeedbackResponse:
        """Submit or update feedback for a session (within 1 week deadline)"""
        
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

        # 1. Permission Check (Only Student of this session)
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not student_profile:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Student profile not found")
        
        # Check if student is in this session
        await session.fetch_all_links()
        is_student_of_session = any(s.id == student_profile.id for s in session.students)
        if not is_student_of_session:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only students of this session can provide feedback.")

        # 2. Find or create feedback record
        feedback = await SessionFeedback.find_one(
            SessionFeedback.session.id == session.id,
            SessionFeedback.student.id == student_profile.id
        )
        
        if not feedback:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Feedback record not found. Should be auto-created when session completed.")
        
        # 3. Check deadline
        now = datetime.now()
        if now > feedback.feedback_deadline:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Feedback deadline has passed (1 week after session end).")
        
        # 4. Update feedback (save changes, status remains PENDING until deadline)
        if payload.rating is not None:
            feedback.rating = payload.rating
        
        if payload.comment is not None:
            feedback.comment = payload.comment
        
        # Keep status as PENDING - user can edit until deadline
        feedback.updated_at = datetime.now()
        await feedback.save()

        session_info = await FeedbackService._build_session_info(session)
        can_edit = now < feedback.feedback_deadline
        
        return FeedbackResponse(
            id=str(feedback.id),
            session=session_info,
            rating=feedback.rating,
            comment=feedback.comment,
            status=feedback.status.value,
            feedback_deadline=feedback.feedback_deadline,
            created_at=feedback.created_at,
            updated_at=feedback.updated_at,
            can_edit=can_edit
        )

    # ==========================================
    # 4. AUTO-CREATE FEEDBACK RECORDS
    # ==========================================
    @staticmethod
    async def create_feedback_records_for_session(session: TutorSession):
        """
        Auto-create feedback records when session becomes COMPLETED.
        Called by session service when marking session as completed.
        """
        # Create one feedback record per student
        for student_link in session.students:
            student = await student_link.fetch()
            
            # Check if feedback already exists
            existing = await SessionFeedback.find_one(
                SessionFeedback.session.id == session.id,
                SessionFeedback.student.id == student.id
            )
            
            if not existing:
                feedback = SessionFeedback(
                    session=session,
                    student=student,
                    tutor=session.tutor,
                    status=FeedbackStatus.PENDING,
                    feedback_deadline=session.end_time + timedelta(days=7)
                )
                await feedback.save()

    # ==========================================
    # 5. AUTO-FINALIZE EXPIRED FEEDBACKS (Cron Job)
    # ==========================================
    @staticmethod
    async def auto_skip_expired_feedbacks():
        """
        Finalize all PENDING feedbacks when deadline passed:
        - If has rating: Mark as SUBMITTED
        - If no rating: Mark as SKIPPED
        - Recalculates stats for affected tutors
        Should be called by a cron job hourly.
        """
        now = datetime.now()
        
        expired_feedbacks = await SessionFeedback.find(
            SessionFeedback.status == FeedbackStatus.PENDING,
            SessionFeedback.feedback_deadline < now
        ).to_list()
        
        if not expired_feedbacks:
            return 0
        
        # Track tutors that need stats update
        affected_tutors = set()
        
        finalized_count = 0
        for feedback in expired_feedbacks:
            await feedback.fetch_all_links()
            
            # Mark as SUBMITTED or SKIPPED based on whether rating was provided
            if feedback.rating is not None:
                feedback.status = FeedbackStatus.SUBMITTED
                affected_tutors.add(feedback.tutor.id)
            else:
                feedback.status = FeedbackStatus.SKIPPED
            
            feedback.updated_at = now
            await feedback.save()
            finalized_count += 1
        
        # Recalculate stats for all affected tutors
        from app.services.tutor_service import TutorService
        for tutor_id in affected_tutors:
            await TutorService.recalculate_tutor_stats(tutor_id)
        
        return finalized_count

    # ==========================================
    # OLD METHODS (Keep for compatibility)
    # ==========================================
    @staticmethod
    async def create_feedback(session_id: str, user: User, payload: FeedbackCreateRequest) -> FeedbackResponse:
        """DEPRECATED: Use submit_or_update_feedback instead"""
        return await FeedbackService.submit_or_update_feedback(
            session_id, 
            user, 
            FeedbackUpdateRequest(rating=payload.rating, comment=payload.comment)
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