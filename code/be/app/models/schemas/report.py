from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class WorkloadReportResponse(BaseModel):
    """Response model for tutor workload report."""
    tutor_id: str
    tutor_name: str
    start_date: datetime
    end_date: datetime
    total_hours: float
    total_sessions: int
    average_session_duration: float
