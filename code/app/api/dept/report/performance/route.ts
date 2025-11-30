import { NextResponse } from "next/server";
import { performanceData } from "@/lib/reports-data";
import { ensureDeptRole } from "@/lib/ensureRole";

export function GET(req: Request) {
  const guard = ensureDeptRole(req.headers);
  if (!guard.ok) return guard.response;

  return NextResponse.json(performanceData);
}
