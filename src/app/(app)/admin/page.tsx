"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { events, dashboard } from "@/lib/api";
import Link from "next/link";

type PendingEvent = {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  createdAt: string;
  host?: { name: string | null; email: string };
};

type AdminData = {
  stats: { totalUsers: number; totalEvents: number; pendingEvents: number; totalTickets: number; totalRsvps: number };
  usersByRole: Record<string, number>;
  eventsByStatus: Record<string, number>;
  recentUsers: Array<{ id: string; email: string; name: string | null; role: string; createdAt: string; updatedAt: string }>;
  pendingList: PendingEvent[];
  approvedList: PendingEvent[];
};

export default function AdminPage() {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventsTab, setEventsTab] = useState<"pending" | "approved">("pending");

  async function load() {
    if (!user || user.role !== "admin") return;
    try {
      const res = await dashboard.admin();
      setAdminData(res as AdminData);
    } catch {
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const event = pendingList.find((e) => e.id === id);
    try {
      await events.update(id, { status });
      setAdminData((d) => {
        if (!d) return d;
        const next = {
          ...d,
          pendingList: d.pendingList.filter((e) => e.id !== id),
          stats: { ...d.stats, pendingEvents: d.stats.pendingEvents - 1 },
        };
        if (status === "approved" && event) {
          next.approvedList = [{ ...event, status: "approved" }, ...d.approvedList];
        }
        return next;
      });
    } catch {
      // ignore
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-400">Admin access required.</p>
        <Link href="/discover" className="text-sky-400 hover:text-sky-300">
          Back to discover
        </Link>
      </div>
    );
  }

  if (loading || !adminData) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center px-4">
        <p className="text-slate-400">Loading admin dashboard…</p>
      </div>
    );
  }

  const { stats, usersByRole, eventsByStatus, recentUsers, pendingList, approvedList } = adminData;

  function formatDate(s: string) {
    return new Date(s).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Platform overview and moderation.
          </p>
        </div>
        <Link
          href="/host"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
        >
          Add event
        </Link>
      </header>

      <section className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total users</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{stats.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total events</p>
          <p className="mt-3 text-3xl font-semibold text-sky-300">{stats.totalEvents}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pending approval</p>
          <p className="mt-3 text-3xl font-semibold text-amber-300">{stats.pendingEvents}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tickets sold</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{stats.totalTickets}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total RSVPs</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{stats.totalRsvps}</p>
        </div>
      </section>

      <section className="relative z-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <h2 className="text-lg font-semibold text-slate-50">Users by role</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(usersByRole).map(([role, count]) => (
              <span key={role} className="rounded-full bg-slate-800/90 px-3 py-1.5 text-sm text-slate-300">
                {role}: {count}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-5">
          <h2 className="text-lg font-semibold text-slate-50">Events by status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(eventsByStatus).map(([status, count]) => (
              <span key={status} className="rounded-full bg-slate-800/90 px-3 py-1.5 text-sm text-slate-300">
                {status.replace("_", " ")}: {count}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/80">
        <h2 className="border-b border-slate-700/80 px-5 py-4 text-lg font-semibold text-slate-50">
          Recent users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Last updated</th>
                <th className="px-5 py-3">ID</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-800/60 transition-colors hover:bg-slate-900/40">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-semibold text-slate-100">{u.name || u.email}</p>
                      {u.name && <p className="text-sm text-slate-400">{u.email}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-800/90 px-3 py-1 text-sm text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{formatDate(u.updatedAt)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{u.id.slice(0, 8)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="relative z-10">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-700/80 bg-slate-950/80 p-0.5">
            <button
              onClick={() => setEventsTab("pending")}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                eventsTab === "pending"
                  ? "bg-slate-800/90 text-slate-50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pending ({pendingList.length})
            </button>
            <button
              onClick={() => setEventsTab("approved")}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                eventsTab === "approved"
                  ? "bg-slate-800/90 text-slate-50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Approved ({approvedList.length})
            </button>
          </div>
          <Link href="/host" className="text-sm font-medium text-sky-400 hover:text-sky-300">
            + Add event
          </Link>
        </div>
        {eventsTab === "pending" ? (
          pendingList.length === 0 ? (
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-6 py-10 text-center">
              <p className="text-base text-slate-400">No events pending approval.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingList.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-4"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-50">{e.name}</p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {e.category} · {e.location}
                      {e.host && ` · ${e.host.email}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(e.id, "approved")}
                      className="rounded-xl bg-emerald-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(e.id, "rejected")}
                      className="rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/80"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : approvedList.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-6 py-10 text-center">
            <p className="text-base text-slate-400">No approved events yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {approvedList.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-4 transition-colors hover:border-slate-600/80"
              >
                <div>
                  <p className="text-base font-semibold text-slate-50">{e.name}</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {e.category} · {e.location}
                    {e.host && ` · ${e.host.email}`}
                  </p>
                </div>
                <span className="text-sm font-medium text-emerald-400">Approved</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
