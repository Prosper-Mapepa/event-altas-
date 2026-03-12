"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { BrowseLocationSelector, type BrowseRegion } from "@/components/BrowseLocationSelector";
import { events as eventsApi } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import type { ApiEvent } from "@/lib/api";

const DEFAULT_LAT = 37.7749;
const DEFAULT_LNG = -122.4194;
const LIMIT = 100;
const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;

function getCurrentLabel(status: string, lat: number | null, lng: number | null): string {
  if (status === "granted" && lat != null && lng != null) return "Your location";
  if (status === "denied") return "Location denied · default area";
  if (status === "prompting" || status === "idle") return "Getting location…";
  return "Default area";
}

export function EventsListWithLocation() {
  const { lat, lng, status, requestLocation } = useLocation();
  const [region, setRegion] = useState<BrowseRegion>(() => ({
    type: "current",
    label: "Your location",
  }));
  const [radiusKm, setRadiusKm] = useState(50);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const effectiveLat = region.type === "city" ? region.lat : (lat ?? DEFAULT_LAT);
  const effectiveLng = region.type === "city" ? region.lng : (lng ?? DEFAULT_LNG);
  const displayRegion = useMemo<BrowseRegion>(() => {
    if (region.type === "city") return region;
    return { type: "current", label: getCurrentLabel(status, lat, lng) };
  }, [region, status, lat, lng]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await eventsApi.getNearby({
        lat: effectiveLat,
        lng: effectiveLng,
        radiusKm,
        limit: LIMIT,
      });
      setEvents(res.events ?? []);
    } catch {
      setFetchError("Unable to load events. Make sure the backend is running.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [effectiveLat, effectiveLng, radiusKm]);

  useEffect(() => {
    if (region.type === "current" && (status === "prompting" || status === "idle")) return;
    fetchEvents();
  }, [region.type, region.type === "city" ? region.lat : 0, region.type === "city" ? region.lng : 0, status, radiusKm, fetchEvents]);

  const handleUseCurrentLocation = useCallback(() => {
    setRegion({ type: "current", label: "Your location" });
    requestLocation();
  }, [requestLocation]);

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              All events
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {loading ? "…" : `${events.length} events`} · {displayRegion.label} · {radiusKm} km radius
            </p>
          </div>
          <Link
            href="/discover"
            className="text-[11px] text-sky-300 hover:text-sky-200"
          >
            ← Back to discover
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BrowseLocationSelector
            region={displayRegion}
            onSelectRegion={setRegion}
            onUseCurrentLocation={handleUseCurrentLocation}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Proximity</span>
            <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-1">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    radiusKm === r
                      ? "bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/50"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-500/40 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live · {radiusKm} km
            </span>
          </div>
        </div>
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

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fetchError ? (
            <div className="col-span-full rounded-2xl border border-amber-500/30 bg-slate-950/80 px-6 py-10 text-center">
              <p className="text-sm text-amber-300">{fetchError}</p>
            </div>
          ) : loading ? (
            <div className="col-span-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-6 py-10 text-center">
              <p className="text-sm text-slate-400">Loading events…</p>
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-6 py-10 text-center">
              <p className="text-sm text-slate-400">No events in this area.</p>
              <p className="mt-1 text-xs text-slate-500">Try another location or host your own.</p>
              <Link href="/host" className="mt-3 inline-block text-sm text-sky-400 hover:text-sky-300">
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
