"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  eventId: string;
  hostId?: string | null;
};

export function EditEventButton({ eventId, hostId }: Props) {
  const { user } = useAuth();
  if (!user) return null;
  const role = user.role ?? "explorer";
  const isHost = hostId === user.id;
  const isAdmin = role === "admin";
  if (!isHost && !isAdmin) return null;

  return (
    <Link
      href={`/events/${eventId}/edit`}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:bg-slate-800/80 hover:text-sky-100"
    >
      Edit event
    </Link>
  );
}
