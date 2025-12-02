from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
from typing import List

# Import Dependencies & Models
from app.core.deps import get_current_user, RoleChecker
from app.models.internal.user import User
from app.models.enums.role import UserRole

# Import Schemas
from app.models.schemas.tutor import (
    TutorResponse,
    TutorUpdateRequest,
    AssignTutorRequest,
    AssignTutorResponse,
    TutorSearchRequest,
    TutorSearchResult
)

# Import Service
from app.services.tutor_service import TutorService
from app.services.storage_service import StorageService

router = APIRouter(prefix="/tutors", tags=["Tutors"])

# ==========================================
# 1. MANAGEMENT API (Admin/Chair/Coord)
# (FR-MAT.04: Manual Assignment)
# ==========================================

@router.post("/assign", response_model=AssignTutorResponse)
async def assign_tutors(
    payload: AssignTutorRequest,
    # Only Admin, Dept Chair, or Coordinator can perform this action
    current_user: User = Depends(RoleChecker([
        UserRole.ADMIN, 
        UserRole.DEPT_CHAIR, 
        UserRole.COORD
    ]))
):
    """
    [Manager Action] Assigns the TUTOR role to existing system users based on institutional email. 
    Users must have logged in at least once (exist in the internal database).
    """
    return await TutorService.assign_tutors(payload.emails)


# ==========================================
# 2. DISCOVERY API (Public for Auth Users)
# (FR-MAT.02: Manual Selection)
# ==========================================

@router.get("/", response_model=List[TutorResponse])
async def search_tutors(
    subject: str = Query(None, description="Filter by Course Code (e.g., CO3005)"),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves a list of available Tutors, optionally filtered by subject expertise.
    (Legacy endpoint - use /search for advanced filtering)
    """
    return await TutorService.search_tutors(subject)


@router.post("/search", response_model=List[TutorSearchResult])
async def search_tutors_advanced(
    search_params: TutorSearchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Advanced tutor search with multiple filters:
    - subject: Course code or name
    - department: Department/faculty name
    - tags: Expertise keywords
    - mode: Location mode (ONLINE, CAMPUS_1, CAMPUS_2)
    - available_from/available_to: Availability time range
    
    Returns tutors with their closest available time slot.
    """
    return await TutorService.search_tutors_with_availability(search_params)


@router.get("/me", response_model=TutorResponse)
async def get_my_tutor_profile(
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """
    [Tutor Only] Retrieves the Tutor's own teaching profile.
    """
    return await TutorService.get_tutor_profile_by_user_id(current_user.id)


@router.get("/{tutor_id}", response_model=TutorResponse)
async def get_tutor_detail(
    tutor_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Views the detailed profile of a specific Tutor (used by Students before booking).
    """
    profile = await TutorService.get_tutor_profile_by_id(tutor_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor profile not found")
    return profile


# ==========================================
# 3. SELF-MANAGEMENT API (Tutor Only)
# ==========================================

@router.put("/me", response_model=TutorResponse)
async def update_my_tutor_profile(
    payload: TutorUpdateRequest,
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """
    [Tutor Only] Allows the tutor to update soft fields (Bio, Display Name, Status).
    Note: Course expertise update is restricted to Manager assignment only.
    """
    return await TutorService.update_tutor_profile(current_user, payload)


@router.post("/me/avatar", response_model=dict)
async def upload_tutor_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """
    [Tutor Only] Upload a custom avatar image (JPG, PNG) to Cloudinary.
    Deletes the old avatar if it exists to save storage space.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (JPG, PNG, GIF, WEBP) are allowed"
        )
    
    return await TutorService.upload_avatar(current_user, file)


# ==========================================
# 4. ADMIN UTILITIES
# ==========================================

@router.post("/stats/recalculate", response_model=dict)
async def recalculate_all_tutor_stats(
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.DEPT_CHAIR]))
):
    """
    [Admin/Dept Chair Only] Recalculates statistics for all tutors based on actual session and feedback data.
    
    This endpoint should be called:
    - After bulk data imports or database migrations
    - When tutor stats appear incorrect or out of sync
    - As a maintenance/cleanup task
    
    The recalculation includes:
    - Total completed sessions
    - Total unique students taught
    - Total submitted feedbacks
    - Average rating from submitted feedbacks
    """
    return await TutorService.recalculate_tutor_stats()
