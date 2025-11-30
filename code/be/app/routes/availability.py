from fastapi import APIRouter, Depends, status
from typing import List

from app.core.deps import get_current_user, RoleChecker
from app.models.internal.user import User
from app.models.enums.role import UserRole
from app.models.schemas.schedule import AvailabilityCreateRequest, AvailabilityResponse
from app.services.schedule_service import ScheduleService

router = APIRouter(prefix="/availability", tags=["Availability"])

@router.post("/", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_availability_slot(
    payload: AvailabilityCreateRequest,
    current_user: User = Depends(RoleChecker([UserRole.TUTOR]))
):
    """
    [Tutor Action] Creates a new block of free time.
    Requires: Tutor Role.
    Logic handled by Service: Time overlap check (against existing slots and confirmed sessions).
    """
    return await ScheduleService.create_slot(current_user, payload)

@router.get("/{tutor_id}", response_model=List[AvailabilityResponse])
async def get_tutor_availability(
    tutor_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    [Discovery] Retrieves a list of available (unbooked) slots for a specific tutor ID.
    Requires: Any authenticated user.
    """
    return await ScheduleService.get_slots(tutor_id)