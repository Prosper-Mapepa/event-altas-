"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
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

export function DiscoverWithLocation() {
  const { lat, lng, status, requestLocation } = useLocation();
  const [region, setRegion] = useState<BrowseRegion>(() => ({
    type: "current",
    label: "Your location",
  }));
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [radiusKm, setRadiusKm] = useState(50);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);

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
      const res = await eventsApi.getNearby({ lat: effectiveLat, lng: effectiveLng, radiusKm, limit: 50 });
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

  const mapCenterOverride = region.type === "city" ? { lat: region.lat, lng: region.lng } : null;
  const radiusOptions = [5, 10, 25, 50, 100] as const;

  const categoryChips: { id: string; label: string; icon: string }[] = [
    { id: "music", label: "Music", icon: "🎤" },
    { id: "nightlife", label: "Nightlife", icon: "🪩" },
    { id: "arts", label: "Performing & Visual Arts", icon: "🎭" },
    { id: "holidays", label: "Holidays", icon: "🎉" },
    { id: "dating", label: "Dating", icon: "💌" },
    { id: "hobbies", label: "Hobbies", icon: "🎮" },
    { id: "business", label: "Business", icon: "📊" },
    { id: "food", label: "Food & Drink", icon: "🍽️" },
  ];

  const filteredEvents =
    selectedCategory === "all"
      ? events
      : events.filter((e) =>
          e.category
            ? e.category.toLowerCase().includes(selectedCategory.toLowerCase())
            : false,
        );

  const sliderEvents = filteredEvents.length > 0 ? filteredEvents : events;

  const sliderPages = useMemo(() => {
    if (sliderEvents.length === 0) return [] as ApiEvent[][];
    const pages: ApiEvent[][] = [];
    for (let i = 0; i < sliderEvents.length; i += 4) {
      pages.push(sliderEvents.slice(i, i + 4));
    }
    return pages;
  }, [sliderEvents]);

  useEffect(() => {
    if (sliderPages.length <= 1) return;
    const id = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % sliderPages.length);
    }, 7000);
    return () => clearInterval(id);
  }, [sliderPages.length]);

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col overflow-hidden ">
      <div className="glow-orbit" />
      <div className="grain" />

      <section className="relative z-10 flex w-full flex-1 flex-col lg:flex-row lg:min-h-0">
        <section className="flex flex-col gap-5 px-4 pt-8 pb-4 sm:px-6 sm:pt-10 sm:pb-6 lg:min-w-0 lg:w-full lg:flex-shrink-0 lg:pt-12 lg:pb-10 lg:pl-10 lg:pr-8 xl:pl-14 xl:pr-10 xl:pt-14">
          <BrowseLocationSelector
            region={displayRegion}
            onSelectRegion={setRegion}
            onUseCurrentLocation={handleUseCurrentLocation}
          />
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/40 bg-slate-900/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-sky-100">
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-slate-900">
              <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-sky-400/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
            </span>
            Live near you right now
          </div>

          <div className="space-y-2">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-5xl xl:text-6xl">
              Discover experiences{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                happening around you
              </span>
              , in real time.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-slate-400 sm:text-lg">
              Concerts, meetups, nightlife, and pop-ups—curated by location and interests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Proximity</span>
            <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-1">
              {radiusOptions.map((r) => (
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
            <span className="text-sm text-slate-400">
              {loading ? "…" : `${filteredEvents.length} events${selectedCategory !== "all" ? ` in ${categoryChips.find((c) => c.id === selectedCategory)?.label ?? ""}` : " live"}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-200">
                  {loading ? "…" : filteredEvents.length}
                </span>{" "}
                nearby
            </span>
            {/* <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              <span className="text-slate-300">Under 90s to find something tonight</span>
            </span> */}
          </div>

          {sliderPages.length > 0 && (
            <div className="mt-4 w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/80 h-85 sm:h-75">
              <div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-2.5 text-sm text-slate-300 sm:px-5 ">
                <span className="font-semibold uppercase tracking-[0.12em] text-slate-200 text-base">
                  In this area
                </span>
                <span className="text-slate-400">
                  {sliderEvents.length} event{sliderEvents.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="relative min-h-[16rem] sm:min-h-[18rem]">
                <div
                  className="absolute inset-0 flex transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${sliderIndex * 100}%)` }}
                >
                  {sliderPages.map((page, pageIdx) => (
                    <div
                      key={pageIdx}
                      className="grid min-w-full grid-cols-2 gap-3 px-3 py-3 sm:grid-cols-4 sm:px-4"
                    >
                      {[0, 1, 2, 3].map((colIdx) => {
                        const event = page[colIdx];
                        if (!event) return <div key={colIdx} className="min-w-0" />;
                        const imageUrl =
                          event.imageUrl ??
                          (event.imageUrls && event.imageUrls.length > 0
                            ? event.imageUrls[0]
                            : undefined);
                        return (
                          <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/95 text-slate-200 hover:border-sky-400/80 hover:bg-slate-900/95"
                          >
                            <div className="relative h-24 w-full flex-shrink-0 overflow-hidden sm:h-32">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={event.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-xs text-slate-500">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-3 py-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-300">
                                  {event.category}
                                </span>
                                <span className="whitespace-nowrap text-xs text-slate-400">
                                  {event.distance}
                                </span>
                              </div>
                              <p className="truncate text-sm font-semibold leading-snug text-slate-50">
                                {event.name}
                              </p>
                              <p className="line-clamp-2 min-h-[2.5em] text-xs leading-snug text-slate-400">
                                {event.location}
                              </p>
                              <div className="mt-0.5 flex items-center justify-between text-xs text-slate-400">
                                <span>{event.time}</span>
                                <span className="font-semibold text-sky-300">{event.price}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

      </section>

      <section className="mt-4 w-full px-4 pb-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-full lg:ml-4 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 sm:px-5 sm:py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-semibold uppercase tracking-[0.12em] text-slate-200 text-base">
                Browse by category
              </span>
              <p className="text-base text-slate-300">
                Tap a category to instantly filter events in this area.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-medium text-sky-300 hover:text-sky-200"
            >
              Clear
            </button>
          </div>
          <div className="mb-3">
            <BrowseLocationSelector
              region={displayRegion}
              onSelectRegion={setRegion}
              onUseCurrentLocation={handleUseCurrentLocation}
            />
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 pt-1">
            {categoryChips.map((chip) => {
              const active = selectedCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory((prev) => (prev === chip.id ? "all" : chip.id))
                  }
                  className={`flex min-w-[130px] shrink-0 flex-col items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all ${
                    active
                      ? "border-sky-400/90 bg-slate-900/95 text-sky-50 category-glow"
                      : "border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-sky-400/70 hover:bg-slate-900/90 hover:text-sky-100"
                  }`}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/90 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                    {chip.icon}
                  </span>
                  <span className="text-center text-xs leading-snug sm:text-sm">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-12 sm:px-6 lg:px-10">
        <div className="glass-panel mx-auto flex w-full max-w-full lg:ml-4 flex-col gap-4 border-slate-700/80 bg-slate-950/80 px-4 py-4 sm:px-5 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-base text-slate-300">
              <span className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-slate-700/90">
                Nearby events
              </span>
              <span className="hidden text-slate-400 sm:inline">
                Auto-curated within {radiusKm} km radius
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1.5 text-sm text-slate-300 ring-1 ring-slate-700/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.35)]" />
              Live map
            </div>
          </div>

            <div className="relative mt-1 h-[240px] w-full shrink-0 rounded-2xl border border-slate-700/80 bg-slate-950/90 overflow-hidden sm:h-[320px] md:h-[360px]">
            <EventMap
              events={filteredEvents.length > 0 ? filteredEvents : events}
              className="h-full w-full"
              centerOverride={mapCenterOverride}
            />
            {fetchError && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/90 px-4 text-center">
                <p className="text-sm text-amber-300">{fetchError}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-base text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Smart feed
                </span>
                {/* <span className="rounded-full bg-slate-900/80 px-3 py-1 text-sm text-slate-200 ring-1 ring-slate-700/70">
                  Sorted by time · distance · hype
                </span> */}
              </div>
              <Link
                href="/events"
                className="text-base font-medium text-sky-300 hover:text-sky-200"
              >
                View all
              </Link>
            </div>

          <div className="mt-1 grid min-w-0 grid-cols-1 gap-3 pb-1 sm:grid-cols-2 xl:grid-cols-4">
            {fetchError ? (
              <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 px-4 py-6 text-center">
                <p className="text-base text-amber-300">{fetchError}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Ensure the backend is running at {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}
                </p>
              </div>
            ) : loading ? (
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-8 text-center">
                <p className="text-base text-slate-400">
                  {status === "prompting" ? "Getting your location…" : "Loading events…"}
                </p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-8 text-center">
                <p className="text-base text-slate-400">No events nearby right now.</p>
                <p className="mt-2 text-sm text-slate-500">Check back soon or host your own.</p>
              </div>
              ) : (
                filteredEvents.slice(0, 8).map((event, index) => {
                  const imageUrl =
                    event.imageUrl ??
                    (event.imageUrls && event.imageUrls.length > 0
                      ? event.imageUrls[0]
                      : undefined);
                  return (
                  <div
                    key={event.id}
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/90"
                  >
                    <div className="relative h-32 w-full overflow-hidden sm:h-36">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-xs text-slate-400">
                          No image uploaded
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
                      <EventCard event={event} index={index} size="default" embedded />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
