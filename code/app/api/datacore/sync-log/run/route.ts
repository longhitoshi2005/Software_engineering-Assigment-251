import { NextResponse } from "next/server";
import { addSyncLog } from "@/lib/mocks/db/syncLog";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const scope = body.scope ?? "all";
  const status = body.status ?? "OK";
  const details = body.details ?? "manual sync";

  addSyncLog({
    actor: "admin",
    scope,
    status,
    details,
  });

  return NextResponse.json({
    success: true,
    message: "DATACORE sync executed (mock).",
  });
}
