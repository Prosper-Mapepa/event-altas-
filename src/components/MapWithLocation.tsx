"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventMap } from "@/components/EventMap";
import { BrowseLocationSelector, type BrowseRegion } from "@/components/BrowseLocationSelector";
import { events as eventsApi } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import type { ApiEvent } from "@/lib/api";

const DEFAULT_LAT = 37.7749;
const DEFAULT_LNG = -122.4194;

function getCurrentLabel(status: string, lat: number | null, lng: number | null): string {
  if (status === "granted" && lat != null && lng != null) return "Your location";
  if (status === "denied") return "Location denied · default area";
  if (status === "prompting" || status === "idle") return "Getting location…";
  return "Default area";
}

export function MapWithLocation() {
  const { lat, lng, status, requestLocation } = useLocation();
  const [region, setRegion] = useState<BrowseRegion>(() => ({
    type: "current",
    label: "Your location",
  }));
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveLat = region.type === "city" ? region.lat : (lat ?? DEFAULT_LAT);
  const effectiveLng = region.type === "city" ? region.lng : (lng ?? DEFAULT_LNG);
  const displayRegion = useMemo<BrowseRegion>(() => {
    if (region.type === "city") return region;
    return { type: "current", label: getCurrentLabel(status, lat, lng) };
  }, [region, status, lat, lng]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getNearby({ lat: effectiveLat, lng: effectiveLng, limit: 50 });
      setEvents(res.events ?? []);
    } catch {
      setError("Unable to load events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [effectiveLat, effectiveLng]);

  useEffect(() => {
    if (region.type === "current" && (status === "prompting" || status === "idle")) return;
    fetchEvents();
  }, [region.type, region.type === "city" ? region.lat : 0, region.type === "city" ? region.lng : 0, status, fetchEvents]);

  const handleUseCurrentLocation = useCallback(() => {
    setRegion({ type: "current", label: "Your location" });
    requestLocation();
  }, [requestLocation]);

  const mapCenterOverride = region.type === "city" ? { lat: region.lat, lng: region.lng } : null;

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-6 px-4 pb-20 pt-10 sm:px-6 lg:px-10 md:pb-8">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-30 flex flex-shrink-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Live map
          </h1>
          <p className="max-w-xl text-base text-slate-300">
            Visualize what&apos;s happening around you. Pan, zoom, and tap into events
            in real time.
          </p>
        </div>
        <BrowseLocationSelector
          region={displayRegion}
          onSelectRegion={setRegion}
          onUseCurrentLocation={handleUseCurrentLocation}
        />
      </header>

      <section className="relative z-0 mt-2 flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="glass-panel relative flex min-h-[280px] flex-1 flex-col overflow-hidden border-slate-700/80 bg-slate-950/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(56,189,248,0.45),transparent_55%),radial-gradient(circle_at_100%_0,rgba(129,140,248,0.28),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(45,212,191,0.22),transparent_60%)] opacity-70 mix-blend-screen" />
          <div className="relative flex min-h-0 flex-1 flex-col gap-2 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
            <div className="flex shrink-0 items-center justify-between text-sm text-slate-300">
              <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-slate-700/80">
                Map preview
              </span>
              <span className="text-sm text-sky-200 sm:text-base">Click pins for event preview</span>
            </div>
            <div className="relative h-[260px] w-full shrink-0 sm:h-[340px] md:h-[400px]">
              <EventMap
                events={events}
                className="h-full w-full"
                centerOverride={mapCenterOverride}
              />
            </div>
          </div>
        </div>

        <aside className="glass-panel relative mt-3 flex w-full flex-col overflow-hidden border-slate-700/80 bg-slate-950/80 lg:mt-0 lg:min-h-0 lg:w-[340px]">
          <div className="relative flex items-center justify-between gap-2 border-b border-slate-700/80 px-3 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Now in your orbit
            </span>
            <span className="rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[11px] text-slate-200 ring-1 ring-slate-700/80">
              {loading ? "…" : events.length} live
            </span>
          </div>
          <div className="relative min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
            {error ? (
              <div className="px-3 py-6 text-center text-sm text-amber-300">{error}</div>
            ) : loading ? (
              <div className="px-3 py-6 text-center text-sm text-slate-400">Loading events…</div>
            ) : events.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-400">No events nearby.</div>
            ) : (
              events.map((event, index) => {
                const imageUrl =
                  event.imageUrl ??
                  (event.imageUrls && event.imageUrls.length > 0 ? event.imageUrls[0] : undefined);
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group flex w-full gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-slate-900/70"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-sm font-semibold text-slate-100">
                          {event.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-500">{event.distance}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{event.location}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{event.time}</span>
                        <span className="font-medium text-sky-300">{event.price}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
