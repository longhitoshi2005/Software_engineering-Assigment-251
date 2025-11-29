import { NextResponse } from 'next/server';
import { ASSIGNMENTS, AUDIT_LOGS } from '@/lib/mocks';

// Simple stubbed POST handler to persist manual assignments in-memory (for demo/audit).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, tutorId, course, reason, slot, suggestionContext } = body;
    // derive coordinator from header (demo of server-side auth)
    const coordinatorId = request.headers.get('x-user-id') || null;
    const role = request.headers.get('x-user-role') || null;
    const allowedRoles = ['Coordinator', 'Coordinator Lead', 'ProgramAdmin', 'Admin'];
    if (!allowedRoles.some((r) => role?.includes(r))) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (!studentId || !tutorId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    // Persist to in-memory mock arrays so other pages can read it during the demo.
    try {
      ASSIGNMENTS.push(record as any);
      AUDIT_LOGS.push({ id: `log-${AUDIT_LOGS.length + 1}`, actorId: record.coordinatorId, actorRole: role || 'Coordinator', action: 'Manual assignment', resource: 'ManualAssignment', details: { assigned: `${tutorId}->${studentId}` }, createdAt });
    } catch (err) {
      // ignore persistence errors in the stub
    }

    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
