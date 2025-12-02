import { NextResponse } from 'next/server';
import { AUDIT_LOGS } from '@/lib/mocks';

export async function GET(request: Request) {
  try {
    const role = request.headers.get('x-user-role') || null;
    const allowed = ['ProgramAdmin', 'Admin', 'Audit'];
    if (!role || !allowed.some((r) => role.includes(r))) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    const actorId = url.searchParams.get('actorId');
    let items = AUDIT_LOGS as any[];
    if (actorId) items = items.filter((i) => String(i.actorId || i.user) === String(actorId));
    // naive since filtering when timestamp present
    if (since) items = items.filter((i) => new Date(i.createdAt || i.timestamp || 0).getTime() >= new Date(since).getTime());
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
