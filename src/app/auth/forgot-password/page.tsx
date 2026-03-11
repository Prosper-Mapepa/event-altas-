"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.forgotPassword({ email });
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="glass-panel flex flex-col gap-6 border-slate-700/80 bg-slate-950/90 px-6 py-8 sm:px-8">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
            Check your email
          </h1>
          <p className="text-sm text-slate-400">
            If an account exists with {email}, we&apos;ve sent a reset link.
          </p>
        </div>
        <Link href="/auth/sign-in" className="text-center text-sm font-medium text-sky-400 hover:text-sky-300">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel flex flex-col gap-6 border-slate-700/80 bg-slate-950/90 px-6 py-8 sm:px-8">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
          Reset password
        </h1>
        <p className="text-sm text-slate-400">
          Enter your email and we&apos;ll send a reset link.
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-500/90 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.4)] transition-colors hover:bg-sky-400 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-[11px] text-slate-500">
        <Link href="/auth/sign-in" className="font-medium text-sky-400 hover:text-sky-300">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
