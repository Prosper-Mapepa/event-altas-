"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboard } from "@/lib/api";
import Link from "next/link";

type ExplorerData = {
  stats: { savedEvents: number; rsvps: number; following: number; tickets: number };
  upcomingRsvps: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    startAt: string;
    imageUrl?: string;
    attendees: number;
    rsvpStatus: string;
  }>;
  savedEvents: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    startAt: string;
    imageUrl?: string;
    attendees: number;
  }>;
};

function formatDate(s: string) {
  const d = new Date(s);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days < 0) return "Past";
  if (days === 0) return `Today · ${t}`;
  if (days === 1) return `Tomorrow · ${t}`;
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${wd[d.getDay()]} · ${t}`;
}

export default function ExplorerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ExplorerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "explorer") return;
    dashboard
      .explorer()
      .then((res) => setData(res as ExplorerData))
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

  if (user.role !== "explorer") {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-400">
          Explorer dashboard. Business? <Link href="/dashboard/business" className="text-sky-400 hover:text-sky-300">Business dashboard</Link>
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

  const { stats, upcomingRsvps, savedEvents } = data;

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          Explorer Dashboard
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Track your saved events, RSVPs, and activity.
        </p>
      </header>

      <section className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Saved events</p>
          <p className="mt-3 text-3xl font-semibold text-sky-300">{stats.savedEvents}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">RSVPs</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{stats.rsvps}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Following</p>
          <p className="mt-3 text-3xl font-semibold text-amber-300">{stats.following}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tickets</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{stats.tickets}</p>
        </div>
      </section>

      <section className="relative z-10 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <h2 className="text-lg font-semibold text-slate-50">Upcoming RSVPs</h2>
          <p className="mt-2 text-sm text-slate-400">Events you&apos;ve RSVP&apos;d to</p>
          <div className="mt-4 flex flex-col gap-3">
            {upcomingRsvps.length === 0 ? (
              <p className="text-base text-slate-500">No upcoming RSVPs.</p>
            ) : (
              upcomingRsvps.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 transition-colors hover:border-slate-600/80"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-50">{e.name}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{e.category} · {e.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                      {e.rsvpStatus}
                    </span>
                    <span className="text-sm text-slate-400">{formatDate(e.startAt)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/events"
            className="mt-4 inline-block text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            Browse events →
          </Link>
        </div>

        <div className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <h2 className="text-lg font-semibold text-slate-50">Saved Events</h2>
          <p className="mt-2 text-sm text-slate-400">Your bookmarked events</p>
          <div className="mt-4 flex flex-col gap-3">
            {savedEvents.length === 0 ? (
              <p className="text-base text-slate-500">No saved events yet.</p>
            ) : (
              savedEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 transition-colors hover:border-slate-600/80"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-50">{e.name}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{e.category} · {e.location}</p>
                  </div>
                  <span className="text-sm text-slate-400">{formatDate(e.startAt)}</span>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/events"
            className="mt-4 inline-block text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            Discover more →
          </Link>
        </div>
      </section>
    </div>
  );
}
