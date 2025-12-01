"""
Utility script to recalculate tutor stats from existing data.
Run this after bulk imports or when stats appear incorrect.
"""
import asyncio
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import init_db
from app.services.tutor_service import TutorService


async def main():
    """Initialize DB and recalculate all tutor stats"""
    print("🔧 Initializing database connection...")
    await init_db()
    
    print("📊 Recalculating tutor stats from actual data...")
    result = await TutorService.recalculate_tutor_stats()
    
    print(f"✅ {result['message']}")


if __name__ == "__main__":
    asyncio.run(main())
