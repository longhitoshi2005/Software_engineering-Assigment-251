from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.enums.role import UserRole

class UserAcademicInfo(BaseModel):
    major_name: str
    class_code: str
    current_year: int
    status: str

class UserProfileUpdateRequest(BaseModel):
    """Request model for updating user profile (editable fields only)"""
    email_personal: Optional[str] = Field(None, description="Personal email address")
    phone_number: Optional[str] = Field(None, description="Phone number")

# 1. Short View (Cho Navbar/Context)
class UserShortResponse(BaseModel):
    user_id: str
    full_name: str
    avatar_url: Optional[str] = None
    roles: List[UserRole] # Trả về Enum để FE dễ switch case
    is_active: bool

# 2. Full Detail View (Cho trang Profile)
class UserDetailResponse(UserShortResponse):
    sso_id: str
    email_edu: str
    email_personal: Optional[str] = None

    phone_number: Optional[str] = None
    academic: Optional[UserAcademicInfo] = None