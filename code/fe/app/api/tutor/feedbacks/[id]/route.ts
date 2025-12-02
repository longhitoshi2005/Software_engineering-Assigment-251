import { NextResponse } from "next/server";
import { getFeedbackById } from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  try {
    const url = new URL(request.url);
    // path looks like /api/tutor/feedbacks/{id}
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];
    const item = await getFeedbackById(id);
    if (!item) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return NextResponse.json({ success: false, error: "bad request" }, { status: 400 });
  }
}
