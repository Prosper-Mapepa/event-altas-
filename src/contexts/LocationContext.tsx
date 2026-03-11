"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type LocationStatus = "idle" | "prompting" | "granted" | "denied" | "unavailable" | "error";

type LocationContextValue = {
  lat: number | null;
  lng: number | null;
  status: LocationStatus;
  error: string | null;
  requestLocation: () => void;
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 };

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      setStatus("unavailable");
      setError("Geolocation is not supported");
      return;
    }
    setStatus("prompting");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setStatus("granted");
        setError(null);
      },
      (err) => {
        setStatus(err.code === 1 ? "denied" : "error");
        setError(err.message || "Could not get location");
        setLat(null);
        setLng(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    requestLocation();
  }, [requestLocation]);

  const value: LocationContextValue = {
    lat,
    lng,
    status,
    error,
    requestLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    return {
      lat: null,
      lng: null,
      status: "idle" as LocationStatus,
      error: null,
      requestLocation: () => {},
      coordsForApi: () => ({ lat: defaultCenter.lat, lng: defaultCenter.lng }),
    };
  }
  return {
    ...ctx,
    coordsForApi: () =>
      ctx.lat != null && ctx.lng != null
        ? { lat: ctx.lat, lng: ctx.lng }
        : { lat: defaultCenter.lat, lng: defaultCenter.lng },
  };
}
