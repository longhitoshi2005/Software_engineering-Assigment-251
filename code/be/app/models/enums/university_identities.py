from enum import Enum

class UniversityIdentity(str, Enum):
    STUDENT = "STUDENT"
    LECTURER = "LECTURER"
    STAFF = "STAFF"
