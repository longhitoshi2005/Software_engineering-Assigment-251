import { NextResponse } from "next/server";
import { adminSystemTasks } from "@/lib/mocks/db/adminSystemTasks";

export async function GET() {
  return NextResponse.json(adminSystemTasks);
}
