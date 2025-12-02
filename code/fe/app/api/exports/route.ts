import { NextResponse } from 'next/server';

type ExportRequest = {
  reportType?: string;
  filters?: Record<string, any>;
};

const REPORT_ROLE_MAP: Record<string, string[]> = {
  sa_: ['StudentAffairs'],
  dept_: ['DepartmentChair'],
  admin_: ['ProgramAdmin'],
};

function allowedForRole(reportType: string | undefined, role: string | null) {
  if (!reportType || !role) return false;
  for (const prefix of Object.keys(REPORT_ROLE_MAP)) {
    if (reportType.startsWith(prefix)) {
      return REPORT_ROLE_MAP[prefix].includes(role);
    }
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const body: ExportRequest = await req.json();
    const reportType = body.reportType;
    // read role from header (frontend will set x-user-role) as mock auth
    const role = req.headers.get('x-user-role') || null;

    if (!allowedForRole(reportType, role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // Mock behaviour: enqueue or return small CSV sample
    // For demo, return a small CSV payload in body as text/plain
    const sampleCsv = 'id,name,score\n1,Example,100\n';

    return new NextResponse(sampleCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${reportType || 'export'}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}
