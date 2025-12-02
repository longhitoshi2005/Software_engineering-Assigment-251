import { NextResponse } from "next/server";
import { getSessions, confirmSession } from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") || undefined;
  const upcomingOnly = url.searchParams.get("upcomingOnly") === "true";
  const limitParam = url.searchParams.get("limit");
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;
  const limit = limitParam ? Number(limitParam) : undefined;
  const allowedStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
  const status = statusParam && (allowedStatuses as readonly string[]).includes(statusParam)
    ? (statusParam as (typeof allowedStatuses)[number])
    : undefined;

  const data = await getSessions({
    status,
    upcomingOnly,
    from,
    to,
    limit,
  });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const { id, action } = body as { id?: string; action?: string };
    if (!id || !action) return NextResponse.json({ success: false, error: "id and action required" }, { status: 400 });

    if (action === "confirm") {
      const s = await confirmSession(id);
      if (!s) return NextResponse.json({ success: false, error: "session not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: s });
    }

    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "invalid json" }, { status: 400 });
  }
}
