from fastapi import APIRouter, Depends
from app.core.deps import get_current_user, RoleChecker
from app.models.internal.user import User
from app.models.enums.role import UserRole
from app.models.schemas.feedback import (
    FeedbackCreateRequest, FeedbackResponse,
    ProgressCreateRequest, ProgressResponse
)
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/sessions", tags=["Feedback & Progress"])

@router.post("/{session_id}/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    session_id: str,
    payload: FeedbackCreateRequest,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Đánh giá Tutor sau buổi học."""
    return await FeedbackService.create_feedback(session_id, current_user, payload)

@router.post("/{session_id}/progress", response_model=ProgressResponse)
async def record_progress(
    session_id: str,
    payload: ProgressCreateRequest,
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Ghi lại tiến độ học tập của sinh viên."""
    return await FeedbackService.create_progress(session_id, current_user, payload)

@router.get("/{session_id}/progress", response_model=ProgressResponse)
async def get_progress(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """[All Users] Xem tiến độ học tập đã được ghi nhận cho một phiên học."""
    return await FeedbackService.get_progress_record(session_id, current_user)