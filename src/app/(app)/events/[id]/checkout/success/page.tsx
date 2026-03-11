import Link from "next/link";
import { events as eventsApi } from "@/lib/api";

type SuccessPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckoutSuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  let event: { id: string; name: string; time: string; location: string } | null = null;
  try {
    event = await eventsApi.getById(id);
  } catch {
    event = { id, name: "Your event", time: "—", location: "—" };
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="glass-panel flex flex-col items-center gap-6 border-slate-700/80 bg-slate-950/90 px-6 py-10 sm:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/50">
            <span className="text-3xl">✓</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              You&apos;re in
            </h1>
            <p className="text-base text-slate-300">
              Your tickets for{" "}
              <span className="font-semibold text-slate-100">{event.name}</span>{" "}
              are confirmed.
            </p>
          </div>

          <div className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-5 py-4 text-left">
            <p className="text-sm text-slate-400">Order #EA-89234</p>
            <p className="mt-2 text-base font-semibold text-slate-50">
              1 × General Admission · $34.56
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {event.time} · {event.location}
            </p>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            Tickets are in your EventAtlas wallet. Visit My Tickets to view and download your ticket.
            Show your ticket at the door.
          </p>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href="/tickets"
              className="flex-1 rounded-xl bg-sky-500/90 px-5 py-3.5 text-base font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.4)] transition-colors hover:bg-sky-400"
            >
              View my tickets
            </Link>
            <Link
              href={`/events/${event.id}`}
              className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/70 px-5 py-3.5 text-center text-base font-medium text-slate-200 transition-colors hover:bg-slate-900/80"
            >
              Event details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
