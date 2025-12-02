import { NextResponse } from 'next/server';
import { TUTORS } from '@/lib/mocks';

export async function GET(request: Request) {
  try {
    // Optional query filtering could be added (department, availability)
    return NextResponse.json(TUTORS, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tutors = Array.isArray(body.tutors) ? body.tutors : [body];
    // In demo, just acknowledge how many would be created
    return NextResponse.json({ created: tutors.length }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}
