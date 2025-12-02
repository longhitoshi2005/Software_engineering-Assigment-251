from datetime import datetime, timezone
from typing import Annotated, List
from beanie import Document, Link
from pydantic import Field

# Import local models
from .tutor_profile import TutorProfile 
from ..enums.location import LocationMode

class AvailabilitySlot(Document):
    """
    Tutor's declared time slot for consultation sessions.
    This resource is split or deleted upon session booking confirmation.
    """
    tutor: Link[TutorProfile]
    
    start_time: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    end_time: datetime
    
    # Location modes that tutor is willing to provide for this time slot
    allowed_modes: List[LocationMode] = [LocationMode.ONLINE]
    
    is_booked: bool = False 
    
    class Settings:
        name = "availability_slots"
        indexes = [
            [("tutor", 1), ("start_time", 1)], 
        ]