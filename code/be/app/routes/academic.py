from fastapi import APIRouter, Depends
from typing import List
from beanie import Link

from app.models.external.faculty import Faculty
from app.models.external.major import Major
from app.models.external.course import Course
from app.models.schemas.academic import FacultyResponse, MajorResponse, CourseResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/academic", tags=["Academic Data"])

@router.get("/faculties", response_model=List[FacultyResponse])
async def get_faculties(user=Depends(get_current_user)):
    """Lấy danh sách tất cả Khoa"""
    faculties = await Faculty.find_all().to_list()
    return [
        FacultyResponse(id=str(f.id), name=f.name, code=f.code)
        for f in faculties
    ]

@router.get("/majors", response_model=List[MajorResponse])
async def get_majors(faculty_id: str = None, user=Depends(get_current_user)):
    """Lấy danh sách Ngành (Filter theo Khoa)"""
    query = Major.find_all()
    if faculty_id:
        query = Major.find(Major.faculty.id == faculty_id)
    
    # Fetch links để lấy code của Faculty
    majors = await query.fetch_links().to_list()
    
    results = []
    for m in majors:
        # Xử lý an toàn link faculty
        fac_code = "UNKNOWN"
        if m.faculty and not isinstance(m.faculty, Link):
            fac_code = m.faculty.code
            
        results.append(MajorResponse(
            id=str(m.id),
            name=m.name,
            code=m.code,
            faculty_code=fac_code
        ))
    return results

@router.get("/courses", response_model=List[CourseResponse])
async def get_courses(search: str = None, limit: int = 50, user=Depends(get_current_user)):
    """Tìm kiếm Môn học"""
    query = Course.find_all()
    if search:
        query = Course.find(
            {"$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}}
            ]}
        )
    
    courses = await query.limit(limit).to_list()
    return [
        CourseResponse(id=str(c.id), name=c.name, code=c.code, credits=c.credits)
        for c in courses
    ]