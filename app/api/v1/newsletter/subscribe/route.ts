import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/services/subscribers";
import { subscribeNewsletterSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = subscribeNewsletterSchema.parse(body);

    const result = await subscribeNewsletter(email);
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
