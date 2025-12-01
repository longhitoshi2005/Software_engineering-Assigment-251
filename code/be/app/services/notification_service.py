from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status

# Models
from app.models.internal.user import User
from app.models.internal.notification import Notification, NotificationType
from app.models.internal.session import TutorSession

# Schemas
from app.models.schemas.notification import NotificationResponse


class NotificationService:
    """
    Service for managing user notifications.
    Handles creation and retrieval of system notifications for session events.
    """

    @staticmethod
    async def create_system_notification(
        receiver_user: User,
        n_type: NotificationType,
        session: Optional[TutorSession] = None,
        extra_message: str = ""
    ) -> Notification:
        """
        Creates and saves a system notification.
        
        Args:
            receiver_user: The user who will receive the notification
            n_type: The type of notification
            session: Optional session reference
            extra_message: Additional context message
            
        Returns:
            The created Notification document
        """
        # Generate title and message based on notification type
        title, message = NotificationService._generate_notification_content(
            n_type, 
            session, 
            extra_message
        )
        
        # Create notification
        notification = Notification(
            receiver=receiver_user,
            type=n_type,
            title=title,
            message=message,
            session=session,
            is_read=False,
            is_delivered=False,
            created_at=datetime.now(timezone.utc)
        )
        
        await notification.save()
        return notification

    @staticmethod
    def _generate_notification_content(
        n_type: NotificationType,
        session: Optional[TutorSession],
        extra_message: str
    ) -> tuple[str, str]:
        """
        Generates appropriate title and message based on notification type.
        
        Args:
            n_type: The notification type
            session: Optional session reference
            extra_message: Additional context
            
        Returns:
            Tuple of (title, message)
        """
        if n_type == NotificationType.BOOKING_REQUEST:
            title = "New Booking Request"
            message = f"You have a new tutoring session request. {extra_message}"
            
        elif n_type == NotificationType.NEGOTIATION_PROPOSAL:
            title = "Session Proposal"
            message = f"The tutor has proposed changes to your session. {extra_message}"
            
        elif n_type == NotificationType.SESSION_CONFIRMED:
            title = "Session Confirmed"
            message = f"Your tutoring session has been confirmed. {extra_message}"
            
        elif n_type == NotificationType.SESSION_REJECTED:
            title = "Session Rejected"
            message = f"Your session request was rejected. {extra_message}"
            
        elif n_type == NotificationType.SESSION_CANCELLED:
            title = "Session Cancelled"
            message = f"A tutoring session has been cancelled. {extra_message}"
            
        elif n_type == NotificationType.REMINDER:
            title = "Session Reminder"
            message = f"Reminder: You have an upcoming session. {extra_message}"
            
        elif n_type == NotificationType.FEEDBACK_REQUEST:
            title = "Feedback Request"
            message = f"Please provide feedback for your completed session. {extra_message}"
            
        else:
            title = "Notification"
            message = extra_message
            
        return title, message

    @staticmethod
    async def get_user_notifications(user: User) -> List[NotificationResponse]:
        """
        Retrieves all notifications for a user, sorted by date (newest first).
        
        Args:
            user: The authenticated user
            
        Returns:
            List of notifications as NotificationResponse objects
        """
        notifications = await Notification.find(
            Notification.receiver.id == user.id
        ).sort("-created_at").to_list()
        
        return [
            NotificationResponse(
                id=str(n.id),
                type=n.type.value,
                title=n.title,
                message=n.message,
                session_id=str(n.session.ref.id) if n.session else None,
                is_read=n.is_read,
                created_at=n.created_at
            )
            for n in notifications
        ]

    @staticmethod
    async def mark_as_read(notification_id: str, user: User) -> NotificationResponse:
        """
        Marks a notification as read.
        
        Args:
            notification_id: The notification ID
            user: The authenticated user (must be the receiver)
            
        Returns:
            Updated NotificationResponse
            
        Raises:
            HTTPException: If notification not found or user not authorized
        """
        notification = await Notification.get(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        # Verify user is the receiver
        if notification.receiver.ref.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only mark your own notifications as read"
            )
        
        # Update notification
        notification.is_read = True
        await notification.save()
        
        return NotificationResponse(
            id=str(notification.id),
            type=notification.type.value,
            title=notification.title,
            message=notification.message,
            session_id=str(notification.session.ref.id) if notification.session else None,
            is_read=notification.is_read,
            created_at=notification.created_at
        )

    @staticmethod
    async def mark_all_as_read(user: User) -> int:
        """
        Marks all unread notifications for a user as read.
        
        Args:
            user: The authenticated user
            
        Returns:
            Number of notifications marked as read
        """
        notifications = await Notification.find(
            Notification.receiver.id == user.id,
            Notification.is_read == False
        ).to_list()
        
        count = 0
        for notification in notifications:
            notification.is_read = True
            await notification.save()
            count += 1
        
        return count
