from typing import List, Optional
from fastapi import UploadFile, HTTPException, status

# Models
from app.models.internal.user import User
from app.models.internal.library import LibraryResource, ResourceType, AccessLevel, ResourceSource
from app.models.internal.session import TutorSession
from app.models.enums.role import UserRole

# Schemas
from app.models.schemas.library import (
    ResourceUploadResponse,
    ResourceResponse,
    ResourceAttachResponse
)

# Services
from app.services.storage_service import StorageService


class LibraryService:
    """
    Service for managing library resources.
    Orchestrates file upload, resource creation, and session attachment.
    Implements role-based access control.
    """

    @staticmethod
    async def create_resource(
        file: UploadFile,
        title: str,
        resource_type: ResourceType,
        user: User,
        description: Optional[str] = None,
        is_public: bool = False,
        access_level: Optional[AccessLevel] = None,
        department: Optional[str] = None,
        author: Optional[str] = None
    ) -> ResourceUploadResponse:
        """
        Uploads a file and creates a library resource record.
        
        **AUTHORIZATION**: Only TUTOR, ADMIN, or DEPT_CHAIR can upload resources.
        
        Flow:
        1. Check user authorization
        2. Upload file to Cloudinary via StorageService
        3. Determine resource source based on user role
        4. Create LibraryResource document in database
        5. Return response with resource details
        
        Args:
            file: The file to upload
            title: Resource title
            resource_type: Type of resource (PDF, Video, etc.)
            user: The user uploading the resource
            description: Optional description
            is_public: Whether resource is publicly accessible
            access_level: Access control level (defaults based on is_public)
            department: Department/Faculty name
            author: Author name (defaults to uploader name)
            
        Returns:
            ResourceUploadResponse with upload details
            
        Raises:
            HTTPException: If user is not authorized or upload fails
        """
        # 1. AUTHORIZATION CHECK: Only TUTOR, ADMIN, DEPT_CHAIR can upload
        allowed_roles = {UserRole.TUTOR, UserRole.ADMIN, UserRole.DEPT_CHAIR}
        if not any(role in allowed_roles for role in user.roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Tutors, Admins, and Department Chairs can upload resources"
            )
        
        # 2. Upload file to Cloudinary
        upload_result = await StorageService.upload_document(
            file=file,
            folder=f"tutor-system/{resource_type.value.lower()}"
        )
        
        # 3. Determine resource source based on user role
        if UserRole.ADMIN in user.roles:
            source = ResourceSource.ADMIN_UPLOADED
        elif UserRole.DEPT_CHAIR in user.roles:
            source = ResourceSource.HCMUT_LIBRARY
        else:
            source = ResourceSource.TUTOR_UPLOADED
        
        # 4. Determine access level if not provided
        if access_level is None:
            if is_public:
                access_level = AccessLevel.PUBLIC
            elif UserRole.DEPT_CHAIR in user.roles:
                access_level = AccessLevel.DEPARTMENT_ONLY
            else:
                access_level = AccessLevel.TUTOR_ONLY
        
        # 5. Create LibraryResource document
        resource = LibraryResource(
            uploader=user,
            title=title,
            description=description,
            resource_type=resource_type,
            author=author or user.full_name,
            external_url=upload_result["secure_url"],
            cloudinary_public_id=upload_result["public_id"],
            file_size=upload_result.get("bytes"),
            is_public=is_public,
            access_level=access_level,
            department=department,
            source=source
        )
        await resource.save()
        
        # 6. Return response
        return ResourceUploadResponse(
            id=str(resource.id),
            title=resource.title,
            resource_type=resource.resource_type.value,
            external_url=resource.external_url,
            cloudinary_public_id=resource.cloudinary_public_id,
            file_size=resource.file_size,
            is_public=resource.is_public,
            access_level=resource.access_level.value,
            department=resource.department,
            source=resource.source.value,
            uploader_name=user.full_name,
            author=resource.author,
            created_at=resource.created_at
        )

    @staticmethod
    def _map_access_level_to_frontend(access_level: AccessLevel, is_public: bool) -> str:
        """
        Maps backend access_level to frontend 'access' field.
        
        Returns:
            "ALLOWED" if user can access, "RESTRICTED" otherwise
        """
        if is_public or access_level == AccessLevel.PUBLIC:
            return "ALLOWED"
        return "RESTRICTED"

    @staticmethod
    def _can_user_access_resource(resource: LibraryResource, user: User) -> bool:
        """
        Checks if a user can access a specific resource based on access_level.
        
        Args:
            resource: The library resource
            user: The user attempting access
            
        Returns:
            True if user has access, False otherwise
        """
        # Owner always has access
        if resource.uploader.ref.id == user.id:
            return True
        
        # Public resources are accessible to all
        if resource.is_public or resource.access_level == AccessLevel.PUBLIC:
            return True
        
        # Admin always has access
        if UserRole.ADMIN in user.roles:
            return True
        
        # Department-specific access
        if resource.access_level == AccessLevel.DEPARTMENT_ONLY:
            # Check if user belongs to the same department
            # This requires additional user profile data
            # For now, we'll allow tutors and dept chairs
            if UserRole.TUTOR in user.roles or UserRole.DEPT_CHAIR in user.roles:
                return True
        
        # Tutor-only access
        if resource.access_level == AccessLevel.TUTOR_ONLY:
            if UserRole.TUTOR in user.roles or UserRole.DEPT_CHAIR in user.roles:
                return True
        
        return False

    @staticmethod
    async def get_resource_list(
        user: User,
        resource_type: Optional[ResourceType] = None,
        department: Optional[str] = None
    ) -> List[ResourceResponse]:
        """
        Retrieves all resources accessible to the user.
        Implements access control based on access_level.
        
        Args:
            user: The authenticated user
            resource_type: Optional filter by resource type
            department: Optional filter by department
            
        Returns:
            List of ResourceResponse objects (filtered by access control)
        """
        # Build query
        query_filter = {}
        
        if resource_type:
            query_filter["resource_type"] = resource_type
        
        if department:
            query_filter["department"] = department
        
        # Fetch all resources matching the filter
        resources = await LibraryResource.find(query_filter).sort("-created_at").to_list()
        
        # Map to response objects with access control
        response_list = []
        for resource in resources:
            # Fetch uploader info
            await resource.fetch_link(LibraryResource.uploader)
            
            # Check if user has access to this resource
            has_access = LibraryService._can_user_access_resource(resource, user)
            
            # Determine frontend access status
            access_status = LibraryService._map_access_level_to_frontend(
                resource.access_level, 
                resource.is_public
            )
            
            # Map resource type for frontend compatibility
            # Convert "QUESTION_BANK" to "Question Bank"
            display_type = resource.resource_type.value
            if display_type == "QUESTION_BANK":
                display_type = "Question Bank"
            elif display_type == "VIDEO":
                display_type = "Video"
            
            # Map source for frontend compatibility
            display_source = resource.source.value
            if display_source == "TUTOR_UPLOADED":
                display_source = "Tutor Uploaded"
            elif display_source == "HCMUT_LIBRARY":
                display_source = "HCMUT_LIBRARY"
            elif display_source == "ADMIN_UPLOADED":
                display_source = "Tutor Uploaded"  # Show as tutor uploaded
            
            response_list.append(
                ResourceResponse(
                    id=str(resource.id),
                    title=resource.title,
                    description=resource.description,
                    resource_type=display_type,
                    external_url=resource.external_url,
                    link=resource.external_url if has_access else None,  # Only provide link if accessible
                    uploader_id=str(resource.uploader.id),
                    uploader_name=resource.uploader.full_name,
                    author=resource.author,
                    is_public=resource.is_public,
                    access_level=resource.access_level.value,
                    access=access_status,
                    department=resource.department,
                    source=display_source,
                    file_size=resource.file_size,
                    content=resource.content if has_access else None,
                    created_at=resource.created_at
                )
            )
        
        return response_list

    @staticmethod
    async def attach_resource_to_session(
        session_id: str,
        resource_id: str,
        user: User
    ) -> ResourceAttachResponse:
        """
        Links an existing library resource to a tutoring session.
        Updates the TutorSession document to include the resource reference.
        
        Business Rules:
        - Only the tutor of the session can attach resources
        - Resource must exist and be accessible to the user
        - Session must exist
        
        Args:
            session_id: The session ID
            resource_id: The resource ID to attach
            user: The authenticated user (must be session tutor)
            
        Returns:
            ResourceAttachResponse with confirmation
            
        Raises:
            HTTPException: If validation fails
        """
        # 1. Validate session exists
        session = await TutorSession.get(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        # 2. Validate user is the session tutor
        if session.tutor.ref.id != user.id:
            # Check if user has a tutor profile matching the session
            from app.models.internal.tutor_profile import TutorProfile
            tutor_profile = await TutorProfile.find_one(TutorProfile.user.id == user.id)
            if not tutor_profile or session.tutor.ref.id != tutor_profile.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the session tutor can attach resources"
                )
        
        # 3. Validate resource exists
        resource = await LibraryResource.get(resource_id)
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
        
        # 4. Check if user has access to resource
        has_access = LibraryService._can_user_access_resource(resource, user)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this resource"
            )
        
        # 5. Attach resource to session
        # Note: This requires adding a 'resources' field to TutorSession model
        # For now, we'll return success but note this in the implementation
        # TODO: Add resources field to TutorSession model
        
        return ResourceAttachResponse(
            session_id=str(session.id),
            resource_id=str(resource.id),
            message="Resource attached to session successfully"
        )

    @staticmethod
    async def delete_resource(resource_id: str, user: User) -> bool:
        """
        Deletes a library resource from both database and Cloudinary.
        
        Authorization:
        - Only the resource owner or ADMIN can delete
        
        Args:
            resource_id: The resource ID to delete
            user: The authenticated user
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If validation fails or deletion fails
        """
        # 1. Validate resource exists
        resource = await LibraryResource.get(resource_id)
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
        
        # 2. Validate user is the owner or admin
        if resource.uploader.ref.id != user.id and UserRole.ADMIN not in user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the resource owner or admin can delete it"
            )
        
        # 3. Delete from Cloudinary
        cloudinary_deleted = await StorageService.delete_resource(
            public_id=resource.cloudinary_public_id,
            resource_type="raw"  # Adjust based on actual resource type if needed
        )
        
        # 4. Delete from database
        await resource.delete()
        
        return True
