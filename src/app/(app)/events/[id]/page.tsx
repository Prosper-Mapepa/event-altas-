import Link from "next/link";
import { notFound } from "next/navigation";
import { events as eventsApi } from "@/lib/api";
import { EventEngagementButtons } from "@/components/EventEngagementButtons";
import { EventImageSlider } from "@/components/EventImageSlider";
import { EditEventButton } from "@/components/EditEventButton";
import { EventMap } from "@/components/EventMap";

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  let event;
  try {
    event = await eventsApi.getById(id);
  } catch {
    notFound();
  }
  if (!event) notFound();

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <section className="relative z-10 grid w-full gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="glass-panel relative flex flex-col gap-6 border-slate-700/80 bg-slate-950/90 px-5 pb-6 pt-5 sm:px-7">
          {/* Tags + title + host */}
          <div className="space-y-3">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-slate-700/80">
                Featured event
              </span>
              <span className="rounded-full bg-slate-900/70 px-2.5 py-1 text-[10px] text-sky-200 ring-1 ring-sky-500/40">
                {event.category}
              </span>
            </div>
            <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              {event.name}
            </h1>
            <p className="text-sm text-slate-300/90">
              Hosted by{" "}
              <span className="font-medium text-slate-100">
                {event.host?.name ?? "Atlas Collective"}
              </span>
              <span className="mx-1.5 text-slate-500">·</span>
              <span className="text-slate-400">{event.location}</span>
            </p>
          </div>

          {/* Date, distance, price — single row */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-100 ring-1 ring-slate-700/80">
              {event.time}
            </span>
            <span className="text-slate-400">
              {(event.distance ?? "—")} from you
            </span>
            <span className="ml-auto font-medium text-sky-200">{event.price}</span>
          </div>

          {/* Actions: engagement first, then Edit + Message host */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <EventEngagementButtons eventId={event.id} host={event.host} />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-700/60 pt-3">
              <EditEventButton eventId={event.id} hostId={event.host?.id} />
              {event.host?.id && (
                <Link
                  href={`/messages?with=${event.host.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:bg-slate-800/80 hover:text-sky-100"
                >
                  Message host
                </Link>
              )}
            </div>
          </div>

          <div className="relative mt-1 overflow-hidden">
            {event.imageUrls && event.imageUrls.length > 0 ? (
              <EventImageSlider
                images={event.imageUrls}
                alt={event.name}
                className="h-72 sm:h-96 min-h-[18rem]"
              />
            ) : event.imageUrl ? (
              <EventImageSlider
                images={[event.imageUrl]}
                alt={event.name}
                className="h-72 sm:h-96 min-h-[18rem]"
              />
            ) : (
              <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/85 sm:h-96 min-h-[18rem]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(56,189,248,0.55),transparent_60%),radial-gradient(circle_at_100%_0,rgba(129,140,248,0.4),transparent_60%),radial-gradient(circle_at_50%_100%,rgba(45,212,191,0.4),transparent_65%)] opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-slate-500">No image uploaded</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 text-[11px] text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/80 px-4 py-3 ring-1 ring-slate-800/80">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                When
              </span>
              <p className="mt-2 text-sm font-medium text-slate-50">
                {event.time}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Doors open 30 min before</p>
            </div>
            <div className="rounded-2xl bg-slate-950/80 px-4 py-3 ring-1 ring-slate-800/80">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Where
              </span>
              <p className="mt-2 text-sm font-medium text-slate-50">
                {event.location}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Exact address shared on ticket</p>
            </div>
            <div className="rounded-2xl bg-slate-950/80 px-4 py-3 ring-1 ring-slate-800/80">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Crowd
              </span>
              <p className="mt-2 text-sm font-medium text-slate-50">
                {event.attendees}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Mix of locals, regulars, and first‑timers.
              </p>
            </div>
          </div>

          {typeof (event as { lat?: number }).lat === "number" &&
            typeof (event as { lng?: number }).lng === "number" && (
              <div className="space-y-2">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Location
                </span>
                <div className="h-64 w-full overflow-hidden rounded-2xl sm:h-80">
                  <EventMap
                    events={[
                      {
                        id: event.id,
                        name: event.name,
                        category: event.category,
                        location: event.location,
                        distance: (event as { distance?: string }).distance ?? "",
                        time: event.time,
                        attendees: event.attendees,
                        price: event.price,
                        highlight: (event as { highlight?: string }).highlight ?? "",
                        lat: (event as { lat: number }).lat,
                        lng: (event as { lng: number }).lng,
                      },
                    ]}
                    className="h-full w-full"
                    centerOverride={{
                      lat: (event as { lat: number }).lat,
                      lng: (event as { lng: number }).lng,
                    }}
                  />
                </div>
              </div>
            )}
        </div>

        <aside className="glass-panel relative flex flex-col gap-4 border-slate-700/80 bg-slate-950/90 px-5 pb-6 pt-5 sm:px-6">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Tickets
            </span>
            <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-200 ring-1 ring-slate-700/80">
              Mobile · QR check‑in
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-200">
            {(event.tiers ?? [
              { name: "General Admission", description: "Standing · access to main floor", price: 3200 },
              { name: "VIP Terrace", description: "Fast entry · dedicated bar · best view", price: 6400 },
            ]).map((tier, i) => (
              <div
                key={tier.name}
                className={`flex items-center justify-between rounded-2xl px-3 py-3 ring-1 ${
                  i === 1 ? "bg-slate-950/90 ring-amber-500/40" : "bg-slate-950/90 ring-slate-800/80"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-semibold ${i === 1 ? "text-amber-100" : "text-slate-50"}`}>
                    {tier.name}
                  </span>
                  {tier.description && (
                    <span className="text-[11px] text-slate-400">{tier.description}</span>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${i === 1 ? "text-amber-200" : "text-sky-200"}`}>
                    {tier.price === 0 ? "Free" : `$${(tier.price / 100).toFixed(0)}`}
                  </p>
                  <p className="text-[10px] text-slate-400">{i === 1 ? "Few left" : "+ fees"}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={`/events/${event.id}/checkout`}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_18px_45px_rgba(56,189,248,0.8)] transition-colors hover:bg-sky-400"
          >
            Continue · Select tickets
          </Link>

          <p className="mt-2 text-[10px] text-slate-400">
            Secure payments. Tickets are delivered instantly to your EventAtlas wallet
            and email.
          </p>
        </aside>
      </section>
    </div>
  );
}

