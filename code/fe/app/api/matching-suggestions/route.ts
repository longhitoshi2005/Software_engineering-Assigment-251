import { NextResponse } from "next/server";
import { MATCHING_SUGGESTIONS } from "@/lib/mocks/db/matchingSuggestions";

export async function GET() {
  return NextResponse.json(MATCHING_SUGGESTIONS, { status: 200 });
}
