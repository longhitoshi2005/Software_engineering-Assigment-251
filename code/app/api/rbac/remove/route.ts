import { NextResponse } from "next/server";
import { removeRole } from "@/lib/mocks/db/rbac";

export async function POST(req: Request) {
  const { userId, role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  removeRole(userId, role);

  return NextResponse.json({
    success: true,
    message: `Role ${role} removed from user ${userId}.`,
  });
}
