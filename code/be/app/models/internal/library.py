from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from beanie import Document, Link
from pydantic import Field

# Local Imports
from .user import User


# --- ENUMS ---

class ResourceType(str, Enum):
    """Type of library resource."""
    PDF = "PDF"
    VIDEO = "VIDEO"
    QUESTION_BANK = "QUESTION_BANK"
    PRESENTATION = "PRESENTATION"
    CODE = "CODE"
    OTHER = "OTHER"


class AccessLevel(str, Enum):
    """Access control level for resources."""
    PUBLIC = "PUBLIC"  # Anyone can access
    RESTRICTED = "RESTRICTED"  # Requires permission/role
    DEPARTMENT_ONLY = "DEPARTMENT_ONLY"  # Only department members
    TUTOR_ONLY = "TUTOR_ONLY"  # Only tutors and admins


class ResourceSource(str, Enum):
    """Source of the resource."""
    HCMUT_LIBRARY = "HCMUT_LIBRARY"
    TUTOR_UPLOADED = "TUTOR_UPLOADED"
    ADMIN_UPLOADED = "ADMIN_UPLOADED"


# --- MAIN DOCUMENT ---

class LibraryResource(Document):
    """
    FR-INT.04: Library Resource Linking
    Stores links to external documents/files uploaded to Cloudinary.
    """
    # 1. Ownership
    uploader: Link[User]
    
    # 2. Resource Details
    title: str
    description: Optional[str] = None
    resource_type: ResourceType
    author: Optional[str] = None  # Author name (for display)
    
    # 3. External Storage (Cloudinary)
    external_url: str  # The Cloudinary secure URL
    cloudinary_public_id: str  # For deletion/management
    
    # 4. Access Control & Organization
    access_level: AccessLevel = AccessLevel.PUBLIC  # Access control level
    is_public: bool = False  # Backward compatibility
    department: Optional[str] = None  # Department/Faculty (e.g., "Computer Science")
    source: ResourceSource = ResourceSource.TUTOR_UPLOADED  # Source of resource
    
    # 5. Metadata
    file_size: Optional[int] = None  # In bytes
    content: Optional[str] = None  # For text-based resources (question banks)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "library_resources"
        indexes = [
            # Index for querying by uploader
            [("uploader", 1), ("created_at", -1)],
            # Index for public resources
            [("is_public", 1), ("resource_type", 1)],
            # Index for access level queries
            [("access_level", 1), ("department", 1)],
            # Index for source and type
            [("source", 1), ("resource_type", 1)],
            # Index for Cloudinary public_id (for cleanup operations)
            [("cloudinary_public_id", 1)]
        ]
