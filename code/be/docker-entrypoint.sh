#!/bin/bash
set -e

echo "Waiting for MongoDB to be ready..."
sleep 5

echo "Running database cleanup..."
python /code/scripts/seed/clean.py

echo "Seeding master data..."
python /code/scripts/seed/seed_master.py

echo "Seeding user data..."
python /code/scripts/seed/seed_users.py

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
