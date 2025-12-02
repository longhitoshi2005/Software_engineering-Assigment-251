import { NextResponse } from "next/server";
import { FEEDBACK } from "@/lib/feedback-data";
import { ensureDeptRole } from "@/lib/ensureRole";

export async function GET(req: Request) {
  // Check permission
  const guard = ensureDeptRole(req.headers);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);

  // Lấy filters từ query params
  const course = searchParams.get("course") || "ALL";
  const minScore = Number(searchParams.get("minScore") || 0);

  // Filter logic giống UI
  const filtered = FEEDBACK.filter(f =>
    (course === "ALL" || f.course === course) &&
    f.score >= minScore
  );

  // Tính average như UI
  const avg =
    filtered.reduce((a, r) => a + r.score, 0) /
    (filtered.length || 1);

  return NextResponse.json({
    ok: true,
    count: filtered.length,
    avg: Number(avg.toFixed(2)),
    feedback: filtered
  });
}
