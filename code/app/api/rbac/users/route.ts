import { NextResponse } from "next/server";
import { rbacUsers } from "@/lib/mocks/db/rbac";

export async function GET() {
  return NextResponse.json(rbacUsers);
}
