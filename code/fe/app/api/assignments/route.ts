import { NextResponse } from 'next/server';
import { ASSIGNMENTS, AUDIT_LOGS } from '@/src/lib/mocks';

// Simple stubbed POST handler to persist manual assignments in-memory (for demo/audit).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, tutorId, course, reason, slot, suggestionContext, coordinator } = body;
    if (!studentId || !tutorId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `MAN-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const record = {
      id,
      timestamp,
      coordinator: coordinator || 'coord-demo',
      studentId,
      tutorId,
      course: course || null,
      reason,
      slot: slot || null,
      suggestionContext: suggestionContext || null,
    };

    // Persist to in-memory mock arrays so other pages can read it during the demo.
    try {
      ASSIGNMENTS.push(record as any);
      AUDIT_LOGS.push({ id: AUDIT_LOGS.length + 1, timestamp, user: record.coordinator, action: 'Manual assignment', details: `Assigned ${tutorId} -> ${studentId}`, type: 'assignment' });
    } catch (err) {
      // ignore persistence errors in the stub
    }

    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
