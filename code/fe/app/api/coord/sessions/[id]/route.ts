import { COORDINATOR_SESSIONS } from "@/lib/mocks/db/coord_sessions";

export async function PATCH(req: Request, { params }: any) {
  const session = COORDINATOR_SESSIONS.find(s => s.id === params.id);

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await req.json();

  if (body.resolveIssue === true) {
    session.issueFlag = null;
  }

  return Response.json({ ok: true, session });
}
