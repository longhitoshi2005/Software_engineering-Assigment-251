import { NextResponse } from "next/server";
import { getFeedbacks } from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  const url = new URL(request.url);
  const course = url.searchParams.get("course") || undefined;
  const minScore = url.searchParams.get("minScore");
  const qMin = minScore ? Number(minScore) : undefined;
  const data = await getFeedbacks({ courseCode: course, minScore: qMin });
  return NextResponse.json({ success: true, data });
}
