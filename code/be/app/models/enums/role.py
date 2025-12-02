from enum import Enum

class UserRole(str, Enum):
    # --- Roles Program ---
    STUDENT = "STUDENT"       # Thay cho MENTEE (Người học)
    TUTOR = "TUTOR"           # Người dạy
    
    # --- Roles Hệ thống & Quản lý ---
    ADMIN = "ADMIN"           # Quản trị hệ thống
    COORD = "COORD"           # Coordinator
    DEPT_CHAIR = "DEPT_CHAIR" # Trưởng khoa
    
    # --- Staff View-Only ---
    STAFF_SA = "STAFF_SA"     # Student Affairs
    STAFF_AA = "STAFF_AA"     # Academic Affairs