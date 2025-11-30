import { NextResponse } from "next/server";
import { adminSystemTaskHistory } from "@/lib/mocks/db/adminSystemTasks";

export async function GET() {
  return NextResponse.json(adminSystemTaskHistory);
}
