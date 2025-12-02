from typing import List, Optional
from beanie import PydanticObjectId
from fastapi import Cookie, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer # Used just for the security header definition/documentation
from app.models.internal.user import User
from app.models.enums.role import UserRole # Import the correct Role Enum

http_bearer_scheme = HTTPBearer()

# --- LEVEL 1: AUTHENTICATION (Authentication) ---

async def get_current_user(access_token: Optional[str] = Cookie(None)) -> User:
    """
    Authenticates the user by verifying the access_token (User ObjectId) in the cookie.
    Fetches the User object from the database for subsequent use.
    """
    if not access_token:
        # If the cookie is missing, request authentication (401)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated (No Cookie)")
    
    try:
        # 1. Validate format and convert the hex string to MongoDB's ObjectId
        user_id = PydanticObjectId(access_token)
    except:
        # If the string is not a valid ObjectId format
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Token Format")

    # 2. Query DB to fetch the User object (Authentication)
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    # 3. Check Account Status (Security)
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account inactive")

    return user

async def get_current_user_optional(access_token: Optional[str] = Cookie(None)) -> Optional[User]:
    """
    Optionally authenticates the user by verifying the access_token in the cookie.
    Returns None if not authenticated, otherwise returns the User object.
    """
    if not access_token:
        return None
    
    try:
        user_id = PydanticObjectId(access_token)
    except:
        return None

    user = await User.get(user_id)
    if not user or not user.is_active:
        return None

    return user

# --- LEVEL 2: AUTHORIZATION (Authorization) ---

class RoleChecker:
    """
    A dependency class that checks if the authenticated user possesses any of the allowed roles.
    """
    def __init__(self, allowed_roles: List[UserRole]):
        # Store the list of required roles (e.g., [UserRole.ADMIN, UserRole.TUTOR])
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        # Logic: Check if the intersection of required roles and user's roles is non-empty.
        
        # Convert user's roles (List[UserRole]) to a set of strings for intersection
        user_roles_set = {role.value for role in user.roles}
        allowed_roles_set = {role.value for role in self.allowed_roles}

        has_permission = bool(allowed_roles_set & user_roles_set)
        
        if not has_permission:
            # Raise 403 Forbidden if no required role is found
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You do not have permission to access this resource"
            )
        
        # Return the fully authenticated and authorized User object
        return user