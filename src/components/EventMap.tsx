"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from "@react-google-maps/api";
import type { NearbyEvent } from "@/lib/events";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 };
const defaultZoom = 13;

type EventMapProps = {
  events: NearbyEvent[];
  className?: string;
  /** When set (e.g. selected city), map centers here instead of user/events. */
  centerOverride?: { lat: number; lng: number } | null;
};

export function EventMap({ events, className = "", centerOverride = null }: EventMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<NearbyEvent | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const wrapperClass = `overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/90 h-full min-h-[14rem] ${className}`;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center ${wrapperClass}`}>
        <p className="text-sm text-slate-400">
          Map is unavailable. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to view the live map.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const center = useMemo(() => {
    if (centerOverride) return centerOverride;
    if (userLocation) return userLocation;
    if (events.length === 0) return defaultCenter;
    const avgLat = events.reduce((s, e) => s + e.lat, 0) / events.length;
    const avgLng = events.reduce((s, e) => s + e.lng, 0) / events.length;
    return { lat: avgLat, lng: avgLng };
  }, [events, userLocation, centerOverride]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Fit bounds to show all events + user when we have points
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;
    if (userLocation) {
      bounds.extend(userLocation);
      hasPoints = true;
    }
    events.forEach((e) => {
      bounds.extend({ lat: e.lat, lng: e.lng });
      hasPoints = true;
    });
    if (hasPoints) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [events, userLocation]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center ${wrapperClass}`}>
        <p className="text-sm text-slate-400">Unable to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center animate-pulse ${wrapperClass}`}>
        <p className="text-sm text-slate-400">Loading map…</p>
      </div>
    );
  }

  return (
    <div className={`relative ${wrapperClass}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            { featureType: "all", elementType: "geometry", stylers: [{ color: "#1a1f2e" }] },
            { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#0f172a" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
            {
              featureType: "administrative",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f1f5f9" }],
            },
            {
              featureType: "administrative",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#0f172a" }, { weight: 2 }],
            },
            {
              featureType: "administrative.neighborhood",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f8fafc" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f1f5f9" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#0f172a" }, { weight: 2 }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#cbd5e1" }],
            },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={80}
              options={{
                fillColor: "#38bdf8",
                fillOpacity: 0.4,
                strokeColor: "#0ea5e9",
                strokeOpacity: 1,
                strokeWeight: 3,
              }}
            />
            <Marker position={userLocation} title="Your location" label={{ text: "You", color: "#0f172a", fontWeight: "bold" }} />
          </>
        )}
        {events.map((event) => (
          <Marker
            key={event.id}
            position={{ lat: event.lat, lng: event.lng }}
            title={event.name}
            onClick={() => setSelectedEvent(event)}
          />
        ))}
        {selectedEvent && (
          <InfoWindow
            position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <div className="min-w-[220px] max-w-[280px] rounded-lg bg-slate-900 p-4 text-left" style={{ fontSize: "15px" }}>
              <h3 className="text-base font-semibold text-slate-50">{selectedEvent.name}</h3>
              <p className="mt-1.5 text-sm text-slate-400">
                {selectedEvent.category} · {selectedEvent.distance}
              </p>
              <p className="mt-1 text-sm text-slate-300">{selectedEvent.time}</p>
              <p className="mt-1 text-sm font-medium text-sky-300">{selectedEvent.price}</p>
              <a
                href={`/events/${selectedEvent.id}`}
                className="mt-3 block w-full rounded-lg bg-sky-500/90 px-3 py-2 text-center text-sm font-semibold text-slate-950 hover:bg-sky-400"
              >
                View event
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
