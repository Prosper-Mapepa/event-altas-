"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { tickets as ticketsApi } from "@/lib/api";
import { DownloadTicketButton } from "@/components/DownloadTicketButton";
import { PrintableTicket } from "@/components/PrintableTicket";
import type { ApiTicket } from "@/lib/api";

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    ticketsApi
      .getMyTickets()
      .then((res) => setTickets(res.tickets ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-6 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
        <div className="glow-orbit" />
        <div className="grain" />
        <header className="relative z-10 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            My tickets
          </h1>
          <p className="max-w-xl text-base text-slate-300">
            Sign in to see your tickets and passes.
          </p>
        </header>
        <section className="relative z-10 mt-2 flex flex-1 flex-col gap-4">
          <div className="glass-panel flex flex-1 flex-col items-center justify-center border-slate-700/80 bg-slate-950/80 px-6 py-10 text-center">
            <Link
              href="/auth/sign-in"
              className="pill inline-flex items-center justify-center gap-2 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-50 transition-colors hover:bg-sky-500/20"
            >
              Sign in to view tickets
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-6 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          My tickets
        </h1>
        <p className="max-w-xl text-base text-slate-300">
          {tickets.length
            ? `${tickets.length} ticket(s) for upcoming events`
            : "All your upcoming events, passes, and QR codes will appear here."}
        </p>
      </header>

      <section className="relative z-10 mt-2 flex flex-1 flex-col gap-4">
        {loading ? (
          <div className="glass-panel flex flex-1 items-center justify-center border-slate-700/80 bg-slate-950/80 px-6 py-10">
            <p className="text-base text-slate-400">Loading…</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass-panel flex flex-1 flex-col items-center justify-center border-slate-700/80 bg-slate-950/80 px-6 py-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/50">
              <span className="text-xl">🎟️</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-50">
              You don&apos;t have any tickets yet
            </h2>
            <p className="mb-4 max-w-md text-base text-slate-300">
              Discover and book experiences—your tickets will appear here with live
              status and QR check-in.
            </p>
            <Link
              href="/discover"
              className="pill inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-50 transition-colors hover:bg-sky-500/20"
            >
              Browse nearby events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="glass-panel overflow-hidden rounded-xl border-slate-700/80 bg-slate-950/80"
              >
                <div className="p-3">
                  <PrintableTicket ticket={t} orderId={`EA-${t.id.slice(-6).toUpperCase()}`} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/80 bg-slate-900/50 px-3 py-2">
                  <Link
                    href={`/events/${t.eventId}`}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                  >
                    View event →
                  </Link>
                  <DownloadTicketButton ticket={t} orderId={`EA-${t.id.slice(-6).toUpperCase()}`} className="text-xs" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
