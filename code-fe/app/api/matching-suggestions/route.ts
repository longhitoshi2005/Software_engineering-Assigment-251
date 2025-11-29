import { NextResponse } from 'next/server';
import { TUTORS } from '@/lib/mocks';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    // enforce coordinator role for this endpoint in demo
    const role = request.headers.get('x-user-role') || null;
    if (!role || !role.includes('Coordinator')) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    // Demo: create a simple SuggestionContext with ranked tutors by workload
    const suggestions = TUTORS.slice(0, 5).map((t, i) => ({ suggestionId: `s-${Date.now()}-${i}`, generatedAt: new Date().toISOString(), rankedTutors: [{ tutorId: String(t.id), score: Math.max(0, 100 - (t.workload?.current || 0) * 5) }], prompt: `Suggest for ${studentId || 'student'}` }));
    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
