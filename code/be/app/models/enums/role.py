from enum import Enum

class UserRole(str, Enum):
    # --- Roles Program ---
    STUDENT = "STUDENT"       # Mentee
    TUTOR = "TUTOR"           # Tutor
    
    # --- Management Roles ---
    ADMIN = "ADMIN"           # System admin
    COORD = "COORD"           # Coordinator
    DEPT_CHAIR = "DEPT_CHAIR" # Department chair
    
    # --- Staff View-Only ---
    STAFF_SA = "STAFF_SA"     # Student Affairs
    STAFF_AA = "STAFF_AA"     # Academic Affairs