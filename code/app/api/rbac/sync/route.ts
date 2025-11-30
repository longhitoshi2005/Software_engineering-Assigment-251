import { NextResponse } from "next/server";
import { syncRolesFromDatacore } from "@/lib/mocks/db/rbac";

export async function POST() {
  const result = syncRolesFromDatacore();

  return NextResponse.json({
    success: true,
    message: "Role sync from DATACORE completed (mock).",
    result,
  });
}
