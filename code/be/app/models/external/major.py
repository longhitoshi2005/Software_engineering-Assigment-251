from typing import Annotated
from beanie import Document, Indexed, Link
from .faculty import Faculty


class Major(Document):
    name: str           # Khoa học Máy tính
    code: Annotated[str, Indexed(unique=True)]  # CS
    
    # Logic: Ngành này thuộc Khoa nào?
    faculty: Link[Faculty] 
    
    class Settings:
        name = "majors"