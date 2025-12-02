from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status, UploadFile
from beanie import PydanticObjectId, Link
from beanie.operators import In
from bson import ObjectId
from bson.dbref import DBRef

# Models
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile, TutorStatus, TeachingSubject
from app.models.internal.availability import AvailabilitySlot
from app.models.external.course import Course
from app.models.enums.role import UserRole
from app.models.enums.university_identities import UniversityIdentity
from app.models.enums.location import LocationMode

# Schemas
from app.models.schemas.tutor import (
    TutorResponse, 
    TutorUpdateRequest, 
    AssignTutorResponse, 
    TeachingSubjectResponse, 
    TutorStatsResponse,
    TutorSearchRequest,
    TutorSearchResult,
    ClosestAvailability
)

# Services
from app.services.storage_service import StorageService

class TutorService:
    
    # ==========================================
    # INTERNAL HELPER: MAPPER (Handles Link Fetching)
    # ==========================================
    @staticmethod
    async def _map_to_response(profile: TutorProfile) -> TutorResponse:
        """
        Converts the DB Document to the standard API Response Schema.
        Performs necessary link fetching for display information (User, Course details, SSO).
        Returns complete profile data for all three sections (Identity, Management, Expertise).
        """
        # 1. Fetch User Info (Internal User)
        if isinstance(profile.user, Link):
            await profile.fetch_link(TutorProfile.user)
        
        user_internal = profile.user

        # 2. Fetch SSO Info (External Identity) to get full profile data
        if isinstance(user_internal.sso_info, Link):
            await user_internal.fetch_link(User.sso_info)
        sso_info = user_internal.sso_info
        
        if not sso_info:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                              detail="SSO data missing for tutor")
        
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
        
        # 4. Determine lecturer status and academic major
        is_lecturer_flag = (sso_info.identity_type == UniversityIdentity.LECTURER)
        academic_major = sso_info.academic.major if sso_info.academic else None

        # 5. Build Complete Response (All Sections)
        return TutorResponse(
            # TutorProfile IDs
            id=str(profile.id),
            user_id=str(user_internal.id),
            
            # Section I: Identity & Authority (Read-only)
            full_name=user_internal.full_name,
            sso_id=sso_info.identity_id,
            email_edu=user_internal.email_edu,
            academic_major=academic_major,
            is_lecturer=is_lecturer_flag,
            
            # Section II: Management & Contact (Editable)
            display_name=profile.display_name,
            bio=profile.bio,
            tags=profile.tags,
            status=profile.status.value,
            email_personal=user_internal.email_personal,
            phone_number=sso_info.contact.phone_number if sso_info.contact else None,
            
            # Section III: Expertise & Reputation (Read-only)
            subjects=mapped_subjects,
            stats=TutorStatsResponse(
                average_rating=profile.stats.average_rating,
                total_feedbacks=profile.stats.total_feedbacks,
                total_sessions=profile.stats.total_sessions,
                total_students=profile.stats.total_students,
                response_rate=profile.stats.response_rate
            ),
            avatar_url=profile.avatar_url  # Personal avatar from TutorProfile
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

    @staticmethod
    async def search_tutors_with_availability(search_params: TutorSearchRequest) -> List[TutorSearchResult]:
        """
        Advanced tutor search with availability filtering.
        Returns tutors matching the search criteria with their closest available time slot.
        """
        # Base query: Find AVAILABLE tutors
        query = TutorProfile.find(TutorProfile.status == TutorStatus.AVAILABLE)
        
        # Filter by tags (expertise keywords)
        if search_params.tags:
            # Match any of the provided tags
            query = query.find({"tags": {"$in": search_params.tags}})
        
        # Get initial results
        profiles = await query.skip(search_params.offset).limit(search_params.limit).to_list()
        
        # Filter by subject/course (Python-side)
        if search_params.subject:
            course = await Course.find_one(
                {"$or": [
                    {"code": {"$regex": search_params.subject, "$options": "i"}},
                    {"name": {"$regex": search_params.subject, "$options": "i"}}
                ]}
            )
            if course:
                profiles = [
                    p for p in profiles 
                    if any(sub.course_ref.id == course.id for sub in p.teaching_subjects)
                ]
        
        # Filter by department (Python-side via SSO data)
        if search_params.department:
            filtered_profiles = []
            for p in profiles:
                if isinstance(p.user, Link):
                    await p.fetch_link(TutorProfile.user)
                user = p.user
                if isinstance(user.sso_info, Link):
                    await user.fetch_link(User.sso_info)
                sso = user.sso_info
                
                # Check if tutor has academic info with major
                if sso and sso.academic and sso.academic.major_link:
                    # Fetch the major to get faculty information
                    major = sso.academic.major_link
                    if isinstance(major, Link):
                        from app.models.external.major import Major
                        major = await major.fetch()
                    
                    if major and major.faculty:
                        # Fetch faculty name
                        faculty = major.faculty
                        if isinstance(faculty, Link):
                            from app.models.external.faculty import Faculty
                            faculty = await faculty.fetch()
                        
                        if faculty and hasattr(faculty, 'name'):
                            if search_params.department.lower() in faculty.name.lower():
                                filtered_profiles.append(p)
                        elif faculty and hasattr(faculty, 'code'):
                            if search_params.department.lower() in faculty.code.lower():
                                filtered_profiles.append(p)
                # Also check work_info for lecturers/staff
                elif sso and sso.work_info and sso.work_info.department:
                    if search_params.department.lower() in sso.work_info.department.lower():
                        filtered_profiles.append(p)
            profiles = filtered_profiles
        
        # Build results with availability data
        results = []
        for profile in profiles:
            # Fetch availability slots for this tutor
            availability_query = AvailabilitySlot.find(
                AvailabilitySlot.tutor.id == profile.id,
                AvailabilitySlot.is_booked == False
            ).sort("+start_time")
            
            # Apply time range filter if provided
            if search_params.available_from:
                availability_query = availability_query.find(
                    AvailabilitySlot.start_time >= search_params.available_from
                )
            if search_params.available_to:
                availability_query = availability_query.find(
                    AvailabilitySlot.end_time <= search_params.available_to
                )
            
            # Filter by mode if specified
            if search_params.mode:
                availability_query = availability_query.find(
                    {"allowed_modes": search_params.mode}
                )
            
            slots = await availability_query.to_list()
            
            # Skip tutors with no matching availability if time/mode filters are active
            if (search_params.available_from or search_params.available_to or search_params.mode) and not slots:
                continue
            
            # Get closest availability
            closest_slot = slots[0] if slots else None
            closest_availability = None
            if closest_slot:
                closest_availability = ClosestAvailability(
                    start_time=closest_slot.start_time,
                    end_time=closest_slot.end_time,
                    allowed_modes=closest_slot.allowed_modes
                )
            
            # Build search result
            if isinstance(profile.user, Link):
                await profile.fetch_link(TutorProfile.user)
            user = profile.user
            
            if isinstance(user.sso_info, Link):
                await user.fetch_link(User.sso_info)
            sso = user.sso_info
            
            # Map subjects
            mapped_subjects = []
            for sub in profile.teaching_subjects:
                course_data = sub.course_ref
                if isinstance(course_data, Link):
                    course_data = await sub.course_ref.fetch()
                if course_data:
                    mapped_subjects.append(TeachingSubjectResponse(
                        course_code=course_data.code,
                        course_name=course_data.name,
                        description=sub.description
                    ))
            
            is_lecturer = sso.identity_type == UniversityIdentity.LECTURER if sso else False
            academic_major = sso.academic.major if sso and sso.academic else None
            
            result = TutorSearchResult(
                id=str(profile.id),
                user_id=str(user.id),
                full_name=user.full_name,
                display_name=profile.display_name,
                email_edu=user.email_edu,
                academic_major=academic_major,
                is_lecturer=is_lecturer,
                bio=profile.bio,
                tags=profile.tags,
                status=profile.status.value,
                avatar_url=profile.avatar_url,
                subjects=mapped_subjects,
                stats=TutorStatsResponse(
                    average_rating=profile.stats.average_rating,
                    total_feedbacks=profile.stats.total_feedbacks,
                    total_sessions=profile.stats.total_sessions,
                    total_students=profile.stats.total_students,
                    response_rate=profile.stats.response_rate
                ),
                closest_availability=closest_availability
            )
            results.append(result)
        
        return results

    # ==========================================
    # 3. UPDATE LOGIC (Self-Management)
    # ==========================================
    @staticmethod
    async def update_tutor_profile(user: User, payload: TutorUpdateRequest) -> TutorResponse:
        """
        Allows Tutor to update Section II editable fields (bio, status, tags, display_name, email_personal, avatar_url).
        Handles cross-model updates: TutorProfile fields + User.email_personal.
        """
        
        profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        # Track if any changes were made
        changes_made = False

        # Update TutorProfile fields (Section II)
        if payload.display_name is not None:
            profile.display_name = payload.display_name
            changes_made = True
            
        if payload.bio is not None:
            profile.bio = payload.bio
            changes_made = True
            
        if payload.tags is not None:
            profile.tags = payload.tags
            changes_made = True
            
        if payload.status is not None:
            profile.status = TutorStatus(payload.status) # Convert string to Enum
            changes_made = True
        
        if payload.avatar_url is not None:
            profile.avatar_url = payload.avatar_url
            changes_made = True

        # Update User.email_personal (cross-model field)
        if payload.email_personal is not None:
            user.email_personal = payload.email_personal
            await user.save()
            changes_made = True

        # Save TutorProfile changes
        if changes_made:
            profile.updated_at = datetime.now(timezone.utc)
            await profile.save()

        return await TutorService._map_to_response(profile)

    # ==========================================
    # 4. AVATAR UPLOAD LOGIC
    # ==========================================
    @staticmethod
    async def upload_avatar(user: User, file: UploadFile) -> dict:
        """
        Uploads a new avatar for the tutor to Cloudinary.
        Deletes the old avatar if it exists to save storage space.
        
        Args:
            user: The authenticated tutor user
            file: The uploaded image file
            
        Returns:
            Dictionary with avatar_url and success message
        """
        # Find tutor profile
        profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor profile not found")
        
        # Delete old avatar from Cloudinary if exists
        if profile.avatar_public_id:
            try:
                await StorageService.delete_resource(
                    public_id=profile.avatar_public_id,
                    resource_type="image"
                )
            except Exception as e:
                # Log but don't fail if deletion fails
                print(f"Warning: Failed to delete old avatar {profile.avatar_public_id}: {str(e)}")
        
        # Upload new avatar to Cloudinary
        upload_result = await StorageService.upload_document(
            file=file,
            folder="tutor-system/avatars"
        )
        
        # Update profile with new avatar URL and public_id
        profile.avatar_url = upload_result["secure_url"]
        profile.avatar_public_id = upload_result["public_id"]
        profile.updated_at = datetime.now(timezone.utc)
        await profile.save()
        
        return {
            "avatar_url": upload_result["secure_url"],
            "message": "Avatar uploaded successfully"
        }

    # ==========================================
    # 5. STATS RECALCULATION
    # ==========================================
    @staticmethod
    async def recalculate_tutor_stats(tutor_profile_id: Optional[PydanticObjectId] = None):
        """
        Recalculates tutor statistics from actual session and feedback data.
        Can recalculate for a specific tutor or all tutors if no ID provided.
        
        This should be called:
        - After bulk data imports/seeds
        - When stats appear incorrect
        - As a maintenance task
        
        Args:
            tutor_profile_id: Optional specific tutor to recalculate. If None, recalculates all tutors.
        """
        from app.models.internal.session import TutorSession, SessionStatus
        from app.models.internal.feedback import SessionFeedback, FeedbackStatus
        
        # Find tutors to update
        if tutor_profile_id:
            tutors = [await TutorProfile.get(tutor_profile_id)]
            if not tutors[0]:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
        else:
            tutors = await TutorProfile.find_all().to_list()
        
        for tutor in tutors:
            # 1. Count total COMPLETED sessions where this tutor was the tutor
            completed_sessions = await TutorSession.find(
                TutorSession.tutor.id == tutor.id,
                TutorSession.status == SessionStatus.COMPLETED
            ).to_list()
            
            total_sessions = len(completed_sessions)
            
            # 2. Count unique students across all completed sessions
            unique_students = set()
            for session in completed_sessions:
                await session.fetch_link(TutorSession.students)
                if session.students:
                    for student in session.students:
                        if isinstance(student, Link):
                            await student.fetch()
                        unique_students.add(str(student.id))
            
            total_students = len(unique_students)
            
            # 3. Get all SUBMITTED feedbacks for this tutor
            submitted_feedbacks = await SessionFeedback.find(
                SessionFeedback.tutor.id == tutor.id,
                SessionFeedback.status == FeedbackStatus.SUBMITTED
            ).to_list()
            
            total_feedbacks = len(submitted_feedbacks)
            
            # 4. Calculate average rating from SUBMITTED feedbacks that have ratings
            ratings = [fb.rating for fb in submitted_feedbacks if fb.rating is not None]
            average_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
            
            # 5. Calculate response rate (for now, keep at 100% - can be enhanced later)
            response_rate = 100
            
            # 6. Update tutor stats
            tutor.stats.average_rating = average_rating
            tutor.stats.total_feedbacks = total_feedbacks
            tutor.stats.total_sessions = total_sessions
            tutor.stats.total_students = total_students
            tutor.stats.response_rate = response_rate
            tutor.updated_at = datetime.now(timezone.utc)
            
            await tutor.save()
            
            print(f"Updated stats for tutor {tutor.id}: {total_sessions} sessions, {total_students} students, {total_feedbacks} feedbacks, {average_rating} avg rating")
        
        return {
            "updated_count": len(tutors),
            "message": f"Successfully recalculated stats for {len(tutors)} tutor(s)"
        }