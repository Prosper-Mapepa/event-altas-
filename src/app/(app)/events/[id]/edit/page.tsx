"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { events, uploadEventImage } from "@/lib/api";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import Link from "next/link";

const CATEGORIES = ["Music", "Nightlife", "Technology", "Business", "Wellness", "Food"];
const SF_CENTER = { lat: 37.7749, lng: -122.4194 };

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState(SF_CENTER.lat);
  const [lng, setLng] = useState(SF_CENTER.lng);
  const [category, setCategory] = useState("Music");
  const [startAt, setStartAt] = useState("");
  const [price, setPrice] = useState<number | "">(0);
  const [isFree, setIsFree] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!id || !user) return;
    events
      .getById(id)
      .then((event) => {
        setName(event.name);
        setLocation(event.location);
        setLat((event as { lat?: number }).lat ?? SF_CENTER.lat);
        setLng((event as { lng?: number }).lng ?? SF_CENTER.lng);
        setCategory(event.category);
        const d = new Date((event as { startAt?: string }).startAt ?? Date.now());
        setStartAt(d.toISOString().slice(0, 16));
        const tiers = (event as { tiers?: Array<{ price: number }> }).tiers;
        const priceCents = tiers?.[0]?.price ?? 0;
        setIsFree(priceCents === 0);
        setPrice(priceCents / 100);
        const urls = (event as { imageUrls?: string[] }).imageUrls;
        const primary = (event as { imageUrl?: string }).imageUrl;
        if (urls?.length) setImageUrls(urls);
        else if (primary) setImageUrls([primary]);
      })
      .catch(() => setError("Event not found"))
      .finally(() => setLoading(false));
  }, [id, user]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    setNewImageFiles((prev) => [...prev, ...images]);
    setNewImagePreviews((prev) => [...prev, ...images.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeExisting(i: number) {
    setImageUrls((prev) => prev.filter((_, j) => j !== i));
  }

  function removeNew(i: number) {
    setNewImageFiles((prev) => prev.filter((_, j) => j !== i));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, j) => j !== i);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const role = user.role ?? "explorer";
    if (role !== "business" && role !== "admin") return;
    setError(null);
    setSaving(true);
    try {
      const uploaded: string[] = [];
      for (const file of newImageFiles) {
        const { url } = await uploadEventImage(file);
        uploaded.push(url);
      }
      const allUrls = [...imageUrls, ...uploaded];
      const date = startAt ? new Date(startAt) : new Date(Date.now() + 2 * 60 * 60 * 1000);
      const priceCents = isFree ? 0 : Math.round((typeof price === "number" ? price : 0) * 100);
      await events.update(id, {
        name: name || "My Event",
        category,
        location: location || "San Francisco",
        lat,
        lng,
        startAt: date.toISOString(),
        priceFrom: priceCents,
        priceTo: priceCents,
        imageUrls: allUrls,
        imageUrl: allUrls[0] ?? null,
        tiers: [{ name: "General Admission", description: "Standard entry", price: priceCents }],
      });
      router.push(`/events/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update event.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <p className="text-amber-300">{error}</p>
        <Link href="/discover" className="text-sky-400 hover:text-sky-300">
          Back to discover
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <header className="relative z-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Edit event</h1>
        <Link href={`/events/${id}`} className="text-sm text-sky-400 hover:text-sky-300">
          Cancel
        </Link>
      </header>

      <form
        className="relative z-10 mx-auto w-full max-w-xl space-y-4"
        onSubmit={handleSubmit}
      >
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
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
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
            placeholder="Address, city, zip..."
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
            Price
          </label>
          <div className="flex items-center gap-4">
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
                <span className="text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={price === "" ? "" : price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
            Images
          </label>
          <div className="flex flex-wrap gap-3">
            {imageUrls.map((url, i) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-700/80" />
                <button
                  type="button"
                  onClick={() => removeExisting(i)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500/90 px-1.5 py-0.5 text-xs text-white hover:bg-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            {newImagePreviews.map((url, i) => (
              <div key={`new-${i}`} className="relative">
                <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-700/80" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500/90 px-1.5 py-0.5 text-xs text-white hover:bg-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => (document.getElementById("edit-image-input") as HTMLInputElement)?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-600/80 bg-slate-950/70 text-slate-400 hover:border-sky-500/50 hover:text-sky-300"
            >
              + Image
            </button>
            <input
              id="edit-image-input"
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
                onClick={() => setCategory(tag)}
                className={`tag inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  category === tag
                    ? "border-sky-400/60 bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/50"
                    : "text-slate-200 hover:border-sky-400/60 hover:bg-slate-800/60 hover:text-sky-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-sky-500/90 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
