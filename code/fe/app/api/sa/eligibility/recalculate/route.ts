export async function POST(req: Request) {
  const { minSessions, minFeedback } = await req.json();
  return Response.json({
    success: true,
    criteria: { minSessions, minFeedback }
  });
}
