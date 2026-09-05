import { getSiteSettings } from "@/lib/services/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Global Site Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure publication identity, default policies, and moderation workflows.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
