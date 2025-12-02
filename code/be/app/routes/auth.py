from fastapi import APIRouter, Response, status
from app.models.schemas.auth import LoginRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(data: LoginRequest, response: Response):
    # 1. Gọi Service lấy Token (chính là ObjectId)
    token = await AuthService.login_and_get_token(data.username, data.password)
    
    # 2. LƯU TOKEN VÀO COOKIE
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,   
        secure=False,    
        samesite="lax",
        max_age=60 * 60 * 24,
        path="/"
    )
    
    return {"message": "Login successful"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}