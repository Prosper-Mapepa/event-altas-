"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { engagement } from "@/lib/api";

type Props = {
  eventId: string;
  host?: { id: string; name: string | null; role: string } | null;
};

export function EventEngagementButtons({ eventId, host }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [rsvp, setRsvp] = useState<"going" | "interested" | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    engagement
      .checkEvent(eventId)
      .then(({ saved: s, rsvp: r }) => {
        setSaved(s);
        setRsvp(r);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, eventId]);

  useEffect(() => {
    if (!user || !host) return;
    engagement
      .checkFollow(host.id)
      .then(({ following: f }) => setFollowing(f))
      .catch(() => {});
  }, [user, host]);

  if (!user) return null;
  if (loading) return <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-800/60" />;

  async function toggleSave() {
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await engagement.unsaveEvent(eventId);
        setSaved(false);
      } else {
        await engagement.saveEvent(eventId);
        setSaved(true);
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  async function toggleRsvp(status: "going" | "interested") {
    if (busy) return;
    setBusy(true);
    try {
      if (rsvp === status) {
        await engagement.unrsvp(eventId);
        setRsvp(null);
      } else {
        await engagement.rsvp(eventId, status);
        setRsvp(status);
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  async function toggleFollow() {
    if (!host || busy) return;
    setBusy(true);
    try {
      if (following) {
        await engagement.unfollow(host.id);
        setFollowing(false);
      } else {
        await engagement.follow(host.id);
        setFollowing(true);
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={toggleSave}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
          saved
            ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40"
            : "border border-slate-600/80 bg-slate-900/80 text-slate-300 hover:border-slate-500/80 hover:bg-slate-800/80"
        }`}
      >
        {saved ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
        {saved ? "Saved" : "Save"}
      </button>

      <div className="flex items-center gap-1 rounded-xl border border-slate-600/80 bg-slate-900/80 p-0.5">
        <button
          onClick={() => toggleRsvp("going")}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            rsvp === "going"
              ? "bg-emerald-500/20 text-emerald-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Going
        </button>
        <button
          onClick={() => toggleRsvp("interested")}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            rsvp === "interested"
              ? "bg-amber-500/20 text-amber-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Interested
        </button>
        {rsvp && (
          <button
            onClick={() => toggleRsvp(rsvp)}
            disabled={busy}
            className="rounded-lg px-2 py-1.5 text-[10px] text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {host && host.role === "business" && (
        <button
          onClick={toggleFollow}
          disabled={busy}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
            following
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
              : "border border-slate-600/80 bg-slate-900/80 text-slate-300 hover:border-slate-500/80 hover:bg-slate-800/80"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {following ? "Following" : "Follow host"}
        </button>
      )}
    </div>
  );
}
