from typing import List, Optional, Annotated
from datetime import datetime, timezone
from enum import Enum

from beanie import Document, Indexed, Link
from pydantic import BaseModel, Field

# Local Imports (Assumed structure)
from .user import User
from ..external.course import Course

# --- ENUMS (STRICTLY ENGLISH) ---

class TutorStatus(str, Enum):
    """Tutor's current availability status."""
    AVAILABLE = "AVAILABLE"  # Ready to accept new sessions
    BUSY = "BUSY"            # Has ongoing sessions but can take more later
    OFFLINE = "OFFLINE"        # Temporarily inactive for the period

# --- SUB-MODELS ---

class TutorStats(BaseModel):
    """Key performance and reputation metrics."""
    average_rating: float = 0.0
    total_feedbacks: int = 0
    total_sessions: int = 0
    total_students: int = 0
    response_rate: int = 100

class TeachingSubject(BaseModel):
    """
    Represents a subject that the tutor is authorized to teach.
    Stored inside a list in TutorProfile.
    """
    course_ref: Link[Course]
    is_main_expertise: bool = False
    description: Optional[str] = None 

# --- MAIN DOCUMENT ---

class TutorProfile(Document):
    """
    Tutor Profile Document.
    Stores application-specific data for Tutors (expertise, stats, status).
    """
    # 1. Identity Link (Link to Internal User Account)
    # Using Indexed helper for quick lookup and unique constraint
    user: Annotated[Link[User], Indexed(unique=True)]
    
    # 2. Professional Info
    display_name: str
    bio: Optional[str] = None
    tags: List[str] = [] # Keywords for search optimization
    
    # 3. Status (Now consistent with DB data)
    status: TutorStatus = TutorStatus.AVAILABLE
    
    # 4. Expertise (The Whitelist of courses the tutor is authorized to teach)
    teaching_subjects: List[TeachingSubject] = []
    
    # 5. Stats
    stats: TutorStats = TutorStats()
    
    # 6. Personal Avatar (Tutor can upload custom avatar separate from university photo)
    avatar_url: Optional[str] = None
    avatar_public_id: Optional[str] = None  # Cloudinary public ID for deletion
    
    # 7. Metadata (Using UTC for consistency)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "tutor_profiles"
        indexes = [
            [("user", 1), ("teaching_subjects.course_ref", 1)],
        ]