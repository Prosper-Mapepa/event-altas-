"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { events, uploadEventImage } from "@/lib/api";
import { LocationAutocomplete } from "./LocationAutocomplete";

const CATEGORIES = ["Music", "Nightlife", "Technology", "Business", "Wellness", "Food"];
const SF_CENTER = { lat: 37.7749, lng: -122.4194 };

/** Format a Date for datetime-local input (YYYY-MM-DDTHH:mm). Backend expects ISO string; we send toISOString(). */
function toDateTimeLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

/** Minimum value for datetime-local (now, rounded to next 15 min). */
function getMinDateTimeLocal(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return toDateTimeLocal(d);
}

export function HostEventForm() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState(SF_CENTER.lat);
  const [lng, setLng] = useState(SF_CENTER.lng);
  const [category, setCategory] = useState("Music");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [price, setPrice] = useState<number | "">(0);
  const [isFree, setIsFree] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    setImageFiles((prev) => [...prev, ...images]);
    setImagePreviews((prev) => [...prev, ...images.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }
    const role = user.role ?? "explorer";
    if (role !== "business" && role !== "admin") {
      setError("Only business or admin accounts can create events. Sign up as business to host.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const { url } = await uploadEventImage(file);
        imageUrls.push(url);
      }
      // Backend expects ISO 8601 strings; controller uses new Date(startAt) / new Date(endAt)
      const startDate = startAt ? new Date(startAt) : new Date(Date.now() + 2 * 60 * 60 * 1000);
      const endDate = endAt ? new Date(endAt) : undefined;
      const priceCents = isFree ? 0 : Math.round((typeof price === "number" ? price : 0) * 100);
      await events.create({
        name: name || "My Event",
        category,
        location: location || "San Francisco",
        lat,
        lng,
        startAt: startDate.toISOString(),
        ...(endDate && endDate.getTime() > startDate.getTime() ? { endAt: endDate.toISOString() } : {}),
        highlight: "Just listed",
        imageUrls,
        priceFrom: priceCents,
        priceTo: priceCents,
        tiers: [{ name: "General Admission", description: "Standard entry", price: priceCents }],
      });
      router.push("/discover");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create event.");
    } finally {
      setLoading(false);
    }
  }

  const priceDisplay = isFree ? "Free" : `From $${typeof price === "number" ? price.toFixed(0) : "0"}`;

  return (
    <form className="mt-1 space-y-4 text-sm text-slate-200" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>
      )}
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
          Event title
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Neon Nights Rooftop Sessions"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
          Location
        </label>
        <LocationAutocomplete
          value={location}
          onChange={(addr, newLat, newLng) => {
            setLocation(addr);
            setLat(newLat || SF_CENTER.lat);
            setLng(newLng || SF_CENTER.lng);
          }}
          placeholder="Address, city, zip, county..."
          className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
        />
        <p className="text-xs text-slate-500">Select from suggestions for accurate address, zip, and coordinates</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
          Date & time
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Start</span>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              min={getMinDateTimeLocal()}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70 [color-scheme:dark]"
              aria-label="Event start date and time"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">End (optional)</span>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              min={startAt || getMinDateTimeLocal()}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70 [color-scheme:dark]"
              aria-label="Event end date and time"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">Times are in your local timezone. Sent to backend as ISO 8601.</p>
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
          Price
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => {
                setIsFree(e.target.checked);
                if (e.target.checked) setPrice(0);
              }}
              className="rounded border-slate-600 bg-slate-900 text-sky-500"
            />
            <span className="text-sm text-slate-300">Free</span>
          </label>
          {!isFree && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price === "" ? "" : price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-24 rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
              />
              <span className="text-sm text-slate-500">per ticket</span>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
          Event images
        </label>
        <p className="text-xs text-slate-500">Upload multiple images. They will appear in a slider on the event page.</p>
        <div className="flex flex-wrap items-center gap-3">
          {imagePreviews.map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt={`Preview ${i + 1}`}
                className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-700/80"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1 -top-1 rounded-full bg-red-500/90 px-1.5 py-0.5 text-xs text-white hover:bg-red-500"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-600/80 bg-slate-950/70 text-slate-400 transition-colors hover:border-sky-500/50 hover:text-sky-300"
          >
            + Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCategory(tag);
              }}
              className={`tag inline-flex cursor-pointer select-none items-center gap-2 px-4 py-2 text-sm transition-colors ${
                category === tag
                  ? "border-sky-400/60 bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/50"
                  : "text-slate-200 hover:border-sky-400/60 hover:bg-slate-800/60 hover:text-sky-100"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${category === tag ? "bg-sky-400" : "bg-slate-500"}`} />
              {tag}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500/90 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_18px_45px_rgba(56,189,248,0.8)] transition-colors hover:bg-sky-400 disabled:opacity-60"
      >
        {loading ? "Creating…" : isFree ? "Start hosting · Free event" : `Start hosting · ${priceDisplay}`}
      </button>
      {!user && (
        <p className="mt-2 text-[10px] text-amber-300/90">
          Sign in to create events. You&apos;ll be redirected to sign in when you submit.
        </p>
      )}
    </form>
  );
}
