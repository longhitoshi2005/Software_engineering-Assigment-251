from fastapi import HTTPException, status
from datetime import datetime
from typing import Optional

# Models
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.session import TutorSession, SessionStatus

# Schemas
from app.models.schemas.report import WorkloadReportResponse


class ReportService:
    """
    Service for generating reports and analytics.
    """

    @staticmethod
    async def get_tutor_workload(
        tutor_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> WorkloadReportResponse:
        """
        Generates a workload report for a tutor using MongoDB aggregation.
        
        Calculates:
        - Total hours taught (sum of session durations for COMPLETED/CONFIRMED sessions)
        - Total sessions completed
        - Average session duration
        
        Args:
            tutor_id: The ID of the tutor
            start_date: Start of the reporting period
            end_date: End of the reporting period
            
        Returns:
            WorkloadReportResponse with workload statistics
            
        Raises:
            HTTPException: If tutor not found
        """
        
        # 1. Verify tutor exists
        tutor = await TutorProfile.get(tutor_id)
        if not tutor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tutor not found"
            )
        
        # Fetch tutor's user info for name
        tutor_user = await tutor.user.fetch()
        
        # 2. Build MongoDB aggregation pipeline
        pipeline = [
            # Stage 1: Match sessions for this tutor within date range
            {
                "$match": {
                    "tutor.$id": tutor.id,
                    "start_time": {"$gte": start_date, "$lte": end_date},
                    "status": {"$in": [SessionStatus.COMPLETED.value, SessionStatus.CONFIRMED.value]}
                }
            },
            # Stage 2: Calculate session duration and project fields
            {
                "$project": {
                    "duration_hours": {
                        "$divide": [
                            {"$subtract": ["$end_time", "$start_time"]},
                            3600000  # Convert milliseconds to hours
                        ]
                    },
                    "status": 1
                }
            },
            # Stage 3: Group and calculate statistics
            {
                "$group": {
                    "_id": None,
                    "total_hours": {"$sum": "$duration_hours"},
                    "total_sessions": {"$sum": 1},
                    "average_duration": {"$avg": "$duration_hours"}
                }
            }
        ]
        
        # 3. Execute aggregation
        results = await TutorSession.aggregate(pipeline).to_list()
        
        # 4. Process results
        if results and len(results) > 0:
            stats = results[0]
            total_hours = round(stats.get("total_hours", 0.0), 2)
            total_sessions = stats.get("total_sessions", 0)
            average_duration = round(stats.get("average_duration", 0.0), 2)
        else:
            # No sessions found in the period
            total_hours = 0.0
            total_sessions = 0
            average_duration = 0.0
        
        return WorkloadReportResponse(
            tutor_id=str(tutor.id),
            tutor_name=tutor_user.full_name,
            start_date=start_date,
            end_date=end_date,
            total_hours=total_hours,
            total_sessions=total_sessions,
            average_session_duration=average_duration
        )
