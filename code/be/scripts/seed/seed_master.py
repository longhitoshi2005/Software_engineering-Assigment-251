import asyncio
import os
import sys
from enum import Enum

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.external.faculty import Faculty as FacultyModel
from app.models.external.major import Major as MajorModel
from app.models.external.course import Course as CourseModel

# --- DEFINITIONS CỦA BẠN (Được đưa vào đây để chạy) ---

class FacultyEnum(str, Enum):
    CE = "Civil Engineering"
    FPE = "Geology and Petroleum Engineering"
    AS = "Applied Science"
    ME = "Mechanical Engineering"
    CSE = "Computer Science and Engineering"
    ChE = "Chemical Engineering"
    SIM = "School of Industrial Management"
    EEE = "Electrical and Electronics Engineering"

class MajorEnum(str, Enum):
    CSE_CS = "Computer Science"
    CSE_CE = "Computer Engineering"
    ME_ME = "Mechanical Engineering"
    CE_CE = "Chemical Engineering"
    CE_CiE = "Civil Engineering"
    IM_IM = "Industrial Management"

class CourseEnum(str, Enum):
    CO3005 = "Công nghệ phần mềm"
    CO2003 = "Cấu trúc dữ liệu và giải thuật"
    AS1001 = "Nhập môn về kỹ thuật"
    AS1003 = "Cơ lý thuyết"

# --- LOGIC MAPPING (Major -> Faculty Code) ---
def get_faculty_code_for_major(major_key: str):
    if major_key.startswith("CSE_"): return "CSE"
    if major_key.startswith("ME_"): return "ME"
    if major_key.startswith("IM_"): return "SIM"
    if major_key.startswith("CE_CE"): return "ChE" # Chemical Engineering
    if major_key.startswith("CE_CiE"): return "CE" # Civil Engineering
    return "AS"

# --- MAIN SEED MASTER DATA ---

async def seed_master_data():
    print("✨ [1/3] SEEDING MASTER DATA (Faculties, Majors, Courses)...")
    await init_db()
    
    # Cache objects for linking
    faculty_cache = {}
    
    # ==========================================
    # A. SEED FACULTIES (KHOA)
    # ==========================================
    for f in FacultyEnum:
        faculty = FacultyModel(name=f.value, code=f.name)
        await faculty.save()
        faculty_cache[f.name] = faculty
        
    # ==========================================
    # B. SEED MAJORS (NGÀNH)
    # ==========================================
    for m in MajorEnum:
        fac_code = get_faculty_code_for_major(m.name)
        faculty_obj = faculty_cache.get(fac_code)
        
        if faculty_obj:
            await MajorModel(
                name=m.value, 
                code=m.name, 
                faculty=faculty_obj
            ).save()

    # ==========================================
    # C. SEED COURSES (MÔN HỌC)
    # ==========================================
    for c in CourseEnum:
        await CourseModel(
            name=c.value,
            code=c.name,
            credits=3
        ).save()
        
    print("   ✅ Master Data (Faculty, Major, Course) created successfully.")

if __name__ == "__main__":
    asyncio.run(seed_master_data())