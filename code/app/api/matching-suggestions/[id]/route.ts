import { NextResponse } from "next/server";
import { MATCHING_SUGGESTIONS } from "@/lib/mocks/db/matchingSuggestions";

export async function GET(req: Request, { params }: any) {
  const item = MATCHING_SUGGESTIONS.find(s => s.suggestionId === params.id);
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: any) {
  const index = MATCHING_SUGGESTIONS.findIndex(s => s.suggestionId === params.id);
  if (index === -1) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const data = await req.json();
  MATCHING_SUGGESTIONS[index] = {
    ...MATCHING_SUGGESTIONS[index],
    ...data
  };

  return NextResponse.json({ updated: MATCHING_SUGGESTIONS[index] });
}
