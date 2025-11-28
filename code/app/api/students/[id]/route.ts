cdimport { NextResponse } from 'next/server';
import { STUDENTS } from '@/lib/mocks';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.indexOf('students') + 1];
    const student = STUDENTS.find((s) => String(s.id) === String(id));
    if (!student) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(student, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
