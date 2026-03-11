"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps";

export type BrowseRegion =
  | { type: "current"; label: string }
  | { type: "city"; label: string; lat: number; lng: number };

type Props = {
  region: BrowseRegion;
  onSelectRegion: (region: BrowseRegion) => void;
  onUseCurrentLocation: () => void;
  className?: string;
};

type Prediction = {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
};

export function BrowseLocationSelector({
  region,
  onSelectRegion,
  onUseCurrentLocation,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const autocompleteService = useMemo(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google?.maps?.places) return null;
    return new window.google.maps.places.AutocompleteService();
  }, [isLoaded]);

  const placesService = useMemo(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google?.maps?.places) return null;
    const dummy = document.createElement("div");
    return new window.google.maps.places.PlacesService(dummy);
  }, [isLoaded]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !autocompleteService) return;
    const q = search.trim();
    if (!q) {
      setPredictions([]);
      return;
    }
    autocompleteService.getPlacePredictions(
      {
        input: q,
        types: ["(regions)"],
      },
      (results) => {
        if (!results) {
          setPredictions([]);
          return;
        }
        setPredictions(
          results.map((r) => ({
            description: r.description,
            placeId: r.place_id!,
            mainText: r.structured_formatting?.main_text ?? r.description,
            secondaryText: r.structured_formatting?.secondary_text ?? "",
          })),
        );
      },
    );
  }, [search, open, autocompleteService]);

  const handleSelectPrediction = (prediction: Prediction) => {
    if (!placesService) return;
    placesService.getDetails(
      {
        placeId: prediction.placeId,
        fields: ["formatted_address", "geometry", "name"],
      },
      (place, status) => {
        if (!place || status !== window.google.maps.places.PlacesServiceStatus.OK) return;
        const label = place.formatted_address ?? place.name ?? prediction.description;
        const loc = place.geometry?.location;
        if (!loc) return;
        onSelectRegion({
          type: "city",
          label,
          lat: loc.lat(),
          lng: loc.lng(),
        });
        setSearch("");
        setPredictions([]);
        setOpen(false);
      },
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-sky-500/60 bg-slate-950/80 px-4 py-2.5 text-left text-sm font-medium text-slate-100 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] transition-colors hover:border-sky-400 hover:bg-slate-900/90"
      >
        <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Browsing events in
        </span>
        <span className="text-sm font-semibold text-sky-300 truncate max-w-[11rem]">
          {region.label}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[100] mt-1.5 min-w-[320px] rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <div className="border-b border-slate-700/80 p-3">
            <button
              type="button"
              onClick={() => {
                onUseCurrentLocation();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-slate-900/80 px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span className="font-medium">Use my current location</span>
            </button>
          </div>
          <div className="p-3">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Search anywhere in the world
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="City, region or country..."
              className="w-full rounded-full border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
              autoComplete="off"
              disabled={!apiKey || !isLoaded}
            />
            <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
              {(!apiKey || !isLoaded) && (
                <p className="px-1 py-2 text-xs text-slate-500">
                  Location search is unavailable. Check your Google Maps API key.
                </p>
              )}
              {apiKey && isLoaded && search.trim() && predictions.length === 0 && (
                <p className="px-1 py-2 text-xs text-slate-500">No matches found.</p>
              )}
              {predictions.map((p) => (
                <button
                  key={p.placeId}
                  type="button"
                  onClick={() => handleSelectPrediction(p)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-100 transition-colors hover:bg-slate-900"
                >
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-slate-50">{p.mainText}</span>
                    {p.secondaryText && (
                      <span className="text-xs text-slate-400">{p.secondaryText}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
