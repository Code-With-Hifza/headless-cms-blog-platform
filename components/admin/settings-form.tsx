"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initialSettings?.siteName || "ContentFlow");
  const [siteDescription, setSiteDescription] = useState(initialSettings?.siteDescription || "");
  const [allowComments, setAllowComments] = useState(initialSettings?.allowComments ?? true);
  const [requireCommentModeration, setRequireCommentModeration] = useState(initialSettings?.requireCommentModeration ?? true);
  const [allowRegistration, setAllowRegistration] = useState(initialSettings?.allowRegistration ?? true);
  const [defaultRole, setDefaultRole] = useState(initialSettings?.defaultRole || "USER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          siteDescription,
          allowComments,
          requireCommentModeration,
          allowRegistration,
          defaultRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save settings");
      }

      setSuccess("Site settings updated successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Identity */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground">Publication Identity</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Site Title</label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Site Description</label>
            <textarea
              rows={3}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Editorial & Moderation Policies */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground">Editorial & Reader Policies</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-xs font-bold text-foreground">Enable Reader Comments</p>
              <p className="text-[11px] text-muted-foreground">Allow public readers to submit comments on published posts</p>
            </div>
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="h-4 w-4 rounded border-input text-sky-600 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-xs font-bold text-foreground">Require Comment Moderation</p>
              <p className="text-[11px] text-muted-foreground">Comments must be approved by editors before becoming visible</p>
            </div>
            <input
              type="checkbox"
              checked={requireCommentModeration}
              onChange={(e) => setRequireCommentModeration(e.target.checked)}
              className="h-4 w-4 rounded border-input text-sky-600 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-xs font-bold text-foreground">Allow Public User Registration</p>
              <p className="text-[11px] text-muted-foreground">Allow visitors to register new accounts from the login screen</p>
            </div>
            <input
              type="checkbox"
              checked={allowRegistration}
              onChange={(e) => setAllowRegistration(e.target.checked)}
              className="h-4 w-4 rounded border-input text-sky-600 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Default New User Role</label>
            <select
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="USER">User (Commenting access)</option>
              <option value="AUTHOR">Author (Can draft posts)</option>
              <option value="EDITOR">Editor (Can review and publish)</option>
            </select>
          </div>
        </div>
      </div>

      <Button type="submit" variant="gradient" disabled={loading} className="gap-2 text-xs font-semibold">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Site Settings
      </Button>
    </form>
  );
}
