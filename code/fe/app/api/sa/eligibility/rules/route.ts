export async function GET() {
  return Response.json({
    minSessions: 4,
    minFeedback: 75
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({
    success: true,
    updatedRules: body
  });
}

