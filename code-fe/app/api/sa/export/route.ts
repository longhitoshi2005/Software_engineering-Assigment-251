export async function POST(req: Request) {
  const body = await req.json();

  console.log("SA Export requested:", body.type);

  return Response.json({
    success: true,
    message: "Export request accepted",
    fileUrl: null
  });
}
