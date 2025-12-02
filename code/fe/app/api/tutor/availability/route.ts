import { NextResponse } from "next/server";
import { getAvailability, addAvailability } from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  // auth
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  const data = await getAvailability();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const { day, start, end, mode } = body ?? {};
    if (!day || !start || !end || !mode) {
      return NextResponse.json({ success: false, error: "day, start, end, mode are required" }, { status: 400 });
    }
    const added = await addAvailability({ day, start, end, mode });
    return NextResponse.json({ success: true, data: added }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
}
