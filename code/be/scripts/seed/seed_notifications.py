"""
Seed script for creating test notifications
"""
import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.internal.user import User
from app.models.internal.session import TutorSession
from app.models.internal.notification import Notification, NotificationType


async def seed_notifications():
    """
    Create sample notifications for testing the notification system.
    Creates notifications for various users with different types.
    """
    print("🔔 Seeding notifications...")
    
    # Fetch some users
    tutor = await User.find_one(User.email_edu == "tuan.pham@hcmut.edu.vn")
    student = await User.find_one(User.email_edu == "lan.tran@hcmut.edu.vn")
    
    if not tutor or not student:
        print("❌ Users not found. Please run seed_users first.")
        return
    
    # Fetch a session for context
    session = await TutorSession.find_one()
    
    # Clear existing notifications
    await Notification.delete_all()
    print("  Cleared existing notifications")
    
    # Create notifications for tutor
    tutor_notifications = [
        Notification(
            receiver=tutor,
            type=NotificationType.BOOKING_REQUEST,
            title="New Booking Request",
            message="You have a new tutoring session request from a student for Mathematics.",
            session=session,
            is_read=False,
            is_delivered=False,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=5)
        ),
        Notification(
            receiver=tutor,
            type=NotificationType.SESSION_CONFIRMED,
            title="Session Confirmed",
            message="Your upcoming session for Physics has been confirmed.",
            session=session,
            is_read=False,
            is_delivered=False,
            created_at=datetime.now(timezone.utc) - timedelta(hours=1)
        ),
        Notification(
            receiver=tutor,
            type=NotificationType.REMINDER,
            title="Session Reminder",
            message="Reminder: You have a session starting in 30 minutes.",
            session=session,
            is_read=True,
            is_delivered=True,
            created_at=datetime.now(timezone.utc) - timedelta(hours=3)
        ),
    ]
    
    # Create notifications for student
    student_notifications = [
        Notification(
            receiver=student,
            type=NotificationType.SESSION_CONFIRMED,
            title="Session Confirmed",
            message="Great news! Your tutoring session has been confirmed by the tutor.",
            session=session,
            is_read=False,
            is_delivered=False,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=10)
        ),
        Notification(
            receiver=student,
            type=NotificationType.FEEDBACK_REQUEST,
            title="Feedback Request",
            message="Please provide feedback for your completed session.",
            session=session,
            is_read=False,
            is_delivered=False,
            created_at=datetime.now(timezone.utc) - timedelta(hours=2)
        ),
        Notification(
            receiver=student,
            type=NotificationType.SESSION_CANCELLED,
            title="Session Cancelled",
            message="Unfortunately, your session for tomorrow has been cancelled. Please reschedule.",
            session=session,
            is_read=True,
            is_delivered=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        ),
        Notification(
            receiver=student,
            type=NotificationType.REMINDER,
            title="Session Reminder",
            message="Don't forget: Your session is starting in 1 hour!",
            session=session,
            is_read=False,
            is_delivered=False,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=30)
        ),
    ]
    
    # Save all notifications
    all_notifications = tutor_notifications + student_notifications
    for notification in all_notifications:
        await notification.save()
    
    print(f"  ✅ Created {len(tutor_notifications)} notifications for tutor")
    print(f"  ✅ Created {len(student_notifications)} notifications for student")
    print(f"  Total: {len(all_notifications)} notifications created")
    

async def main():
    await init_db()
    await seed_notifications()
    print("\n🎉 Notification seeding completed!")


if __name__ == "__main__":
    asyncio.run(main())
