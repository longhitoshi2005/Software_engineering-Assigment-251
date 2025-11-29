from fastapi import APIRouter, Depends, Query, HTTPException, status
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
    AssignTutorResponse
)

# Import Service
from app.services.tutor_service import TutorService

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
    """
    return await TutorService.search_tutors(subject)


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