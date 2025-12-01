import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/mocks/db/dashboard";

export async function GET() {
  return NextResponse.json(getDashboardData());
}
