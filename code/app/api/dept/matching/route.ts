import { NextResponse } from "next/server";
import { ensureDeptRole } from "@/lib/ensureRole";
import { DB_MATCH_SUGGESTED, DB_MATCH_RISKS } from "@/lib/mocks/db/matching";

export async function GET(req: Request) {
  // Kiểm tra role  
  const guard = ensureDeptRole(req.headers);
  if (!guard.ok) return guard.response;

  return NextResponse.json({
    ok: true,
    suggested: DB_MATCH_SUGGESTED,
    risks: DB_MATCH_RISKS
  });
}
