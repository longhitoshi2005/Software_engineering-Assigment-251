from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from app.models.internal.session import SessionStatus, RequestType # Assumed Status Enum
from app.models.enums.location import LocationMode


# --- NEGOTIATION SCHEMAS ---

class NegotiationResponse(BaseModel):
    """Data representing the counter-proposal sent by the Tutor."""
    new_topic: Optional[str] = None
    new_start_time: Optional[datetime] = None
    new_end_time: Optional[datetime] = None
    new_mode: Optional[LocationMode] = None
    new_location: Optional[str] = None # New physical location or meeting link
    tutor_message: str

    new_max_capacity: Optional[int] = None # Tutor's proposed capacity change
    new_is_public: Optional[bool] = None   # Tutor's proposed publicity status

class NegotiationCreateRequest(BaseModel):
    """Payload for Tutor to propose a change (counter-offer) to the student's initial request."""
    new_topic: str = Field(..., description="The topic/name of the session (required)")
    new_start_time: Optional[datetime] = None
    new_end_time: Optional[datetime] = None
    new_mode: Optional[LocationMode] = None
    new_location: Optional[str] = None
    message: str # Message accompanying the counter-offer

    new_max_capacity: Optional[int] = Field(None, ge=1, description="Tutor's proposed capacity.")
    new_is_public: Optional[bool] = None

# --- AVAILABILITY SCHEMAS ---

class AvailabilityCreateRequest(BaseModel):
    """Payload for Tutor to create a new free time slot."""
    start_time: datetime
    end_time: datetime
    allowed_modes: List[LocationMode] = [LocationMode.ONLINE]

class AvailabilityResponse(BaseModel):
    """Response model for a tutor's available time slot."""
    id: str
    tutor_id: str
    start_time: datetime
    end_time: datetime
    allowed_modes: List[LocationMode]
    is_booked: bool

# --- SESSION SCHEMAS ---

class BookingRequest(BaseModel):
    """
    Payload for Student to initiate the booking process.
    """
    tutor_id: str
    course_code: str # Subject the student wants to learn
    start_time: datetime
    end_time: datetime
    mode: LocationMode = LocationMode.ONLINE
    location: Optional[str] = None # Meeting link (ONLINE) or specific room (CAMPUS_1/2)

    session_request_type: RequestType = RequestType.ONE_ON_ONE # Defines the intended enrollment structure

    # Used when RequestType is PRIVATE_GROUP: Emails of friends to be invited upon confirmation.
    invited_emails: Optional[List[str]] = None 

    # Used when RequestType is PUBLIC_GROUP (Student's preference for max size, if any)
    requested_max_capacity: Optional[int] = Field(None, ge=1) 
    note: Optional[str] = None

class SessionActionRequest(BaseModel):
    """Payload used for simple actions like Cancel/Reject."""
    reason: Optional[str] = None # Optional message (e.g., cancellation reason)

class SessionConfirmRequest(BaseModel):
    """
    Payload for Tutor to CONFIRM a session (or Student to ACCEPT a proposal).
    Tutor sets the final, locked capacity, publicity, and topic.
    """
    topic: str = Field(..., description="The specific topic or title of the session")
    max_capacity: int = Field(1, ge=1, description="The final maximum number of participants.")
    is_public: bool = Field(False, description="Final decision on whether the session is open for others to join.")
    final_location_link: Optional[str] = None # The finalized link or physical address

class SessionResponse(BaseModel):
    """The detailed output model for a single tutoring session."""
    id: str
    tutor_id: str
    tutor_name: str
    student_id: Optional[str] = None # ID of the session initiator (primary student, optional for public sessions)
    student_name: Optional[str] = None # Name of the session initiator, optional for public sessions
    
    course_code: str
    course_name: str
    topic: Optional[str] = None  # Session topic or title (set by tutor on confirmation)
    
    start_time: datetime
    end_time: datetime
    mode: LocationMode
    location: Optional[str] = None # Final meeting link or physical location
    
    status: SessionStatus
    proposal: Optional[NegotiationResponse] = None # Contains active negotiation terms

    created_at: Optional[datetime] = None
    
    # Session structure fields
    session_request_type: RequestType = RequestType.ONE_ON_ONE
    max_capacity: int = 1
    is_public: bool = False
    available_slots: Optional[int] = None  # Number of available slots (for public sessions)
    is_joined: Optional[bool] = None  # Whether current student has joined (for public sessions)
    is_requester: Optional[bool] = None  # Whether current student is the requester (students[0]) of public session
    note: Optional[str] = None
    
    # All students enrolled in this session
    students: Optional[List[dict]] = None  # List of {id, student_id, full_name, status}
    
    # Feedback status for current user (student only)
    feedback_status: Optional[str] = None
