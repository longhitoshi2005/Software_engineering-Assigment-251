import { NextResponse } from 'next/server';
import { CONFLICTS } from '@/lib/mocks';

export async function GET(request: Request) {
  try {
    // optional filter by department could be read from query
    return NextResponse.json(CONFLICTS, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
