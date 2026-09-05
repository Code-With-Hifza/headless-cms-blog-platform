import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/services/analytics";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const userRoles = (user.roles as Role[]) || ["USER"];
    if (!hasPermission(userRoles, "analytics:read")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires analytics:read permission" } },
        { status: 403 }
      );
    }

    const stats = await getDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
