"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-6 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          Profile
        </h1>
        <p className="max-w-xl text-base text-slate-300">
          This is your event identity—interests, past events, and the organizers and
          venues you follow.
        </p>
      </header>

      <section className="relative z-10 mt-2 flex flex-1 flex-col gap-4">
        <div className="glass-panel flex flex-col gap-6 border-slate-700/80 bg-slate-950/80 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/90 text-xl font-semibold text-sky-200 ring-1 ring-slate-700/80">
                {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "EA"}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-slate-50">
                  {user ? user.name || user.email : "Guest user"}
                </span>
                <span className="text-sm text-slate-400">
                  {user
                    ? user.email
                    : "Sign in to save your events, tickets, and recommendations."}
                </span>
              </div>
            </div>
            {user ? (
              <button
                onClick={() => signOut()}
                className="pill inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-200 transition-colors hover:bg-red-500/20"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/sign-in"
                className="pill inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-50 transition-colors hover:bg-sky-500/20"
              >
                Sign in / Create account
              </Link>
            )}
          </div>

          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/80 px-5 py-4 ring-1 ring-slate-800/80">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Events attended
              </span>
              <p className="mt-3 text-2xl font-semibold text-slate-50">0</p>
            </div>
            <div className="rounded-2xl bg-slate-950/80 px-5 py-4 ring-1 ring-slate-800/80">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Organizers followed
              </span>
              <p className="mt-3 text-2xl font-semibold text-slate-50">0</p>
            </div>
            <div className="rounded-2xl bg-slate-950/80 px-5 py-4 ring-1 ring-slate-800/80">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cities explored
              </span>
              <p className="mt-3 text-2xl font-semibold text-slate-50">0</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
