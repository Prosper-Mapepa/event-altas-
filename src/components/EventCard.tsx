import Link from "next/link";
import type { NearbyEvent } from "@/lib/events";

type EventCardProps = {
  event: NearbyEvent;
  index: number;
  size?: "default" | "large";
  /** When true, card has no border/shadow so it fits inside a parent card (e.g. below an image). */
  embedded?: boolean;
};

export function EventCard({ event, index, size = "default", embedded = false }: EventCardProps) {
  const isLarge = size === "large";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden transition-all ${
        embedded
          ? "rounded-none border-0 bg-transparent shadow-none"
          : `rounded-2xl border border-slate-700/60 bg-slate-950/90 shadow-lg shadow-black/30 ring-1 ring-white/5 hover:-translate-y-0.5 hover:border-slate-600/80 hover:bg-slate-900/95 hover:shadow-xl hover:shadow-black/35`
      } ${isLarge ? "p-4 sm:p-5" : embedded ? "p-0" : "p-3.5 sm:p-4"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(56,189,248,0.06),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
      <div className="relative flex min-w-0 flex-1 flex-col gap-3">
        {/* Top row: rank + time on left, distance on right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-slate-800/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              #{index + 1}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">{event.time}</span>
            {event.highlight && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-sky-400/90">{event.highlight}</span>
              </>
            )}
          </div>
          <span className="shrink-0 text-xs text-slate-500">{event.distance}</span>
        </div>

        {/* Title + category */}
        <div className="space-y-0.5">
          <h2
            className={`font-semibold leading-tight text-slate-50 line-clamp-2 ${
              isLarge ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            }`}
          >
            {event.name}
          </h2>
          <p className="text-xs text-slate-500">{event.category}</p>
        </div>

        {/* Footer: attendees + price */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
          <div className="flex items-center gap-1.5">
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 3.475 3.475 0 00-4.99-3.128 5.318 5.318 0 01-2.756-2.235 5.318 5.318 0 01-2.756 2.235 3.475 3.475 0 00-4.99 3.128 9.337 9.337 0 004.121 2.25 9.38 9.38 0 002.625-.372" />
            </svg>
            <span className="text-sm text-slate-400">{event.attendees}</span>
          </div>
          <span className="text-sm font-semibold text-sky-300">{event.price}</span>
        </div>

        <Link
          href={`/events/${event.id}`}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-sky-400 active:scale-[0.98]"
        >
          Open event · Get tickets
        </Link>
      </div>
    </article>
  );
}
