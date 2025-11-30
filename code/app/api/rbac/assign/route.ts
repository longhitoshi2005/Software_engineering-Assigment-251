import { NextResponse } from "next/server";
import { assignRole } from "@/lib/mocks/db/rbac";

export async function POST(req: Request) {
  const { userId, role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  assignRole(userId, role);

  return NextResponse.json({
    success: true,
    message: `Role ${role} assigned to user ${userId}.`,
  });
}
