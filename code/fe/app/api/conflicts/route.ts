import { NextResponse } from "next/server";
import { CONFLICTS } from "@/lib/mocks"; // 👉 lấy từ mocks chung

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // Nếu có id → trả 1 conflict
    if (id) {
      const found = CONFLICTS.find((c) => String(c.id) === String(id));
      if (!found) {
        return NextResponse.json(
          { error: "not_found", message: "Conflict not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ conflict: found }, { status: 200 });
    }

    // Nếu không có id → trả toàn bộ danh sách
    return NextResponse.json({ conflicts: CONFLICTS }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "internal_error", message: String(err) },
      { status: 500 }
    );
  }
}
