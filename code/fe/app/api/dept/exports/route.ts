import { NextResponse } from "next/server";
import { EXPORT_JOBS, addExportJob } from "@/lib/mocks/db/exports";
import { ensureDeptRole } from "@/lib/ensureRole";

export async function GET(req: Request) {
  const check = ensureDeptRole(req.headers);
  if (!check.ok) return check.response;

  return NextResponse.json({ ok: true, jobs: EXPORT_JOBS }, { status: 200 });
}

export async function POST(req: Request) {
  const check = ensureDeptRole(req.headers);
  if (!check.ok) return check.response;

  const body = await req.json();

  if (!body.name) {
    return NextResponse.json(
      { error: "Missing field: name" },
      { status: 400 }
    );
  }

  const newJob = {
    id: `E-${300 + EXPORT_JOBS.length}`,
    name: body.name,
    at: new Date().toISOString(),
    status: "Queued" as const,
  };

  addExportJob(newJob);

  return NextResponse.json({ ok: true, job: newJob }, { status: 201 });
}
