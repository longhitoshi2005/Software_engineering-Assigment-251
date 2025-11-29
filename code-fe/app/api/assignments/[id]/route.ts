import { NextResponse } from 'next/server';
import { ASSIGNMENTS } from '@/lib/mocks';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.indexOf('assignments') + 1];
    const rec = ASSIGNMENTS.find((r: any) => String(r.id) === String(id));
    if (!rec) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(rec, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
