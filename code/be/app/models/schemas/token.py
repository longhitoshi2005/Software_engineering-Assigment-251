from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
    # Trả thêm thông tin user để Frontend tiện dùng
    user_id: str
    role: str
    full_name: str