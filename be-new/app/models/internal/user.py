from typing import Annotated, List, Optional
from datetime import datetime, timezone
from beanie import Document, Link, Indexed
from pydantic import Field
from app.models.enums.role import UserRole

# Import bảng SSO để Link sang
from ..external.hcmut_sso import HCMUT_SSO

class User(Document):
    """
    INTERNAL USER ACCOUNT (App Scope).
    This table manages the local user account and application-specific state.
    """
    
    # 1. EXTERNAL IDENTITY LINK (The Bridge)
    sso_info: Link[HCMUT_SSO] 

    # 2. SNAPSHOT FIELDS (Denormalization for display speed)
    full_name: str
    email_edu: str
    email_personal: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # 3. APP SPECIFIC DATA (System Roles)
    roles: List[UserRole] = [UserRole.STUDENT] # Default role upon entry
    is_active: bool = True # App-level access flag (can be used for banning)
    
    # 4. Audit
    last_login: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            [("email_edu", 1)]
        ]