import { NextRequest, NextResponse } from "next/server";
import { getMediaList, createMediaRecord, deleteMedia } from "@/lib/services/media";
import { uploadFile } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const type = url.searchParams.get("type") || undefined;

    const items = await getMediaList({ search, type });
    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const userRoles = (user.roles as Role[]) || ["USER"];
    if (!hasPermission(userRoles, "media:upload")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires media:upload permission" } },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const altText = (formData.get("altText") as string) || undefined;
    const caption = (formData.get("caption") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "No file provided" } },
        { status: 400 }
      );
    }

    const uploaded = await uploadFile(file);

    const record = await createMediaRecord({
      fileName: uploaded.fileName,
      fileUrl: uploaded.fileUrl,
      fileType: uploaded.fileType,
      mimeType: uploaded.mimeType,
      fileSize: uploaded.fileSize,
      width: uploaded.width,
      height: uploaded.height,
      altText: altText || uploaded.fileName,
      caption: caption || null,
      uploaderId: user.id,
      provider: uploaded.provider,
    });

    return NextResponse.json(
      {
        success: true,
        data: record,
        message: "Media uploaded successfully",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPLOAD_ERROR", message: err.message } },
      { status: 400 }
    );
  }
}
