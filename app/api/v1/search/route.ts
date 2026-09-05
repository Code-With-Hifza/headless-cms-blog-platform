import { NextRequest, NextResponse } from "next/server";
import { searchContent } from "@/lib/search";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const limit = Number(url.searchParams.get("limit") || 10);

    const results = await searchContent(q, limit);
    return NextResponse.json({
      success: true,
      data: results,
      query: q,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
