from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ResourceUploadResponse(BaseModel):
    """Response model after uploading a resource."""
    id: str
    title: str
    resource_type: str
    external_url: str
    cloudinary_public_id: str
    file_size: Optional[int] = None
    is_public: bool
    access_level: str  # "PUBLIC", "RESTRICTED", etc.
    department: Optional[str] = None
    source: str  # "HCMUT_LIBRARY", "TUTOR_UPLOADED", etc.
    uploader_name: str
    author: Optional[str] = None
    created_at: datetime
    message: str = "Resource uploaded successfully"


class ResourceResponse(BaseModel):
    """Response model for resource details."""
    id: str
    title: str
    description: Optional[str] = None
    resource_type: str
    external_url: str  # URL for backend
    link: Optional[str] = None  # Alias for frontend compatibility
    uploader_id: str
    uploader_name: str
    author: Optional[str] = None  # Author name for display
    is_public: bool
    access_level: str  # "PUBLIC", "RESTRICTED", etc.
    access: str  # Frontend compatibility: "ALLOWED" or "RESTRICTED"
    department: Optional[str] = None
    source: str  # "HCMUT_LIBRARY" or "TUTOR_UPLOADED"
    file_size: Optional[int] = None
    content: Optional[str] = None  # For question banks
    created_at: datetime


class ResourceAttachResponse(BaseModel):
    """Response model for attaching resource to session."""
    session_id: str
    resource_id: str
    message: str = "Resource attached to session successfully"
