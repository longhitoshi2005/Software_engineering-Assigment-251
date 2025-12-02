from typing import Annotated
from beanie import Document, Indexed


class Faculty(Document):
    name: str
    code: Annotated[str, Indexed(unique=True)]
    
    class Settings:
        name = "faculties"