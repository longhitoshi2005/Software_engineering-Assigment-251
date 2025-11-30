from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    """Response model for notification."""
    id: str
    type: str
    title: str
    message: str
    session_id: Optional[str] = None
    is_read: bool
    created_at: datetime
