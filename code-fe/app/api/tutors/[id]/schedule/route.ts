import { NextResponse } from 'next/server';
import { TUTORS } from '@/lib/mocks';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.indexOf('tutors') + 1];
    const tutor = TUTORS.find((t) => String(t.id) === String(id));
    if (!tutor) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const availability = tutor.slots || tutor.availability || [];
    const currentLoad = (tutor.workload && tutor.workload.current) || tutor.currentLoad || 0;
    return NextResponse.json({ availability, currentLoad }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
