import { COORDINATOR_SESSIONS } from "@/lib/mocks/db/coord_sessions";

export async function GET() {
  return Response.json({ sessions: COORDINATOR_SESSIONS });
}
