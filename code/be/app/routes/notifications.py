from fastapi import APIRouter, Depends, status
from typing import List

from app.core.deps import get_current_user
from app.models.internal.user import User
from app.models.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user)
):
    """
    [All Users] Retrieve all notifications for the current user.
    
    Returns notifications sorted by date (newest first).
    """
    return await NotificationService.get_user_notifications(current_user)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    [All Users] Mark a notification as read.
    
    Users can only mark their own notifications as read.
    """
    return await NotificationService.mark_as_read(notification_id, current_user)


@router.put("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user)
):
    """
    [All Users] Mark all notifications as read for the current user.
    
    Returns the number of notifications marked as read.
    """
    count = await NotificationService.mark_all_as_read(current_user)
    return {"message": f"Marked {count} notifications as read", "count": count}

