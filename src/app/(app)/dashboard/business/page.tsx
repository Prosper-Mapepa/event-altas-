"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboard } from "@/lib/api";
import Link from "next/link";

type BusinessData = {
  stats: {
    totalEvents: number;
    approved: number;
    pending: number;
    drafts: number;
    rejected: number;
    totalAttendees: number;
    totalTickets: number;
    rsvps: number;
    followers: number;
  };
  recentEvents: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    status: string;
    attendees: number;
    startAt: string;
  }>;
};

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-500/20 text-emerald-300",
    pending_approval: "bg-amber-500/20 text-amber-300",
    draft: "bg-slate-500/20 text-slate-400",
    rejected: "bg-red-500/20 text-red-300",
  };
  const label = status.replace("_", " ");
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
        styles[status] ?? "bg-slate-500/20 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "business") return;
    dashboard
      .business()
      .then((res) => setData(res as BusinessData))
      .catch(() => setError("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-400">Sign in to view your dashboard.</p>
        <Link href="/auth/sign-in" className="text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </div>
    );
  }

  if (user.role !== "business") {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-400">
          Business dashboard. Explorer? <Link href="/dashboard" className="text-sky-400 hover:text-sky-300">Explorer dashboard</Link>
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center px-4">
        <p className="text-slate-400">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-amber-300">{error}</p>
      </div>
    );
  }

  const { stats, recentEvents } = data;

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Business Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Overview of your events and performance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/messages?contact=admin"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-sky-500/60 hover:bg-slate-800/80 hover:text-sky-100"
          >
            Contact admin
          </Link>
          <Link
            href="/host"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Host an event
          </Link>
        </div>
      </header>

      <section className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total events</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{stats.totalEvents}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pending approval</p>
          <p className="mt-3 text-3xl font-semibold text-amber-300">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total attendees</p>
          <p className="mt-3 text-3xl font-semibold text-sky-300">{stats.totalAttendees}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">RSVPs</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{stats.rsvps}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Followers</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{stats.followers}</p>
        </div>
      </section>

      <section className="relative z-10 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
        <h2 className="text-lg font-semibold text-slate-50">Recent events</h2>
        <p className="mt-2 text-sm text-slate-400">Your latest events</p>
        <div className="mt-4 flex flex-col gap-3">
          {recentEvents.length === 0 ? (
            <p className="text-base text-slate-500">No events yet. Host your first event!</p>
          ) : (
            recentEvents.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3"
              >
                <div>
                  <p className="text-base font-semibold text-slate-50">{e.name}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{e.category} · {e.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">{formatDate(e.startAt)}</span>
                  <span className="text-sm text-slate-400">{e.attendees} attendees</span>
                  {statusBadge(e.status)}
                  <Link
                    href={`/events/${e.id}`}
                    className="text-sm font-medium text-sky-400 hover:text-sky-300"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        <Link href="/host" className="mt-4 inline-block text-sm font-medium text-sky-400 hover:text-sky-300">
          Create event →
        </Link>
      </section>
    </div>
  );
}
