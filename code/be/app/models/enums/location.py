from enum import Enum


class LocationMode(str, Enum):
    """Location mode for tutoring sessions and availability slots."""
    ONLINE = "ONLINE"  # Online session (location will be a meeting link)
    CAMPUS_1 = "CAMPUS_1"  # Campus 1 - Lý Thường Kiệt
    CAMPUS_2 = "CAMPUS_2"  # Campus 2 - Dĩ An
