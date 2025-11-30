from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from beanie import PydanticObjectId, Link

# Models
from app.models.internal.user import User
from app.models.internal.student_profile import StudentProfile
from app.models.enums.university_identities import UniversityIdentity

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
