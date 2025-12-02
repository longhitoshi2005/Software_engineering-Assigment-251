#!/bin/bash
set -e

echo "Waiting for MongoDB to be ready..."
sleep 5

echo "Running database seed..."
python /code/scripts/seed/run_all_seeds.py

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
