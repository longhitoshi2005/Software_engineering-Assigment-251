from fastapi import APIRouter, Depends, Query, status
from datetime import datetime
from app.core.deps import RoleChecker
from app.models.internal.user import User
from app.models.enums.role import UserRole
from app.models.schemas.report import WorkloadReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/workload", response_model=WorkloadReportResponse, status_code=status.HTTP_200_OK)
async def get_tutor_workload(
    tutor_id: str = Query(..., description="The ID of the tutor"),
    start_date: datetime = Query(..., description="Start date of the reporting period (ISO format)"),
    end_date: datetime = Query(..., description="End date of the reporting period (ISO format)"),
    current_user: User = Depends(RoleChecker([UserRole.STAFF_AA]))
):
    """
    [STAFF_AA] Get tutor workload dashboard.
    
    Generates a comprehensive workload report for a tutor including:
    - Total hours taught in the period
    - Total sessions completed
    - Average session duration
    
    This report uses MongoDB aggregation for efficient calculation
    based on TutorSession data (COMPLETED/CONFIRMED sessions only).
    
    Query Parameters:
    - tutor_id: ID of the tutor to generate report for
    - start_date: Start of reporting period (inclusive)
    - end_date: End of reporting period (inclusive)
    """
    return await ReportService.get_tutor_workload(tutor_id, start_date, end_date)
