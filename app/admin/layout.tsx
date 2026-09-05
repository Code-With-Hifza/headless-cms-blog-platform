import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import type { Role } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userRoles = (user.roles as Role[]) || [];
  const hasAccess = userRoles.some((r) => ["ADMIN", "EDITOR", "AUTHOR"].includes(r));

  if (!hasAccess) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
