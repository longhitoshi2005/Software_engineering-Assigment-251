from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from beanie import PydanticObjectId
from beanie.operators import In

# Models
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile
from app.models.internal.availability import AvailabilitySlot
from app.models.internal.session import TutorSession, SessionStatus, NegotiationProposal
from app.models.internal.notification import NotificationType
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
    async def get_slots(tutor_id: str) -> List[AvailabilityResponse]:
        """
        Retrieves all available (unbooked) slots for a tutor.
        
        Args:
            tutor_id: The tutor's profile ID
            
        Returns:
            List of available slots sorted by start time
        """
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
            status=SessionStatus.WAITING_FOR_TUTOR
        )
        await session.save()
        
        return await ScheduleService._map_session_response(session)

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
        
        overlap_check = await TutorSession.find_one(
            TutorSession.tutor.id == session.tutor.id,
            TutorSession.status == SessionStatus.CONFIRMED,
            TutorSession.start_time < proposed_end,
            TutorSession.end_time > proposed_start
        )
        if overlap_check:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Proposed time overlaps with another confirmed session."
            )

        # Create proposal with ALL fields (including capacity/publicity override)
        session.proposal = NegotiationProposal(
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
        
        # NOTIFICATION: Notify student about counter-offer
        student_user = await session.students[0].fetch_link(StudentProfile.user)
        await NotificationService.create_system_notification(
            receiver_user=student_user.user,
            n_type=NotificationType.BOOKING_REQUEST,
            session=session,
            extra_message=f"The tutor has proposed changes to your session request. Message: {payload.message}"
        )
        
        return await ScheduleService._map_session_response(session)

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
            
            # Find availability slot that covers the final time
            original_slot = await AvailabilitySlot.find_one(
                AvailabilitySlot.tutor.id == session.tutor.id,
                AvailabilitySlot.start_time <= final_start,
                AvailabilitySlot.end_time >= final_end,
                AvailabilitySlot.is_booked == False
            )
            if not original_slot:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "Availability slot not found (already booked or deleted)."
                )

            # Update session time to final negotiated values
            session.start_time = final_start
            session.end_time = final_end

            # Perform slot splitting IMMEDIATELY
            await ScheduleService._split_availability_slot(original_slot, session)

            # Apply location/mode changes from proposal
            if session.proposal.new_mode is not None:
                session.mode = session.proposal.new_mode
            if session.proposal.new_location:
                session.location = session.proposal.new_location
            
            # Apply capacity/publicity from confirmation details (final agreed values)
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
        return await ScheduleService._map_session_response(session)

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
                AvailabilitySlot.tutor.id == session.tutor.id,
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
            
            # Apply final capacity/publicity/location
            session.status = SessionStatus.CONFIRMED
            session.max_capacity = confirm_details.max_capacity
            session.is_public = confirm_details.is_public
            if confirm_details.final_location_link:
                session.location = confirm_details.final_location_link
            
            # NOTIFICATION: Notify student that session is confirmed
            student = await session.students[0].fetch_link(StudentProfile.user)
            await NotificationService.create_system_notification(
                receiver_user=student.user,
                n_type=NotificationType.SESSION_CONFIRMED,
                session=session,
                extra_message="Your session has been confirmed by the tutor."
            )
            
            # NOTIFICATION: Also notify tutor
            tutor_user = await session.tutor.fetch_link(TutorProfile.user)
            await NotificationService.create_system_notification(
                receiver_user=tutor_user.user,
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
            
            # NOTIFICATION: Notify student that session was rejected
            student = await session.students[0].fetch_link(StudentProfile.user)
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
                    
                    # NOTIFICATION: Notify tutor about cancellation
                    tutor_user = await session.tutor.fetch_link(TutorProfile.user)
                    await NotificationService.create_system_notification(
                        receiver_user=tutor_user.user,
                        n_type=NotificationType.SESSION_CANCELLED,
                        session=session,
                        extra_message=f"The student has cancelled the session. Reason: {reason or 'Not specified'}"
                    )
                else:
                    # NOTIFICATION: Notify tutor that a student left (but session continues)
                    tutor_user = await session.tutor.fetch_link(TutorProfile.user)
                    await NotificationService.create_system_notification(
                        receiver_user=tutor_user.user,
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
            
        else:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "Invalid action"
            )

        await session.save()
        return await ScheduleService._map_session_response(session)

    # ==========================================
    # 4. SESSION RETRIEVAL
    # ==========================================
    @staticmethod
    async def get_user_sessions(user: User) -> List[SessionResponse]:
        """
        Retrieves all sessions relevant to the user (as tutor or student).
        
        Args:
            user: The authenticated user
            
        Returns:
            List of sessions sorted by start time (descending)
        """
        tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        
        sessions = []
        
        # Get sessions where user is tutor
        if tutor_profile:
            tutor_sessions = await TutorSession.find(
                TutorSession.tutor.id == tutor_profile.id
            ).sort("-start_time").to_list()
            sessions.extend(tutor_sessions)
        
        # Get sessions where user is student
        if student_profile:
            student_sessions = await TutorSession.find(
                TutorSession.students.id == student_profile.id
            ).sort("-start_time").to_list()
            sessions.extend(student_sessions)
        
        # Remove duplicates and map to response
        unique_sessions = {str(s.id): s for s in sessions}.values()
        return [await ScheduleService._map_session_response(s) for s in unique_sessions]

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
        
        return await ScheduleService._map_session_response(session)

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
    async def _map_session_response(session: TutorSession) -> SessionResponse:
        """
        Maps internal TutorSession model to SessionResponse schema.
        Optimized to avoid redundant link fetching by using snapshot data from User model.
        
        Args:
            session: The TutorSession document
            
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
        
        # Get primary student (first in list)
        student = session.students[0] 
        await student.fetch_link(StudentProfile.user)
        
        # Use snapshot data from User model (DRY - no redundant fetching)
        return SessionResponse(
            id=str(session.id),
            tutor_id=str(tutor.id),
            tutor_name=tutor.user.full_name,  # Snapshot data
            student_id=str(student.id),
            student_name=student.user.full_name,  # Snapshot data
            course_code=session.course.code,
            course_name=session.course.name,
            start_time=session.start_time,
            end_time=session.end_time,
            mode=session.mode,
            location=session.location,
            status=session.status,
            proposal=proposal_res,
            created_at=session.created_at
        )