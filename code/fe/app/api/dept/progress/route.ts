import { NextResponse } from "next/server";
import { PROGRESS_LOGS } from "@/lib/mocks/db/progress";
import { ensureDeptRole } from "@/lib/ensureRole";

export async function GET(req: Request) {
  // — Check department permission
  const check = ensureDeptRole(req.headers);
  if (!check.ok) return check.response;

  return NextResponse.json(
    { ok: true, records: PROGRESS_LOGS },
    { status: 200 }
  );
}
