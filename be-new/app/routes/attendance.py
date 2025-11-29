from fastapi import APIRouter, Depends, status
from app.core.deps import RoleChecker
from app.models.internal.user import User
from app.models.enums.role import UserRole
from app.models.schemas.attendance import AttendanceResponse
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/sessions", tags=["Attendance"])


@router.put("/{session_id}/attendance", response_model=AttendanceResponse, status_code=status.HTTP_200_OK)
async def mark_attendance(
    session_id: str,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    [Student] Mark attendance for a tutoring session.
    
    Students can mark their attendance when:
    - The session is currently active (between start_time and end_time)
    - OR the session has been completed
    
    Each student can only mark attendance once per session.
    """
    return await AttendanceService.mark_attendance(session_id, current_user)
