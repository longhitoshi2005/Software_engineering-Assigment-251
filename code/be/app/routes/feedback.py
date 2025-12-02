from fastapi import APIRouter, Depends
from typing import List
from app.core.deps import get_current_user, RoleChecker
from app.models.internal.user import User
from app.models.enums.role import UserRole
from app.models.schemas.feedback import (
    FeedbackCreateRequest, FeedbackUpdateRequest, FeedbackResponse, FeedbackListItem,
    ProgressCreateRequest, ProgressResponse
)
from app.services.feedback_service import FeedbackService

router = APIRouter(tags=["Feedback & Progress"])

# ==========================================
# FEEDBACK ENDPOINTS
# ==========================================

@router.get("/feedback/my-feedbacks", response_model=List[FeedbackListItem])
async def get_my_feedbacks(
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Get all my feedback records"""
    return await FeedbackService.get_my_feedbacks(current_user)

@router.get("/feedback/received", response_model=List[FeedbackListItem])
async def get_feedbacks_received(
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Get all feedbacks received from students"""
    return await FeedbackService.get_feedbacks_for_tutor(current_user)

@router.get("/feedback/session/{session_id}", response_model=FeedbackResponse)
async def get_feedback_by_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """[Student/Tutor] Get feedback for a specific session"""
    return await FeedbackService.get_feedback_by_session(session_id, current_user)

@router.post("/feedback/session/{session_id}", response_model=FeedbackResponse)
@router.put("/feedback/session/{session_id}", response_model=FeedbackResponse)
async def submit_or_update_feedback(
    session_id: str,
    payload: FeedbackUpdateRequest,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Submit or update feedback (within 1 week deadline)"""
    return await FeedbackService.submit_or_update_feedback(session_id, current_user, payload)

# ==========================================
# LEGACY ENDPOINTS (Keep for compatibility)
# ==========================================

@router.post("/sessions/{session_id}/feedback", response_model=FeedbackResponse)
async def submit_feedback_legacy(
    session_id: str,
    payload: FeedbackCreateRequest,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Đánh giá Tutor sau buổi học (LEGACY - use POST /feedback/session/{session_id} instead)"""
    return await FeedbackService.create_feedback(session_id, current_user, payload)

# ==========================================
# PROGRESS ENDPOINTS
# ==========================================

@router.post("/sessions/{session_id}/progress", response_model=ProgressResponse)
async def record_progress(
    session_id: str,
    payload: ProgressCreateRequest,
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Ghi lại tiến độ học tập của sinh viên."""
    return await FeedbackService.create_progress(session_id, current_user, payload)

@router.get("/sessions/{session_id}/progress", response_model=ProgressResponse)
async def get_progress(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """[All Users] Xem tiến độ học tập đã được ghi nhận cho một phiên học."""
    return await FeedbackService.get_progress_record(session_id, current_user)