"""
Seed availability slots for tutors.
Run this after seed_users.py.
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.availability import AvailabilitySlot
from app.models.enums.location import LocationMode


async def seed_availability_slots():
    """Create availability slots for tutors."""
    print("📅 SEEDING AVAILABILITY SLOTS...")
    await init_db()
    
    # Get users
    user_tuan = await User.find_one(User.email_edu == "tuan.pham@hcmut.edu.vn")
    user_gioi = await User.find_one(User.email_edu == "student_gioi@hcmut.edu.vn")
    
    if not user_tuan or not user_gioi:
        print("❌ ERROR: Users not found. Run seed_users.py first.")
        return
    
    # Get tutor profiles
    all_tutor_profiles = await TutorProfile.find_all().to_list()
    tutor_tuan = None
    tutor_gioi = None
    
    for tp in all_tutor_profiles:
        await tp.fetch_link(TutorProfile.user)
        if tp.user.id == user_tuan.id:
            tutor_tuan = tp
        elif tp.user.id == user_gioi.id:
            tutor_gioi = tp
    
    if not tutor_tuan or not tutor_gioi:
        print("❌ ERROR: Tutor profiles not found.")
        return
    
    now = datetime.now(timezone.utc)
    
    # Tutor Tuan's slots (next 2 weeks)
    slots_tuan = [
        AvailabilitySlot(
            tutor=tutor_tuan,
            start_time=now + timedelta(days=2, hours=9),
            end_time=now + timedelta(days=2, hours=11),
            allowed_modes=[LocationMode.ONLINE, LocationMode.CAMPUS_1]
        ),
        AvailabilitySlot(
            tutor=tutor_tuan,
            start_time=now + timedelta(days=3, hours=14),
            end_time=now + timedelta(days=3, hours=16),
            allowed_modes=[LocationMode.ONLINE]
        ),
        AvailabilitySlot(
            tutor=tutor_tuan,
            start_time=now + timedelta(days=5, hours=10),
            end_time=now + timedelta(days=5, hours=12),
            allowed_modes=[LocationMode.CAMPUS_1, LocationMode.CAMPUS_2]
        ),
        AvailabilitySlot(
            tutor=tutor_tuan,
            start_time=now + timedelta(days=7, hours=15),
            end_time=now + timedelta(days=7, hours=17),
            allowed_modes=[LocationMode.ONLINE]
        ),
        AvailabilitySlot(
            tutor=tutor_tuan,
            start_time=now + timedelta(days=10, hours=9),
            end_time=now + timedelta(days=10, hours=11),
            allowed_modes=[LocationMode.ONLINE, LocationMode.CAMPUS_1]
        ),
    ]
    
    # Tutor Gioi's slots
    slots_gioi = [
        AvailabilitySlot(
            tutor=tutor_gioi,
            start_time=now + timedelta(days=1, hours=18),
            end_time=now + timedelta(days=1, hours=20),
            allowed_modes=[LocationMode.ONLINE]
        ),
        AvailabilitySlot(
            tutor=tutor_gioi,
            start_time=now + timedelta(days=4, hours=19),
            end_time=now + timedelta(days=4, hours=21),
            allowed_modes=[LocationMode.ONLINE]
        ),
        AvailabilitySlot(
            tutor=tutor_gioi,
            start_time=now + timedelta(days=6, hours=18),
            end_time=now + timedelta(days=6, hours=20),
            allowed_modes=[LocationMode.ONLINE, LocationMode.CAMPUS_1]
        ),
    ]
    
    all_slots = slots_tuan + slots_gioi
    for slot in all_slots:
        await slot.save()
    
    print(f"✅ Created {len(all_slots)} availability slots")
    print(f"   - Tutor Tuan: {len(slots_tuan)} slots")
    print(f"   - Tutor Gioi: {len(slots_gioi)} slots")


if __name__ == "__main__":
    asyncio.run(seed_availability_slots())
