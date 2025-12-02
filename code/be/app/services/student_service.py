from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from beanie import PydanticObjectId, Link

# Models
from app.models.internal.user import User
from app.models.internal.student_profile import StudentProfile
from app.models.internal.session import TutorSession, SessionStatus

# Schemas
from app.models.schemas.student import StudentResponse, StudentUpdateRequest, StudentStatsResponse

class StudentService:
    
    @staticmethod
    async def _map_to_response(profile: StudentProfile) -> StudentResponse:
        """
        Converts StudentProfile to API response schema.
        Fetches data from User and HCMUT_SSO to populate all 3 sections.
        """
        # 1. Fetch User Info
        if isinstance(profile.user, Link):
            await profile.fetch_link(StudentProfile.user)
        
        user_internal = profile.user

        # 2. Fetch SSO Info
        if isinstance(user_internal.sso_info, Link):
            await user_internal.fetch_link(User.sso_info)
        sso_info = user_internal.sso_info
        
        if not sso_info:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="SSO data missing for student"
            )
        
        # 3. Extract academic data
        academic_major = None
        class_code = None
        current_year = None
        student_status = None
        
        if sso_info.academic:
            academic_major = sso_info.academic.major
            class_code = sso_info.academic.class_code
            current_year = sso_info.academic.current_year
            student_status = sso_info.academic.student_status.value if sso_info.academic.student_status else None

        # 4. Build Complete Response (All Sections)
        return StudentResponse(
            # IDs
            id=str(profile.id),
            user_id=str(user_internal.id),
            
            # Section I: Identity & Academic Info (Read-only)
            full_name=user_internal.full_name,
            sso_id=sso_info.identity_id,
            email_edu=user_internal.email_edu,
            academic_major=academic_major,
            class_code=class_code,
            current_year=current_year,
            student_status=student_status,
            
            # Section II: Personal Contact & Profile (Editable)
            bio=profile.bio,
            email_personal=user_internal.email_personal,
            phone_number=sso_info.contact.phone_number if sso_info.contact else None,
            avatar_url=profile.avatar_url,
            
            # Section III: Learning Profile (Read-only stats)
            stats=StudentStatsResponse(
                total_learning_hours=profile.stats.total_learning_hours,
                total_sessions=profile.stats.total_sessions,
                total_tutors_met=profile.stats.total_tutors_met,
                attendance_rate=profile.stats.attendance_rate
            )
        )

    @staticmethod
    async def get_student_profile_by_user_id(user_id: PydanticObjectId) -> StudentResponse:
        """Retrieves a student's profile using the Internal User ID."""
        profile = await StudentProfile.find_one(StudentProfile.user.id == user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Student profile not found. Please contact Admin."
            )
        
        return await StudentService._map_to_response(profile)

    @staticmethod
    async def update_student_profile(user: User, payload: StudentUpdateRequest) -> StudentResponse:
        """
        Allows Student to update Section II editable fields (bio, email_personal).
        Avatar is updated via separate upload endpoint.
        """
        profile = await StudentProfile.find_one(StudentProfile.user.id == user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Student profile not found"
            )

        changes_made = False

        # Update StudentProfile.bio
        if payload.bio is not None:
            profile.bio = payload.bio
            changes_made = True

        # Update User.email_personal
        if payload.email_personal is not None:
            user.email_personal = payload.email_personal
            await user.save()
            changes_made = True
            
        # Update profile timestamp if any changes
        if changes_made:
            profile.updated_at = datetime.now()
            await profile.save()

        return await StudentService._map_to_response(profile)

    @staticmethod
    async def recalculate_student_stats(student_id: Optional[str] = None) -> int:
        """
        Recalculates learning statistics for student(s) based on completed sessions.
        
        Similar to tutor stats recalculation, this method:
        - Counts COMPLETED sessions where student participated
        - Calculates total learning hours from session durations
        - Counts unique tutors the student has worked with
        - Calculates attendance rate (currently defaults to 100% - can be enhanced)
        
        Args:
            student_id: Optional specific student profile ID. If None, recalculates for all students.
            
        Returns:
            Number of student profiles updated
        """
        # Get student profiles to update
        if student_id:
            student = await StudentProfile.get(student_id)
            if not student:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Student profile not found")
            students = [student]
        else:
            students = await StudentProfile.find_all().to_list()
        
        updated_count = 0
        
        for student in students:
            # Get all COMPLETED sessions for this student
            completed_sessions = await TutorSession.find(
                TutorSession.students.id == student.id,
                TutorSession.status == SessionStatus.COMPLETED
            ).to_list()
            
            # Calculate stats
            total_sessions = len(completed_sessions)
            
            # Calculate total learning hours
            total_hours = 0.0
            for session in completed_sessions:
                duration = (session.end_time - session.start_time).total_seconds() / 3600
                total_hours += duration
            
            # Count unique tutors
            unique_tutor_ids = set()
            for session in completed_sessions:
                await session.fetch_link(TutorSession.tutor)
                unique_tutor_ids.add(str(session.tutor.id))
            total_tutors = len(unique_tutor_ids)
            
            # Attendance rate - currently set to 100%
            # TODO: Calculate based on actual attendance records when implemented
            attendance_rate = 100
            
            # Update student stats
            student.stats.total_sessions = total_sessions
            student.stats.total_learning_hours = round(total_hours, 2)
            student.stats.total_tutors_met = total_tutors
            student.stats.attendance_rate = attendance_rate
            student.updated_at = datetime.now()
            
            await student.save()
            updated_count += 1
            
            print(f"Updated stats for student {student.id}: {total_sessions} sessions, {total_hours:.2f}h, {total_tutors} tutors, {attendance_rate}% attendance")
        
        return updated_count
