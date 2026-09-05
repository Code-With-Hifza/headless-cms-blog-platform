import { NextRequest, NextResponse } from "next/server";
import { processScheduledPosts } from "@/lib/services/posts";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
        { status: 401 }
      );
    }

    const result = await processScheduledPosts();
    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed scheduled posts. ${result.publishedCount} post(s) published.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "CRON_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
