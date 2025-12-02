from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from app.models.enums.location import LocationMode

# --- Shared Components ---
class TutorStatsResponse(BaseModel):
    """Aggregated statistics derived from sessions and feedback."""
    average_rating: float
    total_feedbacks: int
    total_sessions: int
    
    total_students: int
    response_rate: int

class ClosestAvailability(BaseModel):
    """Represents the closest available time slot for a tutor."""
    start_time: datetime
    end_time: datetime
    allowed_modes: List[LocationMode]

class TeachingSubjectResponse(BaseModel):
    """Represents a single course a tutor is authorized to teach."""
    course_code: str
    course_name: str
    description: Optional[str] = None # Tutor's note on their expertise in this subject

# --- REQUEST SCHEMAS ---

class AssignTutorRequest(BaseModel):
    """
    Payload for Admin/Dept Chair to grant TUTOR rights to existing users.
    (FR-MAT.04)
    """
    emails: List[EmailStr]

class TutorSearchRequest(BaseModel):
    """
    Payload for searching tutors with various filters.
    Used in student find-tutor page.
    """
    subject: Optional[str] = None  # Course code or subject name
    department: Optional[str] = None  # Department name
    tags: Optional[List[str]] = None  # Expertise tags
    mode: Optional[LocationMode] = None  # ONLINE, CAMPUS_1, or CAMPUS_2
    available_from: Optional[datetime] = None  # Start of availability window
    available_to: Optional[datetime] = None  # End of availability window
    limit: int = Field(20, ge=1, le=100)  # Max number of results
    offset: int = Field(0, ge=0)  # For pagination

class TutorUpdateRequest(BaseModel):
    """
    Payload for a Tutor to update their own profile details.
    (FR-UM.01)
    Section II editable fields: display_name, bio, tags, status, email_personal, avatar_url
    """
    display_name: Optional[str] = None
    bio: Optional[str] = None
    tags: Optional[List[str]] = None # Keywords for search (e.g., Python, C++)
    status: Optional[str] = None # TutorStatus Enum value (e.g., "AVAILABLE", "BUSY")
    email_personal: Optional[str] = None # Cross-model field: stored in User table
    avatar_url: Optional[str] = None # Personal avatar upload (stored in TutorProfile)

# --- RESPONSE SCHEMAS ---

class AssignTutorResponse(BaseModel):
    """Response returned after a batch assignment attempt."""
    success_count: int
    failed_emails: List[str] # Emails that failed (e.g., user not found/not synced from SSO)

class TutorResponse(BaseModel):
    """
    The full public profile of a Tutor, used for search results and detail views.
    Combines data from TutorProfile, User, and HCMUT_SSO for complete profile display.
    """
    id: str # TutorProfile ObjectId
    user_id: str # Internal User ObjectId
    
    # Section I: Identity & Authority (Read-only)
    full_name: str # From User snapshot
    sso_id: str # From HCMUT_SSO
    email_edu: str # From User snapshot
    academic_major: Optional[str] = None # From HCMUT_SSO.academic.major
    is_lecturer: bool # Derived from SSO identity_type
    
    # Section II: Management & Contact (Editable)
    display_name: str # From TutorProfile
    bio: Optional[str] = None # From TutorProfile
    tags: List[str] = [] # From TutorProfile
    status: str # From TutorProfile (TutorStatus enum)
    email_personal: Optional[str] = None # From User (private, editable)
    phone_number: Optional[str] = None # From HCMUT_SSO.contact (private, read-only)
    
    # Section III: Expertise & Reputation (Read-only, derived/admin-assigned)
    subjects: List[TeachingSubjectResponse] = []
    stats: TutorStatsResponse
    avatar_url: Optional[str] = None

class TutorSearchResult(BaseModel):
    """
    Tutor profile in search results with closest availability information.
    """
    id: str
    user_id: str
    
    # Identity
    full_name: str
    display_name: str
    email_edu: str
    academic_major: Optional[str] = None
    is_lecturer: bool
    
    # Profile
    bio: Optional[str] = None
    tags: List[str] = []
    status: str
    avatar_url: Optional[str] = None
    
    # Expertise
    subjects: List[TeachingSubjectResponse] = []
    stats: TutorStatsResponse
    
    # Availability
    closest_availability: Optional[ClosestAvailability] = None