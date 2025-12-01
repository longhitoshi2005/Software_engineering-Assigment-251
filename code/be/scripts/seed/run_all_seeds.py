#!/usr/bin/env python3
"""
Master Seed Script - Runs all seed operations in correct order
Usage: python scripts/seed/run_all_seeds.py
"""
import asyncio
import subprocess
import sys
import os

def run_script(script_name):
    """Run a Python script and check for errors"""
    print(f"\n{'='*60}")
    print(f"Running: {script_name}")
    print('='*60)
    
    result = subprocess.run(
        [sys.executable, f"scripts/seed/{script_name}"],
        capture_output=False,
        text=True
    )
    
    if result.returncode != 0:
        print(f"\n❌ ERROR: {script_name} failed with code {result.returncode}")
        sys.exit(1)
    
    print(f"✅ {script_name} completed successfully")

def main():
    print("\n" + "="*60)
    print("🌱 MASTER SEED SCRIPT - Full Database Reset & Seed")
    print("="*60)
    
    # Ensure we're in the correct directory (be/)
    if not os.path.exists("app/main.py"):
        print("❌ ERROR: Please run this script from the 'be/' directory")
        print("   Current directory:", os.getcwd())
        sys.exit(1)
    
    # Step 1: Clean database
    run_script("clean.py")
    
    # Step 2: Seed master data (faculties, majors, courses)
    run_script("seed_master.py")
    
    # Step 3: Seed users and profiles
    run_script("seed_users.py")
    
    # Step 4: Seed test data (sessions, feedback, progress, availability)
    run_script("seed_test_data.py")
    
    # Step 5: Seed notifications
    run_script("seed_notifications.py")
    
    print("\n" + "="*60)
    print("🎉 ALL SEED OPERATIONS COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\n📋 Summary:")
    print("   ✅ Database cleaned")
    print("   ✅ Master data seeded (Faculties, Majors, Courses)")
    print("   ✅ Users & profiles seeded")
    print("   ✅ Test data seeded (Sessions, Feedback, Progress, Availability)")
    print("   ✅ Notifications seeded")
    print("\n🔑 Test Accounts:")
    print("   - head.cse / 123 (Admin/Dept Chair)")
    print("   - tuan.pham / 123 (Lecturer Tutor)")
    print("   - student_gioi / 123 (Student Tutor)")
    print("   - lan.tran / 123 (Student Mentee)")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
