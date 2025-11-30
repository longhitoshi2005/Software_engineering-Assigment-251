import { NextResponse } from "next/server";
import { DB_SESSIONS } from "@/lib/mocks/db/session";
import { ensureDeptRole } from "@/lib/ensureRole";

export async function GET(req: Request) {
  const guard = ensureDeptRole(req.headers);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();

  const filtered = DB_SESSIONS.filter(s =>
    `${s.id} ${s.course} ${s.tutor} ${s.student}`.toLowerCase().includes(q)
  );

  return NextResponse.json({
    ok: true,
    count: filtered.length,
    sessions: filtered,
  });
}
