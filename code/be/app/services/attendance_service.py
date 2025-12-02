from fastapi import HTTPException, status
from datetime import datetime, timezone

# Models
from app.models.internal.user import User
from app.models.internal.session import TutorSession, SessionStatus
from app.models.internal.attendance import AttendanceLog
from app.models.internal.student_profile import StudentProfile

# Schemas
from app.models.schemas.attendance import AttendanceResponse


class AttendanceService:
    """
    Service for handling attendance logging functionality.
    """

    @staticmethod
    async def mark_attendance(session_id: str, user: User) -> AttendanceResponse:
        """
        Marks attendance for a student in a tutoring session.
        
        Business Rules:
        1. User must be a Student enrolled in the session
        2. Session must be currently active (start_time <= now < end_time) OR already COMPLETED
        3. Student can only mark attendance once per session
        
        Args:
            session_id: The ID of the tutoring session
            user: The authenticated user (must be a student)
            
        Returns:
            AttendanceResponse with attendance details
            
        Raises:
            HTTPException: If validation fails or attendance already marked
        """
        
        # 1. Fetch the session
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        # 2. Verify user is a student enrolled in this session
        student_profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not student_profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Student profile not found"
            )

        # Check if student is in the session's student list
        is_enrolled = any(s.ref.id == student_profile.id for s in session.students)
        if not is_enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only enrolled students can mark attendance for this session"
            )

        # 3. Verify session timing and status
        now = datetime.now(timezone.utc)
        
        # Session must be either:
        # - Currently active (between start_time and end_time)
        # - Already completed
        if session.status == SessionStatus.COMPLETED:
            # Allow marking attendance for completed sessions
            pass
        elif session.start_time <= now < session.end_time:
            # Session is currently active
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance can only be marked during active sessions or for completed sessions"
            )

        # 4. Check for duplicate attendance
        existing_attendance = await AttendanceLog.find_one(
            AttendanceLog.session_ref.id == session.id,
            AttendanceLog.student_ref.id == student_profile.id
        )
        
        if existing_attendance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance already marked for this session"
            )

        # 5. Create attendance record
        attendance = AttendanceLog(
            session_ref=session,
            student_ref=student_profile,
            tutor_ref=session.tutor,
            attended_at=datetime.now(timezone.utc)
        )
        await attendance.save()

        # 6. Update student statistics (optional enhancement)
        student_profile.stats.total_sessions += 1
        await student_profile.save()

        # 7. Return response
        return AttendanceResponse(
            id=str(attendance.id),
            session_id=str(session.id),
            student_id=str(student_profile.id),
            student_name=user.full_name,
            tutor_id=str(session.tutor.ref.id),
            attended_at=attendance.attended_at
        )
