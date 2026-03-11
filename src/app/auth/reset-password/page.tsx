"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Token is required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await auth.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch {
      setError("Invalid or expired token. Request a new reset link.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-emerald-300">
          Password reset successfully. You can now sign in.
        </p>
        <Link
          href="/auth/sign-in"
          className="block w-full rounded-xl bg-sky-500/90 px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-sky-400"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label
          htmlFor="token"
          className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"
        >
          Reset token
        </label>
        <input
          id="token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste the token from your email"
          required
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="newPassword"
          className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"
        >
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        />
        <p className="text-[10px] text-slate-500">
          At least 8 characters with a number or symbol.
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sky-500/90 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.4)] transition-colors hover:bg-sky-400 disabled:opacity-60"
      >
        {loading ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="glass-panel flex flex-col gap-6 border-slate-700/80 bg-slate-950/90 px-6 py-8 sm:px-8">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
          Set new password
        </h1>
        <p className="text-sm text-slate-400">
          Enter the token from your email and choose a new password.
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-sm text-slate-400">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
      <p className="text-center text-[11px] text-slate-500">
        <Link href="/auth/sign-in" className="font-medium text-sky-400 hover:text-sky-300">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
