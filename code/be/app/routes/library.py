from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Query
from typing import List, Optional

from app.core.deps import get_current_user
from app.models.internal.user import User
from app.models.internal.library import ResourceType, AccessLevel
from app.models.schemas.library import (
    ResourceUploadResponse,
    ResourceResponse,
    ResourceAttachResponse
)
from app.services.library_service import LibraryService

router = APIRouter(prefix="/library", tags=["Library Resources"])


@router.post("/upload", response_model=ResourceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resource(
    file: UploadFile = File(..., description="The file to upload"),
    title: str = Form(..., description="Resource title"),
    resource_type: ResourceType = Form(..., description="Type of resource"),
    description: Optional[str] = Form(None, description="Optional description"),
    is_public: bool = Form(False, description="Make resource publicly accessible"),
    access_level: Optional[AccessLevel] = Form(None, description="Access control level"),
    department: Optional[str] = Form(None, description="Department/Faculty name"),
    author: Optional[str] = Form(None, description="Author name (defaults to uploader)"),
    current_user: User = Depends(get_current_user)
):
    """
    [TUTOR/ADMIN/DEPT_CHAIR ONLY] Upload a new library resource.
    
    **AUTHORIZATION**: Only users with TUTOR, ADMIN, or DEPT_CHAIR roles can upload.
    
    Uploads a file to Cloudinary and creates a library resource record.
    Supported file types: PDF, Video, Images, Documents, Code files, etc.
    
    Form Parameters:
    - file: The file to upload (multipart/form-data)
    - title: A descriptive title for the resource
    - resource_type: Type classification (PDF, VIDEO, QUESTION_BANK, etc.)
    - description: Optional detailed description
    - is_public: Whether to make the resource publicly accessible (default: False)
    - access_level: Access control level (PUBLIC, RESTRICTED, DEPARTMENT_ONLY, TUTOR_ONLY)
    - department: Department/Faculty name (e.g., "Computer Science")
    - author: Author name (defaults to uploader's full name)
    
    Maximum file size: 10MB (Cloudinary free tier limit)
    
    Access Control:
    - PUBLIC: Anyone can view
    - RESTRICTED: Only authorized users
    - DEPARTMENT_ONLY: Department members only
    - TUTOR_ONLY: Tutors and admins only
    """
    return await LibraryService.create_resource(
        file=file,
        title=title,
        resource_type=resource_type,
        user=current_user,
        description=description,
        is_public=is_public,
        access_level=access_level,
        department=department,
        author=author
    )


@router.get("/", response_model=List[ResourceResponse])
async def list_resources(
    resource_type: Optional[ResourceType] = Query(None, description="Filter by resource type"),
    department: Optional[str] = Query(None, description="Filter by department"),
    current_user: User = Depends(get_current_user)
):
    """
    [All Users] List all accessible library resources.
    
    Returns resources based on access control:
    - Resources uploaded by the current user
    - Public resources (access_level = PUBLIC or is_public = True)
    - Resources accessible based on user's role and department
    
    Query Parameters:
    - resource_type: Optional filter by resource type (PDF, VIDEO, QUESTION_BANK, etc.)
    - department: Optional filter by department name
    
    Resources are sorted by creation date (newest first).
    
    Frontend Compatibility:
    - Includes 'access' field: "ALLOWED" or "RESTRICTED"
    - Includes 'link' field (alias for external_url)
    - Converts enum values to frontend-friendly formats
    """
    return await LibraryService.get_resource_list(
        user=current_user,
        resource_type=resource_type,
        department=department
    )


@router.put("/sessions/{session_id}/resource/{resource_id}", response_model=ResourceAttachResponse)
async def attach_resource_to_session(
    session_id: str,
    resource_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    [Tutor] Attach a library resource to a tutoring session.
    
    Only the session tutor can attach resources.
    The resource must be owned by the tutor or be publicly available.
    
    Path Parameters:
    - session_id: The ID of the tutoring session
    - resource_id: The ID of the library resource to attach
    
    Use Case: Share study materials, recordings, or documents with session participants.
    """
    return await LibraryService.attach_resource_to_session(
        session_id=session_id,
        resource_id=resource_id,
        user=current_user
    )


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    [Resource Owner] Delete a library resource.
    
    Deletes the resource from both the database and Cloudinary storage.
    Only the resource owner can delete it.
    
    Path Parameters:
    - resource_id: The ID of the library resource to delete
    """
    await LibraryService.delete_resource(resource_id, current_user)
    return None
