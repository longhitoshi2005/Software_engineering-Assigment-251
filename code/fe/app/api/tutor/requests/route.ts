import { NextResponse } from "next/server";
import { getRequests, listRequestsByStatus, updateRequestStatus } from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

const ALLOWED_STATUSES = ["NEW", "PENDING", "APPROVED", "REJECTED", "FORWARDED"] as const;
type RequestStatusValue = (typeof ALLOWED_STATUSES)[number];

type Action = "approve" | "reject" | "forward" | "reopen";

const ACTION_TO_STATUS: Record<Action, RequestStatusValue> = {
  approve: "APPROVED",
  reject: "REJECTED",
  forward: "FORWARDED",
  reopen: "PENDING",
};

export async function GET(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") || undefined;
  const cleanStatus = statusParam && (ALLOWED_STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as RequestStatusValue)
    : undefined;

  const data = cleanStatus ? await listRequestsByStatus(cleanStatus) : await getRequests();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;

  try {
    const body = await request.json();
    const { id, action, note } = body ?? {};
    if (!id || !action || !(action in ACTION_TO_STATUS)) {
      return NextResponse.json({ success: false, error: "id and action required" }, { status: 400 });
    }
    const status = ACTION_TO_STATUS[action as Action];
    const updated = await updateRequestStatus(id, status, note ?? null);
    if (!updated) {
      return NextResponse.json({ success: false, error: "request not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "invalid json" }, { status: 400 });
  }
}
