import { NextResponse } from 'next/server';

// Simple in-memory requests store for demo
const REQUESTS: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, subject, preferredTimes } = body;
    if (!studentId || !subject) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    const id = `REQ-${Date.now()}`;
    const rec = { id, studentId, subject, preferredTimes: preferredTimes || [], createdAt: new Date().toISOString() };
    REQUESTS.push(rec);
    return NextResponse.json({ requestId: id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
