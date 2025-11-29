from fastapi import APIRouter, Depends, HTTPException, status
from beanie import Link

from app.models.internal.user import User
from app.core.deps import get_current_user
from app.models.schemas.user import UserShortResponse, UserDetailResponse, UserAcademicInfo

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserShortResponse)
async def get_me_short(current_user: User = Depends(get_current_user)):
    """
    Retrieves the minimal user information (snapshots) required for the Navbar and Authentication Context.
    This API is designed to be fast, requiring only a single query to the internal User table.
    """
    return UserShortResponse(
        user_id=str(current_user.id),
        full_name=current_user.full_name, 
        avatar_url=current_user.avatar_url,
        roles=current_user.roles,
        is_active=current_user.is_active
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
        
        # Detail info (mostly from SSO)
        sso_id=sso.identity_id,
        email_edu=current_user.email_edu,
        email_personal=current_user.email_personal,
        
        # Note: phone_number is not snapshotted, so it must be accessed via the fetched SSO object
        phone_number=sso.contact.phone_number if sso.contact else None,
        academic=academic_data
    )