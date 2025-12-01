// File: app/api/datacore/sync-log/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Giả lập dữ liệu log trả về
  const mockLogs = [
    {
      id: "LOG-001",
      at: new Date().toISOString(),
      actor: "system",
      scope: "all",
      status: "OK",
      details: "Auto sync success",
    },
    {
      id: "LOG-002",
      at: new Date(Date.now() - 3600000).toISOString(),
      actor: "admin",
      scope: "users",
      status: "PARTIAL",
      details: "Some users failed",
    },
  ];

  return NextResponse.json(mockLogs);
}