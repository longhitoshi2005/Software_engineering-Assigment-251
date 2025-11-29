from typing import Optional, Annotated
from datetime import datetime
from enum import Enum

from beanie import Document, Indexed, Link
from pydantic import BaseModel

# Import Master Data
from .major import Major 

# --- ENUMS ---

class UniversityIdentity(str, Enum):
    STUDENT = "STUDENT"
    LECTURER = "LECTURER"
    STAFF = "STAFF"

class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class AccountStatus(str, Enum):
    ACTIVE = "Active"
    LOCKED = "Locked" 
    INACTIVE = "Inactive"

class StudentStatus(str, Enum):
    STUDYING = "Studying"
    RESERVED = "Reserved"
    SUSPENDED = "Suspended"
    GRADUATED = "Graduated"
    DROPPED = "Dropped"

class DegreeLevel(str, Enum):
    UNDERGRADUATE = "Undergraduate"
    GRADUATE = "Graduate"

class StaffStatus(str, Enum):
    WORKING = "Working"
    ON_LEAVE = "On leave"
    RESIGNED = "Resigned"

# --- SUB-MODELS ---

class ContactInfo(BaseModel):
    phone_number: Optional[str] = None
    email_edu: Annotated[str, Indexed(unique=True)] 
    email_personal: Optional[str] = None

class AcademicStatus(BaseModel):
    """
    Thông tin này vẫn cần giữ để biết sinh viên thuộc Khoa nào,
    nhằm mục đích Report thống kê cho Khoa đó.
    """
    major_link: Link[Major] 
    major: str
    class_code: str          
    current_year: int        
    
    degree_level: DegreeLevel = DegreeLevel.UNDERGRADUATE
    student_status: StudentStatus = StudentStatus.STUDYING
    
    # Giữ lại GPA tổng (nếu cần xét học bổng) hoặc có thể bỏ luôn nếu muốn private triệt để
    # Ở đây mình bỏ GPA chi tiết, chỉ giữ training_point cho CTSV
    training_point: int = 0  

class WorkInfo(BaseModel):
    department: str 
    position: str   
    work_status: StaffStatus = StaffStatus.WORKING

# --- MAIN DOCUMENT ---

class HCMUT_SSO(Document):
    """
    HCMUT_SSO Simulation
    """
    # 0. Login & auth support
    username: str
    password_hash: str

    # 1. Identity & Account
    identity_id: Annotated[str, Indexed(unique=True)] 
    identity_type: UniversityIdentity 
    account_status: AccountStatus = AccountStatus.ACTIVE
    
    # 2. Personal Info
    full_name: str
    gender: Gender
    date_of_birth: Optional[datetime] = None
    avatar_url: Optional[str] = None
    
    # 3. Contact
    contact: ContactInfo
    
    # 4. Context Data
    academic: Optional[AcademicStatus] = None
    work_info: Optional[WorkInfo] = None

    class Settings:
        name = "hcmut_sso_simulation"

    @property
    def is_student_active(self) -> bool:
        return (
            self.identity_type == UniversityIdentity.STUDENT and
            self.account_status == AccountStatus.ACTIVE and
            self.academic is not None and
            self.academic.student_status == StudentStatus.STUDYING
        )