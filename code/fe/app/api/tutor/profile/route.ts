import { NextResponse } from "next/server";
import { getProfile, updateProfile } from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  const p = await getProfile();
  return NextResponse.json({ success: true, data: p });
}

export async function PUT(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const updated = await updateProfile(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: "invalid json" }, { status: 400 });
  }
}
