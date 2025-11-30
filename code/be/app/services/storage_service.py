from typing import Dict, Optional
from fastapi import UploadFile, HTTPException, status
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

from app.core.config import settings


class StorageService:
    """
    Service for managing external file storage using Cloudinary.
    Handles upload and deletion of resources.
    """
    
    _configured = False
    
    @staticmethod
    def _configure_cloudinary():
        """
        Configures Cloudinary with credentials from environment variables.
        Only configures once per application lifecycle.
        """
        if not StorageService._configured:
            cloudinary.config(
                cloud_name=settings.CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            StorageService._configured = True
    
    @staticmethod
    async def upload_document(file: UploadFile, folder: str = "tutor-system") -> Dict[str, str]:
        """
        Uploads a file to Cloudinary and returns the secure URL and public ID.
        
        Args:
            file: The file to upload (FastAPI UploadFile object)
            folder: The Cloudinary folder to upload to (default: "tutor-system")
            
        Returns:
            Dictionary containing:
                - secure_url: The HTTPS URL to access the file
                - public_id: The Cloudinary public ID for management/deletion
                - resource_type: The type of resource (image, raw, video, etc.)
                - bytes: File size in bytes
                
        Raises:
            HTTPException: If upload fails or file is invalid
        """
        # Ensure Cloudinary is configured
        StorageService._configure_cloudinary()
        
        try:
            # Read file content
            file_content = await file.read()
            
            # Validate file size (max 10MB for non-premium accounts)
            max_size = 10 * 1024 * 1024  # 10MB
            if len(file_content) > max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File size exceeds maximum allowed size of {max_size / 1024 / 1024}MB"
                )
            
            # Determine resource type based on file extension
            filename = file.filename or "unknown"
            extension = filename.split('.')[-1].lower() if '.' in filename else ''
            
            # Map extensions to Cloudinary resource types
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
            video_extensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm']
            
            if extension in image_extensions:
                resource_type = "image"
            elif extension in video_extensions:
                resource_type = "video"
            else:
                resource_type = "raw"  # For PDFs, documents, etc.
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file_content,
                folder=folder,
                resource_type=resource_type,
                use_filename=True,
                unique_filename=True,
                overwrite=False
            )
            
            # Extract and return relevant information
            return {
                "secure_url": upload_result.get("secure_url"),
                "public_id": upload_result.get("public_id"),
                "resource_type": upload_result.get("resource_type"),
                "bytes": upload_result.get("bytes", 0)
            }
            
        except cloudinary.exceptions.Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary upload failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"File upload failed: {str(e)}"
            )
        finally:
            # Reset file pointer for potential reuse
            await file.seek(0)
    
    @staticmethod
    async def delete_resource(public_id: str, resource_type: str = "raw") -> bool:
        """
        Deletes a resource from Cloudinary using its public ID.
        
        Args:
            public_id: The Cloudinary public ID of the resource
            resource_type: The type of resource (image, raw, video)
            
        Returns:
            True if deletion was successful, False otherwise
            
        Raises:
            HTTPException: If deletion fails
        """
        # Ensure Cloudinary is configured
        StorageService._configure_cloudinary()
        
        try:
            result = cloudinary.uploader.destroy(
                public_id,
                resource_type=resource_type,
                invalidate=True
            )
            
            # Check if deletion was successful
            if result.get("result") == "ok":
                return True
            else:
                return False
                
        except cloudinary.exceptions.Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary deletion failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Resource deletion failed: {str(e)}"
            )
    
    @staticmethod
    def generate_optimized_url(public_id: str, transformations: Optional[Dict] = None) -> str:
        """
        Generates an optimized URL for a Cloudinary resource with transformations.
        
        Args:
            public_id: The Cloudinary public ID
            transformations: Optional transformation parameters
            
        Returns:
            Optimized Cloudinary URL
        """
        StorageService._configure_cloudinary()
        
        url, _ = cloudinary_url(
            public_id,
            **(transformations or {})
        )
        return url
