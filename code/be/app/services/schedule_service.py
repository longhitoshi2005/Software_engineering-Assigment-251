from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import HTTPException, status
from beanie import PydanticObjectId
from beanie.operators import In

# Models
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile
from app.models.internal.availability import AvailabilitySlot
from app.models.internal.session import TutorSession, SessionStatus, NegotiationProposal, StudentParticipation, ParticipationStatus
from app.models.internal.notification import NotificationType
from app.models.internal.feedback import SessionFeedback
from app.models.external.course import Course
from app.models.enums.role import UserRole

# Schemas
from app.models.schemas.schedule import (
    AvailabilityCreateRequest, 
    AvailabilityResponse,
    BookingRequest,
    SessionResponse,
    SessionConfirmRequest, 
    NegotiationCreateRequest,
    NegotiationResponse
)

# Services
from app.services.notification_service import NotificationService


class ScheduleService:
    """
    Service for managing tutor availability slots and tutoring session lifecycle.
    Implements slot splitting, negotiation workflow, and state machine transitions.
    """

    # ==========================================
    # 0. HELPER: OVERLAP CHECK
    # ==========================================
    @staticmethod
    async def _check_overlap(
        tutor_id: PydanticObjectId, 
        start: datetime, 
        end: datetime, 
        exclude_slot_id: PydanticObjectId = None
    ):
        """
        Ensures the Tutor is not double-booked in Availability or Confirmed Sessions.
        
        Args:
            tutor_id: The tutor's profile ID
            start: Start time of the time range to check
            end: End time of the time range to check
            exclude_slot_id: Optional slot ID to exclude from overlap check
            
        Raises:
            HTTPException: If overlap is detected
        """
        # Check availability slots
        slot_query = [
            AvailabilitySlot.tutor.id == tutor_id,
            AvailabilitySlot.start_time < end,
            AvailabilitySlot.end_time > start
        ]
        if exclude_slot_id:
            slot_query.append(AvailabilitySlot.id != exclude_slot_id)
            
        overlap_slot = await AvailabilitySlot.find_one(*slot_query)
        if overlap_slot:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Time overlaps with an existing availability slot."
            )

        # Check existing sessions (block during negotiation too)
        overlap_session = await TutorSession.find_one(
            TutorSession.tutor.id == tutor_id,
            In(TutorSession.status, [
                SessionStatus.CONFIRMED, 
                SessionStatus.WAITING_FOR_TUTOR, 
                SessionStatus.WAITING_FOR_STUDENT
            ]),
            TutorSession.start_time < end,
            TutorSession.end_time > start
        )
        if overlap_session:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Time overlaps with an existing session."
            )

    # ==========================================
    # 1. AVAILABILITY SLOT MANAGEMENT
    # ==========================================
    @staticmethod
    async def _split_availability_slot(slot: AvailabilitySlot, session: TutorSession):
        """
        Implements Slot Splitting Logic:
        Deletes the original slot and creates remainder slots before/after the session.
        
        Business Rule: Cost of Commitment - Once split, the session time is consumed.
        No restoration occurs on cancellation/rejection.
        
        Args:
            slot: The original availability slot to split
            session: The session that consumes part of the slot
        """
        # Delete original slot (it's now consumed)
        await slot.delete()
        
        # Create remainder slot BEFORE session (if exists)
        if slot.start_time < session.start_time:
            before_slot = AvailabilitySlot(
                tutor=slot.tutor,
                start_time=slot.start_time,
                end_time=session.start_time,
                is_booked=False
            )
            await before_slot.save()

        # Create remainder slot AFTER session (if exists)
        if slot.end_time > session.end_time:
            after_slot = AvailabilitySlot(
                tutor=slot.tutor,
                start_time=session.end_time,
                end_time=slot.end_time,
                is_booked=False
            )
            await after_slot.save()

    @staticmethod
    async def create_slot(user: User, payload: AvailabilityCreateRequest) -> AvailabilityResponse:
        """
        Creates a new availability slot for a tutor.
        
        Args:
            user: The authenticated tutor user
            payload: Slot creation request data
            
        Returns:
            AvailabilityResponse with created slot details
            
        Raises:
            HTTPException: If validation fails or overlap detected
        """
        tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        if not tutor_profile:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "User is not a Tutor"
            )

        if payload.start_time >= payload.end_time:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Start time must be before End time"
            )
        
        await ScheduleService._check_overlap(
            tutor_profile.id, 
            payload.start_time, 
            payload.end_time
        )

        slot = AvailabilitySlot(
            tutor=tutor_profile,
            start_time=payload.start_time,
            end_time=payload.end_time,
            allowed_modes=payload.allowed_modes,
            is_booked=False
        )
        await slot.save()
        
        return AvailabilityResponse(
            id=str(slot.id),
            tutor_id=str(tutor_profile.id),
            start_time=slot.start_time,
            end_time=slot.end_time,
            allowed_modes=slot.allowed_modes,
            is_booked=slot.is_booked
        )
    
    @staticmethod
    async def get_slots(tutor_id: str, current_user: User = None) -> List[AvailabilityResponse]:
        """
        Retrieves all available (unbooked) slots for a tutor.
        
        Args:
            tutor_id: The tutor's profile ID or 'me' for current user
            current_user: The authenticated user (optional, required if tutor_id is 'me')
            
        Returns:
            List of available slots sorted by start time
        """
        # Handle 'me' as a special case
        if tutor_id == "me":
            if not current_user:
                from fastapi import HTTPException, status as http_status
                raise HTTPException(http_status.HTTP_401_UNAUTHORIZED, "Authentication required")
            
            # Get tutor profile from current user
            from app.models.internal.tutor_profile import TutorProfile
            tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == current_user.id)
            if not tutor_profile:
                from fastapi import HTTPException, status as http_status
                raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Tutor profile not found")
            
            tutor_id = str(tutor_profile.id)
        
        slots = await AvailabilitySlot.find(
            AvailabilitySlot.tutor.id == PydanticObjectId(tutor_id),
            AvailabilitySlot.is_booked == False 
        ).sort("+start_time").to_list()
        
        return [
            AvailabilityResponse(
                id=str(s.id),
                tutor_id=tutor_id,
                start_time=s.start_time,
                end_time=s.end_time,
                allowed_modes=s.allowed_modes,
                is_booked=s.is_booked
            ) for s in slots
        ]

    # ==========================================
    # 2. SESSION BOOKING & NEGOTIATION
    # ==========================================
    @staticmethod
    async def create_booking_request(student_user: User, payload: BookingRequest) -> SessionResponse:
        """
        Creates a new booking request from student.
        Initial status: WAITING_FOR_TUTOR
        
        Args:
            student_user: The authenticated student user
            payload: Booking request details
            
        Returns:
            SessionResponse with created session details
            
        Raises:
            HTTPException: If tutor/course not found or time slot unavailable
        """
        # Get or create student profile
        student_profile = await StudentProfile.find_one(
            StudentProfile.user.id == student_user.id
        )
        if not student_profile:
            student_profile = StudentProfile(user=student_user)
            await student_profile.save()

        # Validate tutor and course exist
        tutor = await TutorProfile.get(payload.tutor_id)
        course = await Course.find_one(Course.code == payload.course_code)
        if not tutor or not course:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, 
                "Tutor or Course not found"
            )

        # Validate availability slot covers requested time and mode
        valid_slot = await AvailabilitySlot.find_one(
            AvailabilitySlot.tutor.id == tutor.id,
            AvailabilitySlot.start_time <= payload.start_time,
            AvailabilitySlot.end_time >= payload.end_time,
            AvailabilitySlot.is_booked == False,
            {"allowed_modes": payload.mode}  # Check if mode is supported
        )
        
        if not valid_slot:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Tutor is not available at this time or doesn't support the requested location mode."
            )

        # Create session with student's preferences
        session = TutorSession(
            tutor=tutor,
            students=[student_profile], 
            course=course,
            start_time=payload.start_time,
            end_time=payload.end_time,
            mode=payload.mode,
            location=payload.location,
            session_request_type=payload.session_request_type,
            max_capacity=payload.requested_max_capacity or 1,  # Student's requested capacity
            note=payload.note,
            status=SessionStatus.WAITING_FOR_TUTOR
        )
        await session.save()
        
        return await ScheduleService._map_session_response(session, student_user)

    @staticmethod
    async def propose_negotiation(
        session_id: str, 
        user: User, 
        payload: NegotiationCreateRequest
    ) -> SessionResponse:
        """
        Tutor proposes changes to the booking request (counter-offer).
        Tutor can override time, location, capacity, and publicity settings.
        
        State Transition: WAITING_FOR_TUTOR -> WAITING_FOR_STUDENT
        
        Args:
            session_id: The session ID
            user: The authenticated tutor user
            payload: Proposed changes
            
        Returns:
            SessionResponse with updated proposal
            
        Raises:
            HTTPException: If invalid state or permissions
        """
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, 
                "Session not found"
            )

        # Permission check: Must be the assigned tutor
        tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        if not tutor_profile or session.tutor.ref.id != tutor_profile.id:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, 
                "Only the assigned Tutor can propose changes."
            )

        # State check: Can only counter-offer initial requests
        if session.status != SessionStatus.WAITING_FOR_TUTOR:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Session is not in the initial request state."
            )

        # Validate proposed time doesn't overlap with confirmed sessions
        proposed_start = payload.new_start_time or session.start_time
        proposed_end = payload.new_end_time or session.end_time
        
        # Check if tutor has any session (any status except REJECTED/CANCELLED) in that time
        overlap_check = await TutorSession.find_one(
            TutorSession.tutor.id == session.tutor.ref.id,
            TutorSession.id != session.id,
            TutorSession.status.nin([SessionStatus.REJECTED, SessionStatus.CANCELLED]),
            TutorSession.start_time < proposed_end,
            TutorSession.end_time > proposed_start
        )
        if overlap_check:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Proposed time overlaps with another session."
            )

        # Create proposal with ALL fields (including capacity/publicity override)
        session.proposal = NegotiationProposal(
            new_topic=payload.new_topic,
            new_start_time=payload.new_start_time,
            new_end_time=payload.new_end_time,
            new_mode=payload.new_mode,
            new_location=payload.new_location,
            tutor_message=payload.message,
            new_max_capacity=payload.new_max_capacity,  # Tutor's proposed capacity
            new_is_public=payload.new_is_public          # Tutor's proposed publicity
        )
        
        # Transition state
        session.status = SessionStatus.WAITING_FOR_STUDENT
        await session.save()
        
        # Fetch all links before sending notification
        await session.fetch_all_links()
        
        # NOTIFICATION: Notify student about counter-offer
        student = session.students[0]
        await student.fetch_link(StudentProfile.user)
        await NotificationService.create_system_notification(
            receiver_user=student.user,
            n_type=NotificationType.NEGOTIATION_PROPOSAL,
            session=session,
            extra_message=f"The tutor has proposed changes to your session request. Message: {payload.message}"
        )
        
        return await ScheduleService._map_session_response(session, user)

    @staticmethod
    async def resolve_negotiation(
        session_id: str, 
        user: User, 
        action: str, 
        confirm_details: Optional[SessionConfirmRequest] = None
    ) -> SessionResponse:
        """
        Student resolves tutor's counter-proposal (accept or reject).
        
        ACCEPT: Applies slot splitting, updates session with proposal + confirmation details
        State Transition: WAITING_FOR_STUDENT -> CONFIRMED
        
        REJECT: Marks session as rejected
        State Transition: WAITING_FOR_STUDENT -> REJECTED
        
        Args:
            session_id: The session ID
            user: The authenticated student user
            action: "accept" or "reject"
            confirm_details: Final capacity/link details (required for accept)
            
        Returns:
            SessionResponse with updated session
            
        Raises:
            HTTPException: If invalid state, permissions, or missing details
        """
        session = await TutorSession.get(session_id)
        if not session or session.status != SessionStatus.WAITING_FOR_STUDENT:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "No active negotiation to resolve."
            )

        # Permission check: Must be the requesting student
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not student_profile or session.students[0].ref.id != student_profile.id:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, 
                "Only the requesting Student can resolve this proposal."
            )

        # ===== ACCEPT LOGIC =====
        if action == "accept":
            if not confirm_details:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Accepting a proposal requires capacity and link details."
                )
            
            # Determine final time (from proposal or original)
            final_start = session.proposal.new_start_time or session.start_time
            final_end = session.proposal.new_end_time or session.end_time

            # Update session time to final negotiated values
            session.start_time = final_start
            session.end_time = final_end
            
            # Remove any availability slots that overlap with the new time
            overlapping_slots = await AvailabilitySlot.find(
                AvailabilitySlot.tutor.id == session.tutor.ref.id,
                AvailabilitySlot.start_time < final_end,
                AvailabilitySlot.end_time > final_start,
                AvailabilitySlot.is_booked == False
            ).to_list()
            
            for slot in overlapping_slots:
                await ScheduleService._split_availability_slot(slot, session)

            # Apply topic change from proposal
            if session.proposal.new_topic:
                session.topic = session.proposal.new_topic

            # Apply location/mode changes from proposal
            if session.proposal.new_mode is not None:
                session.mode = session.proposal.new_mode
            if session.proposal.new_location:
                session.location = session.proposal.new_location
            
            # Apply capacity/publicity from confirmation details (final agreed values)
            if not session.topic and confirm_details.topic:
                session.topic = confirm_details.topic  # Use confirmation topic if not set by proposal
            session.max_capacity = confirm_details.max_capacity
            session.is_public = confirm_details.is_public
            if confirm_details.final_location_link:
                session.location = confirm_details.final_location_link
            
            # Finalize session
            session.status = SessionStatus.CONFIRMED
            session.proposal = None  # Clear proposal

        # ===== REJECT LOGIC =====
        elif action == "reject":
            session.status = SessionStatus.REJECTED
            session.cancelled_by = "STUDENT"
            # NOTE: NO slot restoration (Cost of Commitment)
        
        else:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Invalid resolution action"
            )

        await session.save()
        return await ScheduleService._map_session_response(session, user)

    # ==========================================
    # 3. SESSION STATE ACTIONS
    # ==========================================
    @staticmethod
    async def handle_session_action(
        session_id: str, 
        user: User, 
        action: str, 
        reason: str = None, 
        confirm_details: Optional[SessionConfirmRequest] = None
    ) -> SessionResponse:
        """
        Handles session state transitions: confirm, reject, cancel, complete.
        
        Actions:
        - confirm: Tutor accepts initial request -> CONFIRMED (with slot splitting)
        - reject: Tutor declines initial request -> REJECTED
        - cancel: Tutor/Student cancels confirmed session -> CANCELLED
        - complete: Tutor/Admin marks session complete -> COMPLETED
        
        Args:
            session_id: The session ID
            user: The authenticated user
            action: Action type (confirm/reject/cancel/complete)
            reason: Optional reason for reject/cancel
            confirm_details: Required for confirm action
            
        Returns:
            SessionResponse with updated session
            
        Raises:
            HTTPException: If invalid state, permissions, or missing details
        """
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, 
                "Session not found"
            )
            
        # Get user profiles for permission checks
        tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        
        is_tutor = tutor_profile and session.tutor.ref.id == tutor_profile.id
        is_student = student_profile and any(
            s.ref.id == student_profile.id for s in session.students
        )

        # ===== CONFIRM ACTION =====
        if action == "confirm":
            if not is_tutor or session.status != SessionStatus.WAITING_FOR_TUTOR:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Invalid state or permissions for confirmation."
                )
            if not confirm_details:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Confirmation requires capacity and link details."
                )
            
            # Find and split availability slot
            original_slot = await AvailabilitySlot.find_one(
                AvailabilitySlot.tutor.id == session.tutor.ref.id,
                AvailabilitySlot.start_time <= session.start_time,
                AvailabilitySlot.end_time >= session.end_time,
                AvailabilitySlot.is_booked == False
            )
            if not original_slot:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Availability slot not found (already booked or deleted)."
                )

            await ScheduleService._split_availability_slot(original_slot, session)
            
            # Apply final capacity/publicity/location and topic
            session.status = SessionStatus.CONFIRMED
            session.topic = confirm_details.topic  # Tutor sets the topic when confirming
            session.max_capacity = confirm_details.max_capacity
            session.is_public = confirm_details.is_public
            if confirm_details.final_location_link:
                session.location = confirm_details.final_location_link
            
            # Fetch all links before sending notifications
            await session.fetch_all_links()
            
            # NOTIFICATION: Notify student that session is confirmed
            student = session.students[0]
            await student.fetch_link(StudentProfile.user)
            await NotificationService.create_system_notification(
                receiver_user=student.user,
                n_type=NotificationType.SESSION_CONFIRMED,
                session=session,
                extra_message="Your session has been confirmed by the tutor."
            )
            
            # NOTIFICATION: Also notify tutor
            tutor = session.tutor
            await tutor.fetch_link(TutorProfile.user)
            await NotificationService.create_system_notification(
                receiver_user=tutor.user,
                n_type=NotificationType.SESSION_CONFIRMED,
                session=session,
                extra_message="You have confirmed a new session."
            )
        
        # ===== REJECT ACTION =====
        elif action == "reject":
            if not is_tutor or session.status != SessionStatus.WAITING_FOR_TUTOR:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Invalid state or permissions for rejection."
                )
            session.status = SessionStatus.REJECTED
            session.cancelled_by = "TUTOR"
            session.cancellation_reason = reason or "Tutor declined request."
            # NOTE: NO slot restoration (Cost of Commitment)
            
            # Fetch all links before sending notification
            await session.fetch_all_links()
            
            # NOTIFICATION: Notify student that session was rejected
            student = session.students[0]
            await student.fetch_link(StudentProfile.user)
            await NotificationService.create_system_notification(
                receiver_user=student.user,
                n_type=NotificationType.SESSION_REJECTED,
                session=session,
                extra_message=f"Reason: {session.cancellation_reason}"
            )
            
        # ===== CANCEL ACTION =====
        elif action == "cancel":
            if session.status not in [SessionStatus.CONFIRMED, SessionStatus.WAITING_FOR_STUDENT]:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Session cannot be cancelled from current state."
                )
            
            # Calculate if cancellation is late (< 2 hours before start)
            time_to_start = (session.start_time - datetime.now(timezone.utc)).total_seconds() / 3600
            is_late_cancellation = time_to_start < 2

            if is_tutor:
                if is_late_cancellation:
                    # TODO: Implement penalty logic (decrease tutor score)
                    print("WARNING: TUTOR LATE CANCEL!")
                session.status = SessionStatus.CANCELLED
                session.cancelled_by = "TUTOR"
                
                # NOTIFICATION: Notify all students about cancellation
                for student_link in session.students:
                    student = await student_link.fetch_link(StudentProfile.user)
                    await NotificationService.create_system_notification(
                        receiver_user=student.user,
                        n_type=NotificationType.SESSION_CANCELLED,
                        session=session,
                        extra_message=f"The tutor has cancelled the session. Reason: {reason or 'Not specified'}"
                    )
                
            elif is_student:
                if is_late_cancellation:
                    # TODO: Implement penalty logic (decrease student score)
                    print("WARNING: STUDENT LATE CANCEL!")
                
                # Remove student from session
                session.students = [
                    s for s in session.students if s.ref.id != student_profile.id
                ]

                # If no students remain, cancel session entirely
                if not session.students:
                    session.status = SessionStatus.CANCELLED
                    session.cancelled_by = "STUDENT"
                    
                    # Fetch all links before sending notification
                    await session.fetch_all_links()
                    
                    # NOTIFICATION: Notify tutor about cancellation
                    tutor = session.tutor
                    await tutor.fetch_link(TutorProfile.user)
                    await NotificationService.create_system_notification(
                        receiver_user=tutor.user,
                        n_type=NotificationType.SESSION_CANCELLED,
                        session=session,
                        extra_message=f"The student has cancelled the session. Reason: {reason or 'Not specified'}"
                    )
                else:
                    # Fetch all links before sending notification
                    await session.fetch_all_links()
                    
                    # NOTIFICATION: Notify tutor that a student left (but session continues)
                    tutor = session.tutor
                    await tutor.fetch_link(TutorProfile.user)
                    await NotificationService.create_system_notification(
                        receiver_user=tutor.user,
                        n_type=NotificationType.SESSION_CANCELLED,
                        session=session,
                        extra_message="A student has left the group session."
                    )
            
            session.cancellation_reason = reason or "User cancelled."
            # NOTE: NO slot restoration (Cost of Commitment)

        # ===== COMPLETE ACTION =====
        elif action == "complete":
            if not is_tutor and not any(r in user.roles for r in [UserRole.ADMIN, UserRole.DEPT_CHAIR]):
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN, 
                    "Only Tutor or Manager can mark as complete."
                )
            if session.status != SessionStatus.CONFIRMED:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Session must be CONFIRMED before completing."
                )
            session.status = SessionStatus.COMPLETED
            
            # Auto-create feedback records for all students
            from app.services.feedback_service import FeedbackService
            await FeedbackService.create_feedback_records_for_session(session)
            
        else:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Invalid action"
            )

        await session.save()
        return await ScheduleService._map_session_response(session, user)

    # ==========================================
    # 4. SESSION RETRIEVAL
    # ==========================================
    @staticmethod
    async def get_user_sessions(user: User, role_context: Optional[str] = None) -> List[SessionResponse]:
        """
        Retrieves all sessions relevant to the user based on role context.
        
        Args:
            user: The authenticated user
            role_context: Optional "student" or "tutor" to specify which sessions to return
            
        Returns:
            List of sessions sorted by start time (descending)
        """
        sessions = []
        
        # If role context is explicitly specified, use it
        if role_context == "student":
            student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
            if student_profile:
                sessions = await TutorSession.find(
                    TutorSession.students.id == student_profile.id
                ).sort("-start_time").to_list()
        elif role_context == "tutor":
            tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
            if tutor_profile:
                sessions = await TutorSession.find(
                    TutorSession.tutor.id == tutor_profile.id
                ).sort("-start_time").to_list()
        else:
            # Default: Check for student profile first (prioritize student view)
            student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
            if student_profile:
                sessions = await TutorSession.find(
                    TutorSession.students.id == student_profile.id
                ).sort("-start_time").to_list()
            else:
                # Fall back to tutor sessions if no student profile
                tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
                if tutor_profile:
                    sessions = await TutorSession.find(
                        TutorSession.tutor.id == tutor_profile.id
                    ).sort("-start_time").to_list()
        
        return [await ScheduleService._map_session_response(s, user) for s in sessions]

    @staticmethod
    async def get_session_detail(session_id: str, user: User) -> SessionResponse:
        """
        Retrieves detailed information for a specific session.
        
        Args:
            session_id: The session ID
            user: The authenticated user
            
        Returns:
            SessionResponse with full session details
            
        Raises:
            HTTPException: If session not found
        """
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, 
                "Session not found"
            )
        
        return await ScheduleService._map_session_response(session, user)

    @staticmethod
    async def respond_to_invite(session_id: str, user: User, action: str):
        """
        Student responds to a private group session invitation.
        
        Args:
            session_id: The session ID
            user: The authenticated student user
            action: "accept" or "decline"
            
        Raises:
            HTTPException: If invalid action or session state
        """
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, 
                "Session not found"
            )
        
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not student_profile:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, 
                "Student profile not found"
            )
        
        if action == "accept":
            # Check capacity
            if len(session.students) >= session.max_capacity:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Session is full"
                )
            
            # Add student to session
            if student_profile not in session.students:
                session.students.append(student_profile)
                await session.save()
                
        elif action == "decline":
            # Simply do nothing (student doesn't join)
            pass
        else:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Invalid action"
            )

    # ==========================================
    # 5. MAPPER (Optimized - DRY Principle)
    # ==========================================
    @staticmethod
    async def _map_session_response(session: TutorSession, user: User) -> SessionResponse:
        """
        Maps internal TutorSession model to SessionResponse schema.
        Optimized to avoid redundant link fetching by using snapshot data from User model.
        
        Args:
            session: The TutorSession document
            user: The current authenticated user
            
        Returns:
            SessionResponse with all necessary fields populated
        """
        # Fetch all links efficiently
        await session.fetch_all_links()
        
        tutor = session.tutor
        await tutor.fetch_link(TutorProfile.user)
        
        # Map negotiation proposal (with ALL fields including capacity/publicity)
        proposal_res = None
        if session.proposal:
            proposal_res = NegotiationResponse(
                new_start_time=session.proposal.new_start_time,
                new_end_time=session.proposal.new_end_time,
                new_mode=session.proposal.new_mode,
                new_location=session.proposal.new_location,
                tutor_message=session.proposal.tutor_message,
                new_max_capacity=session.proposal.new_max_capacity,
                new_is_public=session.proposal.new_is_public
            )
        
        # Get primary student (first in list) - handle case where all students left
        student_id = None
        student_name = None
        
        if len(session.students) > 0:
            student = session.students[0] 
            await student.fetch_link(StudentProfile.user)
            await student.user.fetch_link(User.sso_info)
            student_id = student.user.sso_info.identity_id
            student_name = student.user.full_name
        
        # Get feedback status for current user (only if user is a student)
        feedback_status = None
        is_requester = None
        
        if UserRole.STUDENT in user.roles:
            # Find student profile for current user
            student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
            if student_profile:
                # Check if this student is part of the session
                student_ids = [str(s.id) for s in session.students]
                if str(student_profile.id) in student_ids:
                    # Check if this student is the requester (first student)
                    if session.is_public and len(session.students) > 0:
                        is_requester = str(session.students[0].id) == str(student_profile.id)
                    
                    # Query feedback for this session and student
                    feedback = await SessionFeedback.find_one(
                        SessionFeedback.session.id == session.id,
                        SessionFeedback.student.id == student_profile.id
                    )
                    if feedback:
                        feedback_status = feedback.status.value
        
        # Build students list with all enrolled students and their participation status
        students_list = []
        
        # If we have participation tracking, use it; otherwise fall back to students list
        if session.student_participations:
            for participation in session.student_participations:
                await participation.student.fetch_link(StudentProfile.user)
                await participation.student.user.fetch_link(User.sso_info)
                students_list.append({
                    "id": str(participation.student.id),
                    "student_id": participation.student.user.sso_info.identity_id,
                    "full_name": participation.student.user.full_name,
                    "status": participation.status.value
                })
        else:
            # Legacy sessions without participation tracking
            for student_link in session.students:
                await student_link.fetch_link(StudentProfile.user)
                await student_link.user.fetch_link(User.sso_info)
                students_list.append({
                    "id": str(student_link.id),
                    "student_id": student_link.user.sso_info.identity_id,
                    "full_name": student_link.user.full_name,
                    "status": "CONFIRMED"  # Default for legacy data
                })
        
        # Use snapshot data from User model (DRY - no redundant fetching)
        return SessionResponse(
            id=str(session.id),
            tutor_id=str(tutor.id),
            tutor_name=tutor.user.full_name,  # Snapshot data
            student_id=student_id,  # MSSV from SSO (None if no students)
            student_name=student_name,  # Snapshot data (None if no students)
            course_code=session.course.code,
            course_name=session.course.name,
            topic=session.topic,
            start_time=session.start_time,
            end_time=session.end_time,
            mode=session.mode,
            location=session.location,
            status=session.status,
            proposal=proposal_res,
            created_at=session.created_at,
            # Session structure fields
            session_request_type=session.session_request_type,
            max_capacity=session.max_capacity,
            is_public=session.is_public,
            is_requester=is_requester,
            # All students in session
            students=students_list,
            # Feedback status
            feedback_status=feedback_status
        )
    
    # ==========================================
    # 9. UPDATE SESSION LOCATION
    # ==========================================
    
    @staticmethod
    async def update_session_location(session_id: str, user: User, location: str) -> SessionResponse:
        """
        Updates the location/meeting link for a session.
        Only the tutor can update this, and only before the session starts.
        """
        # 1. Get session
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        
        # 2. Verify user is the tutor
        await session.fetch_link(TutorSession.tutor)
        tutor = session.tutor
        await tutor.fetch_link(TutorProfile.user)
        
        if str(tutor.user.id) != str(user.id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the tutor can update session location")
        
        # 3. Check if session has already started
        now = datetime.now(timezone.utc)
        if session.start_time <= now:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot update location after session has started")
        
        # 4. Update location
        session.location = location
        await session.save()
        
        # 5. Return updated session
        return await ScheduleService._map_session_response(session, user)
    
    # ==========================================
    # 10. UPDATE SESSION TOPIC
    # ==========================================
    
    @staticmethod
    async def update_session_topic(session_id: str, user: User, topic: str) -> SessionResponse:
        """
        Updates the topic/title for a session.
        Only the tutor can update this.
        """
        # 1. Get session
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        
        # 2. Verify user is the tutor
        await session.fetch_link(TutorSession.tutor)
        tutor = session.tutor
        await tutor.fetch_link(TutorProfile.user)
        
        if str(tutor.user.id) != str(user.id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the tutor can update session topic")
        
        # 3. Update topic
        session.topic = topic
        await session.save()
        
        # 4. Return updated session
        return await ScheduleService._map_session_response(session, user)
    
    # ==========================================
    # 11. UPDATE STUDENT PARTICIPATION STATUS
    # ==========================================
    
    @staticmethod
    async def update_student_participation(
        session_id: str, 
        student_id: str, 
        user: User, 
        status: str
    ) -> SessionResponse:
        """
        Updates a student's participation status for a session.
        Tutor can update status from 30 minutes before session start to 1 day after.
        
        Valid statuses: CONFIRMED, ATTENDED, ABSENT, CANCELLED
        """
        from app.models.internal.session import ParticipationStatus
        
        # 1. Validate status
        try:
            participation_status = ParticipationStatus(status)
        except ValueError:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join([s.value for s in ParticipationStatus])}"
            )
        
        # 2. Get session
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        
        # 3. Verify user is the tutor
        await session.fetch_link(TutorSession.tutor)
        tutor = session.tutor
        await tutor.fetch_link(TutorProfile.user)
        
        if str(tutor.user.id) != str(user.id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the tutor can update participation status")
        
        # 4. Check time window (30 min before to 1 day after session start)
        now = datetime.now(timezone.utc)
        time_before_start = timedelta(minutes=30)
        time_after_start = timedelta(days=1)
        
        earliest_allowed = session.start_time - time_before_start
        latest_allowed = session.start_time + time_after_start
        
        if now < earliest_allowed or now > latest_allowed:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail="Participation status can only be updated from 30 minutes before to 1 day after session start time"
            )
        
        # 5. Find and update student participation
        if not session.student_participations:
            # Initialize participations from students list
            session.student_participations = []
            for student_link in session.students:
                session.student_participations.append(
                    StudentParticipation(student=student_link, status=ParticipationStatus.CONFIRMED)
                )
        
        # Find the student
        student_found = False
        for participation in session.student_participations:
            if str(participation.student.ref.id) == student_id:
                participation.status = participation_status
                student_found = True
                break
        
        if not student_found:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found in this session")
        
        # 6. Save and return
        await session.save()
        return await ScheduleService._map_session_response(session, user)

    # ==========================================
    # PUBLIC SESSIONS DISCOVERY
    # ==========================================
    @staticmethod
    async def get_public_sessions(
        course_code: Optional[str] = None,
        tutor_name: Optional[str] = None,
        limit: int = 20,
        current_user: Optional[User] = None
    ) -> List[SessionResponse]:
        """
        [Student] Get list of public sessions with available slots.
        Returns CONFIRMED public sessions that haven't started yet and have capacity.
        If current_user is provided, includes is_joined field.
        """
        # Get student profile if user is provided
        student = None
        if current_user:
            student = await StudentProfile.find_one(StudentProfile.user.id == current_user.id)
        
        # Build query
        query = {
            "is_public": True,
            "status": SessionStatus.CONFIRMED,
            "start_time": {"$gt": datetime.now(timezone.utc)}
        }
        
        # Fetch sessions
        sessions = await TutorSession.find(query).sort("+start_time").limit(limit).to_list()
        
        # Filter sessions with available slots and apply filters
        result = []
        for session in sessions:
            # Apply course filter
            if course_code:
                await session.fetch_link(TutorSession.course)
                if course_code.lower() not in session.course.code.lower():
                    continue
            
            # Apply tutor name filter
            if tutor_name:
                await session.fetch_link(TutorSession.tutor)
                await session.tutor.fetch_link(TutorProfile.user)
                if tutor_name.lower() not in session.tutor.user.full_name.lower():
                    continue
            
            # Map to response
            response = await ScheduleService._map_public_session_response(session, student)
            result.append(response)
        
        return result
    
    @staticmethod
    async def _map_public_session_response(session: TutorSession, student: Optional[StudentProfile] = None) -> SessionResponse:
        """Map a public session to response format with tutor and course details."""
        # Fetch related data
        await session.fetch_link(TutorSession.tutor)
        await session.tutor.fetch_link(TutorProfile.user)
        await session.fetch_link(TutorSession.course)
        
        # Check if student has joined
        is_joined = False
        if student:
            await session.fetch_all_links()
            student_ids = [s.id for s in session.students]
            is_joined = student.id in student_ids
        
        # Build response
        return SessionResponse(
            id=str(session.id),
            tutor_id=str(session.tutor.id),
            tutor_name=session.tutor.user.full_name,
            course_code=session.course.code,
            course_name=session.course.name,
            topic=session.topic,
            start_time=session.start_time,
            end_time=session.end_time,
            mode=session.mode.value,
            location=session.location,
            status=session.status.value,
            created_at=session.created_at,
            session_request_type=session.session_request_type.value,
            max_capacity=session.max_capacity,
            is_public=session.is_public,
            available_slots=session.max_capacity - len(session.students),
            students=None,  # Don't expose student list for public sessions
            student_id=None,  # Public sessions don't have a single initiator
            student_name=None,
            is_joined=is_joined
        )

    @staticmethod
    async def join_public_session(session_id: str, user: User) -> SessionResponse:
        """
        [Student] Join a public session if it has available slots.
        """
        # 1. Get student profile
        student = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not student:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Student profile not found")
        
        # 2. Get session
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        
        # 3. Verify session is public and confirmed
        if not session.is_public:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "This is not a public session")
        
        if session.status != SessionStatus.CONFIRMED:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Session is not confirmed yet")
        
        # 4. Check if session hasn't started
        # Make start_time timezone-aware for comparison (MongoDB stores as UTC)
        session_start = session.start_time.replace(tzinfo=timezone.utc) if session.start_time.tzinfo is None else session.start_time
        if session_start <= datetime.now(timezone.utc):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Session has already started")
        
        # 5. Check if student is already enrolled
        # Fetch students to compare IDs properly
        await session.fetch_all_links()
        student_ids = [s.id for s in session.students]
        if student.id in student_ids:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "You are already enrolled in this session")
        
        # 6. Check available slots
        if len(session.students) >= session.max_capacity:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Session is full")
        
        # 7. Add student to session
        session.students.append(student)
        
        # Initialize participation
        if not session.student_participations:
            session.student_participations = []
        session.student_participations.append(
            StudentParticipation(student=student, status=ParticipationStatus.CONFIRMED)
        )
        
        await session.save()
        
        # 8. Send notification to student
        await NotificationService.create_system_notification(
            receiver_user=user,
            n_type=NotificationType.SESSION_CONFIRMED,
            session=session,
            extra_message="You have successfully joined a public session."
        )
        
        return await ScheduleService._map_session_response(session, user)

    @staticmethod
    async def leave_public_session(session_id: str, user: User) -> dict:
        """
        [Student] Leave a public session before it starts.
        
        Special rules:
        - Requester can leave like any other student (session NOT cancelled unless all students leave)
        - If you leave < 2 hours before start, you're marked as CANCELLED but NOT removed from session
        - Otherwise, you're removed from the session completely
        - Session is only cancelled if all students have left/cancelled OR tutor cancels
        """
        # 1. Get student profile
        student = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not student:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Student profile not found")
        
        # 2. Get session
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        
        # 3. Verify session is public and confirmed
        if not session.is_public:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "This is not a public session")
        
        if session.status != SessionStatus.CONFIRMED:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Session is not confirmed")
        
        # 4. Check if session hasn't started
        session_start = session.start_time.replace(tzinfo=timezone.utc) if session.start_time.tzinfo is None else session.start_time
        current_time = datetime.now(timezone.utc)
        
        if session_start <= current_time:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot leave a session that has already started")
        
        # 5. Check if student is enrolled
        await session.fetch_all_links()
        student_index = -1
        
        for i, s in enumerate(session.students):
            if s.id == student.id:
                student_index = i
                break
        
        if student_index == -1:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "You are not enrolled in this session")
        
        # 6. Check if student is the requester (first student in list)
        is_requester = student_index == 0
        
        # 7. Calculate time until session starts
        hours_until_start = (session_start - current_time).total_seconds() / 3600
        
        # 8. Determine if this is a late leave (<= 2 hours)
        is_late_leave = hours_until_start <= 2
        
        # Initialize participation tracking if not exists
        if not session.student_participations:
            session.student_participations = []
            for student_link in session.students:
                session.student_participations.append(
                    StudentParticipation(student=student_link, status=ParticipationStatus.CONFIRMED)
                )
        
        # Determine action based on requester status and timing
        if is_requester:
            # Requester ALWAYS stays in list with CANCELLED status (regardless of timing)
            for participation in session.student_participations:
                if participation.student.id == student.id:
                    participation.status = ParticipationStatus.CANCELLED
                    break
            
            message = "You are the requester. Your participation has been marked as CANCELLED."
            cancelled_flag = True
            removed_flag = False
            
        elif is_late_leave:
            # Non-requester late leave (<= 2 hours) - mark as CANCELLED, keep in list
            for participation in session.student_participations:
                if participation.student.id == student.id:
                    participation.status = ParticipationStatus.CANCELLED
                    break
            
            message = "You left less than 2 hours before the session. Your participation has been marked as CANCELLED."
            cancelled_flag = True
            removed_flag = False
            
        else:
            # Non-requester early leave (> 2 hours) - REMOVE from list completely
            session.students = [s for s in session.students if s.id != student.id]
            session.student_participations = [
                p for p in session.student_participations 
                if p.student.id != student.id
            ]
            
            message = "You have been removed from the public session."
            cancelled_flag = False
            removed_flag = True
        
        # Check if ALL students have cancelled - if so, cancel the session
        all_cancelled = all(p.status == ParticipationStatus.CANCELLED for p in session.student_participations)
        
        if all_cancelled and len(session.student_participations) > 0:
            session.status = SessionStatus.CANCELLED
            session.cancelled_by = "all_students_cancelled"
            
            # Notify tutor
            await session.fetch_link(TutorSession.tutor)
            await session.tutor.fetch_link(TutorProfile.user)
            await NotificationService.create_system_notification(
                receiver_user=session.tutor.user,
                n_type=NotificationType.SESSION_CANCELLED,
                session=session,
                extra_message="All students have cancelled their participation. The session has been cancelled."
            )
            
            message += " The session has been cancelled as all students have cancelled."
        
        await session.save()
        
        # Notify student
        notification_type = NotificationType.SESSION_CANCELLED if cancelled_flag else NotificationType.SESSION_CONFIRMED
        await NotificationService.create_system_notification(
            receiver_user=user,
            n_type=notification_type,
            session=session,
            extra_message=message
        )
        
        return {
            "message": message,
            "cancelled": cancelled_flag,
            "removed": removed_flag,
            "is_requester": is_requester,
            "late_leave": is_late_leave if not is_requester else None,
            "session_cancelled": all_cancelled if len(session.student_participations) > 0 else False
        }
