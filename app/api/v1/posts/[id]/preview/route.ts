import { NextRequest, NextResponse } from "next/server";
import { generatePreviewToken } from "@/lib/services/posts";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const token = await generatePreviewToken(id);

    return NextResponse.json({
      success: true,
      data: {
        token,
        previewUrl: `/blog/preview?id=${id}&token=${token}`,
      },
      message: "Preview token generated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
