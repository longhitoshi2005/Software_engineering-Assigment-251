"""  
Master orchestrator that runs all test data seeding in correct order.
This delegates to separate focused seed modules for better organization.
Run this after seed_master_data.py and seed_users.py.
"""
import asyncio
import os
import sys

sys.path.append(os.getcwd())

from scripts.seed.seed_availability import seed_availability_slots
from scripts.seed.seed_sessions import seed_sessions
from scripts.seed.seed_feedback import seed_feedback
from scripts.seed.seed_progress import seed_progress


async def seed_test_data():
    """
    Orchestrates all test data seeding in correct dependency order:
    1. Availability slots (independent)
    2. Sessions (depends on users/courses)
    3. Feedback (depends on sessions)
    4. Progress (depends on sessions)
    """
    print("🧪 [3/3] SEEDING TEST DATA (Sessions, Feedback, Progress, Availability)...")
    print("="*60)
    
    # Seed in correct dependency order
    await seed_availability_slots()
    print()
    
    await seed_sessions()
    print()
    
    await seed_feedback()
    print()
    
    await seed_progress()
    print()
    
    print("="*60)
    print("✅ ALL TEST DATA SEEDING COMPLETE!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(seed_test_data())
