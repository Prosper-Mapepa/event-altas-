import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { events as eventsApi } from "@/lib/api";

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof eventsApi.getNearby>>["events"] = [];
  let error: string | null = null;
  try {
    const res = await eventsApi.getNearby({ limit: 50 });
    events = res.events ?? [];
  } catch {
    error = "Unable to load events. Make sure the backend is running.";
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            All events
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {events.length} events near you · San Francisco · 5 km radius
          </p>
        </div>
        <Link
          href="/discover"
          className="text-[11px] text-sky-300 hover:text-sky-200"
        >
          ← Back to discover
        </Link>
      </header>

      <section className="relative z-10">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4 text-[11px] text-slate-300">
          <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 ring-1 ring-slate-700/80">
            Smart feed
          </span>
          <span className="text-slate-400">
            Sorted by time · distance · hype
          </span>
        </div>

        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <div className="col-span-full rounded-2xl border border-amber-500/30 bg-slate-950/80 px-6 py-10 text-center">
              <p className="text-sm text-amber-300">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-6 py-10 text-center">
              <p className="text-sm text-slate-400">No events found.</p>
              <Link href="/host" className="mt-2 inline-block text-sm text-sky-400 hover:text-sky-300">
                Host your own event
              </Link>
            </div>
          ) : (
            events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                size="default"
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
