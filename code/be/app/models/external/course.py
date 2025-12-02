from typing import Annotated, Optional
from beanie import Document, Indexed, Link
from .faculty import Faculty


class Course(Document):
    name: str
    code: Annotated[str, Indexed(unique=True)]
    credits: int
    
    department: Optional[Link[Faculty]] = None 
    
    class Settings:
        name = "courses"