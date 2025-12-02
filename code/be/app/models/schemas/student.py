from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- RESPONSE SCHEMAS ---

class StudentStatsResponse(BaseModel):
    """Student learning statistics"""
    total_learning_hours: float
    total_sessions: int
    total_tutors_met: int
    attendance_rate: int

class StudentResponse(BaseModel):
    """
    The full profile of a Student, structured in 3 sections like TutorResponse.
    Combines data from StudentProfile, User, and HCMUT_SSO.
    """
    id: str # StudentProfile ObjectId
    user_id: str # Internal User ObjectId
    
    # Section I: Identity & Academic Info (Read-only)
    full_name: str # From User snapshot
    sso_id: str # From HCMUT_SSO
    email_edu: str # From User snapshot
    academic_major: Optional[str] = None # From HCMUT_SSO.academic.major
    class_code: Optional[str] = None # From HCMUT_SSO.academic.class_code
    current_year: Optional[int] = None # From HCMUT_SSO.academic.current_year
    student_status: Optional[str] = None # From HCMUT_SSO.academic.student_status
    
    # Section II: Personal Contact & Profile (Editable)
    bio: Optional[str] = None # From StudentProfile (editable)
    email_personal: Optional[str] = None # From User (editable)
    phone_number: Optional[str] = None # From HCMUT_SSO.contact (read-only)
    avatar_url: Optional[str] = None # From StudentProfile (editable via upload)
    
    # Section III: Learning Profile (Read-only stats)
    stats: StudentStatsResponse

class StudentUpdateRequest(BaseModel):
    """
    Payload for a Student to update their profile.
    Section II editable fields: bio, email_personal (avatar via separate upload endpoint)
    """
    bio: Optional[str] = None
    email_personal: Optional[str] = None
