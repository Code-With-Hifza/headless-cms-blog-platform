import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const userRoles = (user.roles as Role[]) || ["USER"];
    if (!hasPermission(userRoles, "settings:manage")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires settings:manage permission" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await updateSiteSettings(body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Site settings updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
