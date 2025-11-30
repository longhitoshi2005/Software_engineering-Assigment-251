from fastapi import APIRouter, Depends
from app.core.deps import get_current_user, RoleChecker
from app.models.internal.user import User
from app.models.enums.role import UserRole
from app.models.schemas.student import StudentResponse, StudentUpdateRequest
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/me", response_model=StudentResponse)
async def get_my_student_profile(
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    [Student Only] Retrieves the student's own profile with 3 sections.
    """
    return await StudentService.get_student_profile_by_user_id(current_user.id)

@router.put("/me", response_model=StudentResponse)
async def update_my_student_profile(
    payload: StudentUpdateRequest,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    [Student Only] Allows the student to update editable fields (email_personal).
    """
    return await StudentService.update_student_profile(current_user, payload)
