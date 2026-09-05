import { NextRequest, NextResponse } from "next/server";
import { unsubscribeNewsletter } from "@/lib/services/subscribers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Token is required" } },
        { status: 400 }
      );
    }

    const result = await unsubscribeNewsletter(token);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
