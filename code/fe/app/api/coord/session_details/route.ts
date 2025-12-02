import { SESSION_DETAILS } from "@/lib/mocks/db/coord_sessions";

export async function GET() {
  return Response.json({ sessions: SESSION_DETAILS });
}
