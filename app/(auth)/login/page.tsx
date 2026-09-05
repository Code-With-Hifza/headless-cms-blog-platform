"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Mail, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected login error occurred");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, rolePassword = "Password123!") => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError(null);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to ContentFlow</h2>
        <p className="mt-1 text-xs text-slate-400">
          Access the CMS editorial dashboard or your account
        </p>
      </div>

      {/* Demo Credentials Quick Switcher */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-2">
          <KeyRound className="h-3 w-3" /> Quick Demo Login:
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => setDemoCredentials("admin@gmail.com", "Admin@12345")}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition-colors truncate font-medium"
          >
            👑 Admin
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("editor@contentflow.io", "Password123!")}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition-colors truncate font-medium"
          >
            ✍️ Editor
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("author@contentflow.io", "Password123!")}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition-colors truncate font-medium"
          >
            📝 Author
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("user@contentflow.io", "Password123!")}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition-colors truncate font-medium"
          >
            👤 User
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400 text-center">
          Admin: <span className="text-sky-400 font-mono">admin@gmail.com</span> / <span className="text-sky-400 font-mono">Admin@12345</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="admin@contentflow.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-medium text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          disabled={loading}
          className="w-full h-11 text-sm font-semibold mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to Dashboard"}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-sky-400 hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
