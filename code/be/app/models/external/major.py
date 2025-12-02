from typing import Annotated
from beanie import Document, Indexed, Link
from .faculty import Faculty


class Major(Document):
    name: str           # Khoa học Máy tính
    code: Annotated[str, Indexed(unique=True)]  # CS
    
    faculty: Link[Faculty] 
    
    class Settings:
        name = "majors"