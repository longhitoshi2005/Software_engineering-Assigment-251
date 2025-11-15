# Ma trận Phân quyền — Phiên bản 1.0 (2025-11-13)

Các vai trò chính:
- `ProgramAdmin` — Quản trị viên Hệ thống (kỹ thuật, audit, tích hợp)
- `Coordinator` — Điều phối viên Vận hành (xử lý ngoại lệ, ghép thủ công)
- `DepartmentChair` — Trưởng Khoa/Bộ môn (báo cáo chất lượng khoa)
- `StudentAffairs` — Phòng Công tác Sinh viên (báo cáo tham gia, eligibility)

| Chức năng | Đường dẫn (gợi ý) | Vai trò được phép | API (gợi ý) | Ghi chú nghiệp vụ |
|---|---|---|---|---|
| Báo cáo Tham gia (Participation Report) | `/sa/report-participation` | `StudentAffairs` | `GET /api/sa/participation` | Thuộc SA (FR-RPT.03). Đã loại bỏ khỏi `/dept`. |
| Luật & Danh sách Đủ Điều Kiện (Eligibility) | `/sa/eligibility` | `StudentAffairs` | `GET /api/sa/eligibility`, `PUT /api/sa/eligibility` | SA cấu hình luật, export danh sách (FR-RPT.03). |
| Xuất báo cáo (SA nghiệp vụ) | `/sa/export` | `StudentAffairs` | `POST /api/exports` (reportType=sa_*) | Chỉ export các báo cáo nghiệp vụ của SA. Audit bắt buộc. |
| Báo cáo Khoa (Departmental Report) | `/dept/reports` | `DepartmentChair` | `GET /api/dept/reports` | Báo cáo chất lượng/hiệu suất khoa (FR-RPT.01). |
| Xuất báo cáo (Dept) | `/dept/export-buttons` | `DepartmentChair` | `POST /api/exports` (reportType=dept_*) | Chỉ export các báo cáo khoa. |
| Quản lý RBAC (Users & Roles) | `/admin/rbac` | `ProgramAdmin` | `GET/POST/PUT/DELETE /api/admin/users` | Tuyệt đối cấm `Coordinator`. |
| Quản lý Integrations (3rd-party) | `/admin/integrations` | `ProgramAdmin` | `GET/POST /api/admin/integrations` | Cấu hình kỹ thuật, không phải nghiệp vụ. |
| Tác vụ Hệ thống (backup/cleanup) | `/admin/system-tasks` | `ProgramAdmin` | `POST /api/admin/tasks` | Chỉ Admin thực hiện. |
| Xem / Xuất Audit Logs | `/admin/audit` | `ProgramAdmin` | `GET /api/admin/audit` | Audit logs bảo mật; export bị giới hạn. |
| Manual Match / Conflicts / Pending Assign | `/coord/manual-match`, `/coord/conflicts`, `/coord/pending-assign` | `Coordinator` | `POST/GET /api/coord/*` | Vận hành; xử lý ngoại lệ (FR-MAT.04, UC-02). |
| Xử lý Yêu cầu Sinh viên (Escalations) | `/coord/student-requests` | `Coordinator` | `GET/POST /api/coord/requests` | Coordinator xử lý request từ SV. |
| Giám sát Tutors / Availability | `/coord/tutors` | `Coordinator` | `GET /api/coord/tutors` | Giám sát lịch rảnh; không phải RBAC. |
| Xử lý Phản hồi (Issues / Flags) | `/coord/feedback-issues` | `Coordinator` | `GET /api/feedback/flags` | Coordinator xử lý flagged items; DeptChair có thể xem tổng hợp. |
| Dashboard Phản hồi (tổng hợp) | `/dept/feedback/dashboard` | `DepartmentChair` | `GET /api/dept/feedback/summary` | DeptChair xem báo cáo tổng hợp feedback. |
| Export hệ thống (Audit, System Health) | `/admin/exports` | `ProgramAdmin` | `POST /api/exports` (reportType=admin_*) | Chỉ Admin có quyền export hệ thống. |

---

Hướng dẫn thực thi (tóm tắt):
- Frontend: áp dụng soft-guards (ẩn/disable links & buttons theo role). Không xóa file ngay — làm soft-hide để thuận tiện rollback.
- Backend: tạo middleware kiểm tra `role` claim (JWT/session) trước khi trả dữ liệu hoặc thực hiện hành động (đặc biệt với `POST /api/exports`).
- Audit: tất cả hành động export/RBAC change/system-tasks phải ghi audit record (user, time, params, reportType).
- Export Service: xây dựng endpoint chung `POST /api/exports` với payload `{ reportType, filters }`. Endpoint phải validate role → enqueue job hoặc trả file; trả `403` nếu không có quyền.

Gợi ý `reportType` chuẩn:
- `sa_participation`, `sa_eligibility`, `dept_summary`, `admin_audit`, `admin_system_health`

Các bước tiếp theo đề xuất:
1. Review ma trận này với stakeholders (Admin, DeptChair, SA, Coordinator).
2. Implement frontend soft-guards (ẩn nút/route) và tạo PR.
3. Scaffold `POST /api/exports` mock & client helper; enforce role check server-side.
4. Sau khi soft-guards, thực hiện cleanup (move /dept/ReportsParticipation -> archive/remove) và cập nhật docs.
