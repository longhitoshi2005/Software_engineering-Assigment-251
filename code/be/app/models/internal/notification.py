from typing import Optional, Annotated
from datetime import datetime
from enum import Enum

from beanie import Document, Link
from pydantic import Field

# Import user table
from .user import User
from .session import TutorSession

# --- ENUMS ---
class NotificationType(str, Enum):
    BOOKING_REQUEST = "BOOKING_REQUEST"
    NEGOTIATION_PROPOSAL = "NEGOTIATION_PROPOSAL"  # Tutor proposes changes to student's request
    SESSION_CONFIRMED = "SESSION_CONFIRMED"
    SESSION_REJECTED = "SESSION_REJECTED"
    SESSION_CANCELLED = "SESSION_CANCELLED"
    REMINDER = "REMINDER"
    FEEDBACK_REQUEST = "FEEDBACK_REQUEST"

# --- MAIN DOCUMENT ---
class Notification(Document):
    """
    FR-SCH.04 & FR-NI-01: Stores notification history and status.
    """
    # 1. Target
    receiver: Link[User] 
    
    # 2. Content & Type
    type: NotificationType
    title: str # Short summary for UI
    message: str # Full message content
    
    # 3. Context (Optional Link to the session that caused the notification)
    session: Optional[Link[TutorSession]] = None 

    # 4. Status
    is_read: bool = False
    is_delivered: bool = False # For email/push status
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"
        indexes = [
            # Index theo receiver để lấy nhanh list thông báo
            [("receiver", 1)]
        ]