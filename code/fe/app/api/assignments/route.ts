import { NextResponse } from 'next/server';
import { ASSIGNMENTS, AUDIT_LOGS } from '@/lib/mocks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, tutorId, course, reason, slot, suggestionContext } = body;
    
    // Lấy thông tin từ Header (được gửi từ Frontend)
    const coordinatorId = request.headers.get('x-user-id') || null;
    const role = request.headers.get('x-user-role') || ''; 

    // --- SỬA LỖI 403: CHUẨN HÓA ROLE ---
    // Chuyển role về chữ thường để so sánh (ví dụ: "Coordinator" -> "coordinator")
    const normalizedRole = role.toLowerCase();
    
    // Danh sách quyền hợp lệ (viết thường toàn bộ)
    const allowedRoles = ['coordinator', 'coordinator lead', 'programadmin', 'admin' , 'department'];

    // Kiểm tra quyền
    const hasPermission = allowedRoles.some((r) => normalizedRole.includes(r));

    if (!hasPermission) {
      console.log(`[API Blocked] Role '${role}' is not allowed.`);
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (!studentId || !tutorId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- LƯU DỮ LIỆU ---
    const id = `MAN-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const record = {
      id,
      studentId,
      tutorId,
      coordinatorId: coordinatorId || 'coord-demo',
      course: course || null,
      reason,
      slot: slot || null,
      suggestionContext: suggestionContext || null,
      createdAt,
    };

    // Lưu vào Mock Data (Bộ nhớ tạm)
    try {
      ASSIGNMENTS.push(record as any);
      AUDIT_LOGS.push({ 
        id: `log-${AUDIT_LOGS.length + 1}`, 
        actorId: record.coordinatorId, 
        actorRole: role || 'Coordinator', 
        action: 'Manual assignment', 
        resource: 'ManualAssignment', 
        details: { assigned: `${tutorId}->${studentId}` }, 
        createdAt 
      });
    } catch (err) {
      // Bỏ qua lỗi lưu vào mock
    }

    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (err: any) {
    console.error("Assignments API Error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}