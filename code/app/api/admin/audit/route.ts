import { NextResponse } from "next/server";
import { AUDIT_LOGS } from "@/lib/mocks/db/audit";
import { ensureAdminRole } from "@/lib/ensureAdminRole";

export async function GET(req: Request) {
  const ensure = ensureAdminRole(req.headers);
  if (!ensure.ok) return ensure.response;

  const { searchParams } = new URL(req.url);
  const actor = searchParams.get("actor")?.toLowerCase() || "";
  const eventType = searchParams.get("eventType")?.toLowerCase() || "";
  const resource = searchParams.get("resource")?.toLowerCase() || "";

  const results = AUDIT_LOGS.filter((log) => {
    return (
      (!actor || log.actorId.toLowerCase().includes(actor)) &&
      (!eventType || log.eventType.toLowerCase().includes(eventType)) &&
      (!resource || log.resource.toLowerCase().includes(resource))
    );
  });

  return NextResponse.json({ ok: true, results });
}
