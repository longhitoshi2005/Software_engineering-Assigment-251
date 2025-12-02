from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from beanie import Link

from app.models.internal.user import User
from app.core.deps import get_current_user
from app.models.schemas.user import UserShortResponse, UserDetailResponse, UserAcademicInfo, UserProfileUpdateRequest
from app.services.storage_service import StorageService
from app.models.internal.student_profile import StudentProfile
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserShortResponse)
async def get_me_short(current_user: User = Depends(get_current_user)):
    """
    Retrieves the minimal user information (snapshots) required for the Navbar and Authentication Context.
    This API is designed to be fast, requiring only a single query to the internal User table.
    """
    # Fetch SSO info to get student_id (identity_id)
    student_id = None
    if isinstance(current_user.sso_info, Link):
        await current_user.fetch_link(User.sso_info)
    
    if current_user.sso_info:
        student_id = current_user.sso_info.identity_id
    
    return UserShortResponse(
        user_id=str(current_user.id),
        full_name=current_user.full_name, 
        avatar_url=current_user.avatar_url,
        roles=current_user.roles,
        is_active=current_user.is_active,
        student_id=student_id
    )

@router.get("/me/profile", response_model=UserDetailResponse)
async def get_me_full(current_user: User = Depends(get_current_user)):
    """
    Retrieves the full profile details, requiring data fetching from the external SSO cache.
    Used for the Profile Page and Settings screens.
    """
    # 1. Fetch data from SSO (External Identity)
    # The 'current_user' object only contains the Link to SSO. We must fetch the actual document.
    if isinstance(current_user.sso_info, Link):
        await current_user.fetch_link(User.sso_info)
    
    sso = current_user.sso_info
    if not sso:
        # Should only happen if the SSO link in the User document is corrupted.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SSO Data Sync Error: External identity record missing.")

    # 2. Map Academic Info (Only if user has academic data, e.g., is a Student)
    academic_data = None
    if sso.academic:
        # Note: The academic data is already snapshotted as strings/values in the SSO record, 
        # avoiding deep fetching here.
        
        academic_data = UserAcademicInfo(
            major_name=sso.academic.major, 
            class_code=sso.academic.class_code,
            current_year=sso.academic.current_year,
            status=sso.academic.student_status
        )

    # 3. Return Full Response (Merging User snapshots and SSO details)
    return UserDetailResponse(
        # Base info (from User snapshot)
        user_id=str(current_user.id),
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        roles=current_user.roles,
        is_active=current_user.is_active,
        student_id=sso.identity_id,  # Add student_id from SSO
        
        # Detail info (mostly from SSO)
        sso_id=sso.identity_id,
        email_edu=current_user.email_edu,
        email_personal=current_user.email_personal,
        
        # Note: phone_number is not snapshotted, so it must be accessed via the fetched SSO object
        phone_number=sso.contact.phone_number if sso.contact else None,
        academic=academic_data
    )

@router.put("/me/profile", response_model=UserDetailResponse)
async def update_my_profile(
    payload: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Updates the user's editable profile fields (email_personal, phone_number).
    These fields are stored in both User (snapshot) and SSO (source of truth).
    """
    # 1. Fetch SSO to update source of truth
    if isinstance(current_user.sso_info, Link):
        await current_user.fetch_link(User.sso_info)
    
    sso = current_user.sso_info
    if not sso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SSO Data missing")
    
    # 2. Update SSO contact info
    if payload.email_personal is not None:
        sso.contact.email_personal = payload.email_personal
        current_user.email_personal = payload.email_personal
    
    if payload.phone_number is not None:
        sso.contact.phone_number = payload.phone_number
    
    # 3. Save both documents
    await sso.save()
    await current_user.save()
    
    # 4. Return updated profile using the same logic as get_me_full
    academic_data = None
    if sso.academic:
        academic_data = UserAcademicInfo(
            major_name=sso.academic.major,
            class_code=sso.academic.class_code,
            current_year=sso.academic.current_year,
            status=sso.academic.student_status
        )
    
    return UserDetailResponse(
        user_id=str(current_user.id),
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        roles=current_user.roles,
        is_active=current_user.is_active,
        student_id=sso.identity_id,  # Add student_id from SSO
        sso_id=sso.identity_id,
        email_edu=current_user.email_edu,
        email_personal=current_user.email_personal,
        phone_number=sso.contact.phone_number if sso.contact else None,
        academic=academic_data
    )

@router.post("/me/avatar", response_model=dict)
async def upload_student_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a custom avatar image (JPG, PNG) to Cloudinary for student.
    Deletes the old avatar if it exists to save storage space.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (JPG, PNG, GIF, WEBP) are allowed"
        )
    
    # Find student profile
    profile = await StudentProfile.find_one(StudentProfile.user.id == current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
    
    # Delete old avatar from Cloudinary if exists
    if profile.avatar_public_id:
        try:
            await StorageService.delete_resource(
                public_id=profile.avatar_public_id,
                resource_type="image"
            )
        except Exception as e:
            print(f"Warning: Failed to delete old avatar {profile.avatar_public_id}: {str(e)}")
    
    # Upload new avatar to Cloudinary
    upload_result = await StorageService.upload_document(
        file=file,
        folder="tutor-system/student-avatars"
    )
    
    # Update profile with new avatar URL and public_id
    profile.avatar_url = upload_result["secure_url"]
    profile.avatar_public_id = upload_result["public_id"]
    profile.updated_at = datetime.now()
    await profile.save()
    
    # Also update User model avatar_url for navbar display
    current_user.avatar_url = upload_result["secure_url"]
    await current_user.save()
    
    return {
        "avatar_url": upload_result["secure_url"],
        "message": "Avatar uploaded successfully"
    }