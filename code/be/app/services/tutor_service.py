from typing import List, Optional
from fastapi import HTTPException, status
from beanie import PydanticObjectId, Link
from beanie.operators import In
from bson import ObjectId
from bson.dbref import DBRef

# Models
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile, TutorStatus, TeachingSubject
from app.models.external.course import Course
from app.models.enums.role import UserRole
from app.models.enums.university_identities import UniversityIdentity

# Schemas
from app.models.schemas.tutor import (
    TutorResponse, 
    TutorUpdateRequest, 
    AssignTutorResponse, 
    TeachingSubjectResponse, 
    TutorStatsResponse
)

class TutorService:
    
    # ==========================================
    # INTERNAL HELPER: MAPPER (Handles Link Fetching)
    # ==========================================
    @staticmethod
    async def _map_to_response(profile: TutorProfile) -> TutorResponse:
        """
        Converts the DB Document to the standard API Response Schema.
        Performs necessary link fetching for display information (User, Course details).
        """
        # 1. Fetch User Info (Internal User)
        if isinstance(profile.user, Link):
            await profile.fetch_link(TutorProfile.user)
        
        user_internal = profile.user

        # 2. Fetch SSO Info (External Identity) to determine Lecturer status
        if isinstance(user_internal.sso_info, Link):
            await user_internal.fetch_link(User.sso_info)
        sso_info = user_internal.sso_info
        
        # 3. Map Subjects (Fetch Course names/codes)
        mapped_subjects = []
        for sub in profile.teaching_subjects:
            course_data = sub.course_ref
            
            # Fetch Link if necessary
            if isinstance(course_data, Link):
                course_data = await sub.course_ref.fetch()
            
            if course_data: 
                mapped_subjects.append(TeachingSubjectResponse(
                    course_code=course_data.code,
                    course_name=course_data.name,
                    description=sub.description
                ))
        
        # 4. Build Response
        is_lecturer_flag = (sso_info.identity_type == UniversityIdentity.LECTURER)

        # Note: Stats update logic happens in FeedbackService, here we just read the current state
        return TutorResponse(
            id=str(profile.id),
            user_id=str(user_internal.id),
            display_name=profile.display_name,
            avatar_url=user_internal.avatar_url,
            bio=profile.bio,
            tags=profile.tags,
            status=profile.status.value, # Return string value of Enum
            subjects=mapped_subjects,
            stats=TutorStatsResponse(
                average_rating=profile.stats.average_rating,
                total_feedbacks=profile.stats.total_feedbacks,
                total_sessions=profile.stats.total_sessions,
                total_students=profile.stats.total_students, # Assuming this field exists in TutorStats
                response_rate=profile.stats.response_rate # Assuming this field exists in TutorStats
            ),
            is_lecturer=is_lecturer_flag
        )

    # ==========================================
    # 1. MANAGEMENT LOGIC (Assign Tutors)
    # ==========================================
    @staticmethod
    async def assign_tutors(emails: List[str]) -> AssignTutorResponse:
        """
        [Admin/Manager Action] Grants TUTOR role and provisions TutorProfile for a list of existing users.
        """
        success_count = 0
        failed_emails = []

        for email in emails:
            # 1. Find User by institutional email
            user = await User.find_one(User.email_edu == email)
            
            if not user:
                failed_emails.append(email)
                continue
            
            # 2. Grant TUTOR Role
            if UserRole.TUTOR not in user.roles:
                user.roles.append(UserRole.TUTOR)
                await user.save()
            
            # 3. Create Profile if missing (Idempotent operation)
            profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
            if not profile:
                # Provision a new profile for the newly assigned tutor
                new_profile = TutorProfile(
                    user=user,
                    display_name=user.full_name,
                    bio="Tutor assigned by Department/Admin.",
                    status=TutorStatus.AVAILABLE,
                    is_certified_by_faculty=True
                )
                await new_profile.save()
            
            success_count += 1

        return AssignTutorResponse(
            success_count=success_count,
            failed_emails=failed_emails
        )

    # ==========================================
    # 2. DISCOVERY LOGIC (Search & Get)
    # ==========================================
    @staticmethod
    async def search_tutors(subject_code: Optional[str] = None) -> List[TutorResponse]:
        """
        Search and filter tutors. Uses in-memory filtering for linked fields 
        to ensure consistency with small-to-medium datasets.
        """
        # Base Query: Find all AVAILABLE tutors (Limit 50)
        query = TutorProfile.find(TutorProfile.status == TutorStatus.AVAILABLE).limit(50)
        
        profiles = await query.to_list()
        
        # 2. Filter by Subject Code (Python-side filtering)
        if subject_code:
            course = await Course.find_one(Course.code == subject_code)
            if not course:
                return [] 
            
            # Filter the list of profiles retrieved
            profiles = [
                p for p in profiles 
                if any(sub.course_ref.id == course.id for sub in p.teaching_subjects)
            ]

        # 3. Map to Response Schema
        results = []
        for p in profiles:
            results.append(await TutorService._map_to_response(p))
            
        return results

    @staticmethod
    async def get_tutor_profile_by_user_id(user_id: PydanticObjectId) -> TutorResponse:
        """Retrieves a tutor's profile using the Internal User ID."""
        profile = await TutorProfile.find_one(TutorProfile.user.id == user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor profile not found. Please contact Admin.")
        
        return await TutorService._map_to_response(profile)

    @staticmethod
    async def get_tutor_profile_by_id(profile_id: str) -> Optional[TutorResponse]:
        """Retrieves a tutor's profile using the TutorProfile ObjectId."""
        profile = await TutorProfile.get(profile_id)
        if not profile:
            return None
        return await TutorService._map_to_response(profile)

    # ==========================================
    # 3. UPDATE LOGIC (Self-Management)
    # ==========================================
    @staticmethod
    async def update_tutor_profile(user: User, payload: TutorUpdateRequest) -> TutorResponse:
        """Allows Tutor to update soft fields like bio and status."""
        
        profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        # Update fields only if provided in payload
        if payload.display_name:
            profile.display_name = payload.display_name
        if payload.bio:
            profile.bio = payload.bio
        if payload.tags is not None:
            profile.tags = payload.tags
        if payload.status:
            profile.status = TutorStatus(payload.status) # Ensure input string is converted to Enum

        # Save changes
        await profile.save()
        return await TutorService._map_to_response(profile)