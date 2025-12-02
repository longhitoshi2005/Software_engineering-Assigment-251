import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;

  const snapshot = await getDashboardSnapshot();
  return NextResponse.json({ success: true, data: snapshot });
}
