from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# --- Shared Components ---
class TutorStatsResponse(BaseModel):
    """Aggregated statistics derived from sessions and feedback."""
    average_rating: float
    total_feedbacks: int
    total_sessions: int
    
    total_students: int
    response_rate: int

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

class TutorUpdateRequest(BaseModel):
    """
    Payload for a Tutor to update their own profile details.
    (FR-UM.01)
    """
    display_name: Optional[str] = None
    bio: Optional[str] = None
    tags: Optional[List[str]] = None # Keywords for search (e.g., Python, C++)
    status: Optional[str] = None # TutorStatus Enum value (e.g., "AVAILABLE", "BUSY")

# --- RESPONSE SCHEMAS ---

class AssignTutorResponse(BaseModel):
    """Response returned after a batch assignment attempt."""
    success_count: int
    failed_emails: List[str] # Emails that failed (e.g., user not found/not synced from SSO)

class TutorResponse(BaseModel):
    """
    The full public profile of a Tutor, used for search results and detail views.
    """
    id: str # TutorProfile ObjectId
    user_id: str # Internal User ObjectId
    display_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    tags: List[str] = []
    status: str # Tutor's current availability status
    
    subjects: List[TeachingSubjectResponse] = []
    stats: TutorStatsResponse
    
    is_lecturer: bool