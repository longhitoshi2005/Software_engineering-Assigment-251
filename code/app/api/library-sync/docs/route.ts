import { NextResponse } from "next/server";
import { librarySyncDocs } from "@/lib/mocks/db/librarySync";

export async function GET() {
  return NextResponse.json(librarySyncDocs);
}
