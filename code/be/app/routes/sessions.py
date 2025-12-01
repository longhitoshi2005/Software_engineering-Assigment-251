from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import List, Optional

from app.core.deps import RoleChecker, get_current_user, get_current_user_optional
from app.models.internal.user import User
from app.models.schemas.schedule import (
    SessionResponse, 
    BookingRequest, 
    SessionActionRequest, 
    NegotiationCreateRequest, 
    SessionConfirmRequest # Import schema confirm
)
from app.services.schedule_service import ScheduleService
from app.models.enums.role import UserRole

router = APIRouter(prefix="/sessions", tags=["Sessions"])

# ==========================================
# 1. BOOKING REQUEST & CREATION
# ==========================================

@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def request_booking(
    payload: BookingRequest,
    # Chỉ sinh viên mới được tạo request booking
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Request to book a session. (Status: WAITING_FOR_TUTOR)"""
    return await ScheduleService.create_booking_request(current_user, payload)

@router.get("/", response_model=List[SessionResponse])
async def get_my_sessions(
    role: Optional[str] = None,  # "student" or "tutor" to specify which view
    current_user: User = Depends(get_current_user)
):
    """[Tutor/Student] Retrieves the list of sessions relevant to the current user.
    
    Optional query parameter 'role' can be used to specify which perspective:
    - role=student: Only sessions where user is a student
    - role=tutor: Only sessions where user is a tutor
    - If not specified, defaults to student view if student profile exists, otherwise tutor view
    """
    return await ScheduleService.get_user_sessions(current_user, role)

@router.get("/public", response_model=List[SessionResponse])
async def get_public_sessions(
    course_code: Optional[str] = None,
    tutor_name: Optional[str] = None,
    limit: int = 20,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """[Public] Get list of public sessions with available slots that students can join."""
    return await ScheduleService.get_public_sessions(course_code, tutor_name, limit, current_user)

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session_detail(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Views the detailed information of a specific session."""
    return await ScheduleService.get_session_detail(session_id, current_user)

# ==========================================
# 2. TUTOR ACTIONS & STATE TRANSITIONS
# ==========================================

@router.put("/{session_id}/confirm", response_model=SessionResponse)
async def confirm_session(
    session_id: str,
    # Thêm Body để Tutor set capacity/publicity cho session đang CONFIRM
    confirm_details: SessionConfirmRequest = Body(...), 
    # Chỉ Tutor mới được xác nhận
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Confirms a pending request, performs slot splitting, and sets final capacity/link."""
    return await ScheduleService.handle_session_action(session_id, current_user, "confirm", confirm_details=confirm_details)


@router.put("/{session_id}/reject", response_model=SessionResponse)
async def reject_session(
    session_id: str,
    payload: SessionActionRequest = Body(default=None), 
    # Chỉ Tutor mới được từ chối
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Rejects a pending request."""
    reason = payload.reason if payload else None
    return await ScheduleService.handle_session_action(session_id, current_user, "reject", reason)


@router.put("/{session_id}/complete", response_model=SessionResponse)
async def complete_session(
    session_id: str,
    # Chỉ Tutor hoặc Manager mới được đánh dấu hoàn thành
    current_user: User = Depends(RoleChecker([UserRole.TUTOR, UserRole.ADMIN, UserRole.DEPT_CHAIR]))
):
    """[Tutor/Admin] Marks a confirmed session as COMPLETED (ready for feedback/progress reports)."""
    return await ScheduleService.handle_session_action(session_id, current_user, "complete")


# ==========================================
# 3. NEGOTIATION WORKFLOW
# ==========================================

@router.post("/{session_id}/negotiate", response_model=SessionResponse)
async def propose_change(
    session_id: str,
    payload: NegotiationCreateRequest,
    # Chỉ Tutor được mặc cả
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Proposes time/location/format changes for a WAITING_FOR_TUTOR request."""
    return await ScheduleService.propose_negotiation(session_id, current_user, payload)


@router.put("/{session_id}/negotiate/{action}", response_model=SessionResponse)
async def resolve_proposal(
    session_id: str,
    action: str, # "accept" or "reject"
    # Student phải cung cấp lại payload SessionConfirmRequest nếu họ chấp nhận thay đổi
    confirm_details: Optional[SessionConfirmRequest] = Body(None),
    # Chỉ Student được phản hồi
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Accepts (finalizes booking) or Rejects the Tutor's counter-proposal."""
    if action not in ["accept", "reject"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Action must be 'accept' or 'reject'")
    return await ScheduleService.resolve_negotiation(session_id, current_user, action, confirm_details)

# ==========================================
# 4. UTILITY ACTIONS
# ==========================================

@router.put("/{session_id}/cancel", response_model=SessionResponse)
async def cancel_session(
    session_id: str,
    payload: SessionActionRequest = Body(default=None),
    current_user: User = Depends(get_current_user)
):
    """[Tutor/Student] Cancels a confirmed or negotiating session."""
    reason = payload.reason if payload else None
    return await ScheduleService.handle_session_action(session_id, current_user, "cancel", reason)


@router.patch("/{session_id}/location", response_model=SessionResponse)
async def update_session_location(
    session_id: str,
    location: str = Body(..., embed=True),
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Updates the location/meeting link for a session (only before session starts)."""
    return await ScheduleService.update_session_location(session_id, current_user, location)


@router.patch("/{session_id}/topic", response_model=SessionResponse)
async def update_session_topic(
    session_id: str,
    topic: str = Body(..., embed=True),
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Updates the topic/title for a session."""
    return await ScheduleService.update_session_topic(session_id, current_user, topic)


@router.patch("/{session_id}/students/{student_id}/participation", response_model=SessionResponse)
async def update_student_participation(
    session_id: str,
    student_id: str,
    status: str = Body(..., embed=True),
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """[Tutor] Updates student participation status (30 min before to 1 day after session start)."""
    return await ScheduleService.update_student_participation(session_id, student_id, current_user, status)


@router.put("/invite/{session_id}/{action}", status_code=status.HTTP_200_OK)
async def respond_to_invite(
    session_id: str,
    action: str, # "accept" or "decline"
    current_user: User = Depends(get_current_user)
):
    """[Student] Phản hồi lời mời tham gia session nhóm kín."""
    if action not in ["accept", "decline"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Action must be 'accept' or 'decline'")
    
    await ScheduleService.respond_to_invite(session_id, current_user, action)
    
    return {"message": f"Invitation {action}ed successfully."}

@router.post("/{session_id}/join", response_model=SessionResponse)
async def join_public_session(
    session_id: str,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Join a public session with available slots."""
    return await ScheduleService.join_public_session(session_id, current_user)

@router.post("/{session_id}/leave")
async def leave_public_session(
    session_id: str,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """[Student] Leave a public session before it starts."""
    return await ScheduleService.leave_public_session(session_id, current_user)
