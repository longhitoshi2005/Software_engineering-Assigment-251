import { NextResponse } from "next/server";
import { syncLogs } from "@/lib/mocks/db/syncLog";

export async function GET() {
  return NextResponse.json(syncLogs);
}
