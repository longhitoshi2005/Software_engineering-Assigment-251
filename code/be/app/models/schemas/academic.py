from pydantic import BaseModel
from typing import Optional

class FacultyResponse(BaseModel):
    id: str
    name: str
    code: str

class MajorResponse(BaseModel):
    id: str
    name: str
    code: str
    faculty_code: str = "UNKNOWN"

class CourseResponse(BaseModel):
    id: str
    name: str
    code: str
    credits: int