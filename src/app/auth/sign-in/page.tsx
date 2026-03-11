"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

export default function SignInPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel flex flex-col gap-6 border-slate-700/80 bg-slate-950/90 px-6 py-8 sm:px-8">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
          Sign in
        </h1>
        <p className="text-sm text-slate-400">
          Access your events, tickets, and recommendations.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>
        )}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[11px] text-sky-400 hover:text-sky-300"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-500/90 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.4)] transition-colors hover:bg-sky-400 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700/80" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-slate-950/95 px-3 text-slate-500">
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 transition-colors hover:bg-slate-900/80 hover:border-slate-600/80">
          <span className="text-base">G</span>
          Google
        </button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 transition-colors hover:bg-slate-900/80 hover:border-slate-600/80">
          <span className="text-base">⌘</span>
          Apple
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="font-medium text-sky-400 hover:text-sky-300">
          Create one
        </Link>
      </p>
    </div>
  );
}
