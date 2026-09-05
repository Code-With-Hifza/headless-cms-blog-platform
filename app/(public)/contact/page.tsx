"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit contact request");
      }

      setStatus({ type: "success", message: data.message });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-3">
            <Mail className="h-3.5 w-3.5" /> Get in Touch
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Contact the ContentFlow Team</h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            Have questions about editorial integration, licensing, API access, or enterprise support? Send us a message.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="Eleanor Vance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Email Address</label>
              <input
                type="email"
                required
                placeholder="eleanor@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-foreground mb-2">Subject</label>
            <input
              type="text"
              required
              placeholder="Enterprise CMS Query / General Support"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="mb-8">
            <label className="block text-xs font-semibold text-foreground mb-2">Your Message</label>
            <textarea
              required
              rows={6}
              placeholder="Tell us about your project or inquiry..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <Button type="submit" variant="gradient" size="lg" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Message
          </Button>

          {status && (
            <div
              className={`mt-6 flex items-center gap-2 rounded-xl p-4 text-xs font-medium ${
                status.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{status.message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
