import { COORD_SYSTEM_INFO, COORD_PERSONAL_INFO } from "@/lib/mocks/db/coord_profile";

export async function GET() {
  return Response.json({
    system: COORD_SYSTEM_INFO,
    personal: COORD_PERSONAL_INFO,
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  // mutate instead of reassign
  Object.assign(COORD_PERSONAL_INFO, body);

  return Response.json({
    ok: true,
    personal: COORD_PERSONAL_INFO,
  });
}