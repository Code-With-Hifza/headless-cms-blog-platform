"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

export function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Failed to subscribe");
      }

      setStatus({ type: "success", message: data.message || "Successfully subscribed to the newsletter!" });
      setEmail("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6 backdrop-blur-sm shadow-xl">
      <h4 className="text-lg font-semibold text-white">Join 15,000+ engineers</h4>
      <p className="mt-1 text-xs text-slate-300">
        Curated engineering essays and architecture blueprints. No spam, ever.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Enter your work email..."
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-slate-600 bg-slate-900/90 px-3.5 text-sm text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <Button
          type="submit"
          variant="gradient"
          disabled={loading}
          className="h-10 shrink-0 gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Subscribe
            </>
          )}
        </Button>
      </form>

      {status && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
