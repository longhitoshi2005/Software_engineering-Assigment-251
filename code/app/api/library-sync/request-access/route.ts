import { NextResponse } from "next/server";
import { requestLibraryAccess } from "@/lib/mocks/db/librarySync";

export async function POST(req: Request) {
  const { docId } = await req.json();

  if (!docId) {
    return NextResponse.json({ error: "Missing docId" }, { status: 400 });
  }

  requestLibraryAccess(docId);

  return NextResponse.json({
    success: true,
    message: `Access request for ${docId} submitted.`,
  });
}
