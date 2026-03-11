"use client";

import { useRef } from "react";
import type { ApiTicket } from "@/lib/api";

type Props = {
  ticket: ApiTicket;
  orderId?: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PrintableTicket({ ticket, orderId = "EA-00000" }: Props) {
  return (
    <div
      className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-slate-100 print:max-w-none print:border-2 print:border-slate-800 print:p-6"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="mb-3 flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="text-sm font-bold tracking-tight text-sky-400">EventAtlas</span>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
          {ticket.status}
        </span>
      </div>

      <h1 className="mb-3 text-base font-bold leading-tight text-slate-50 sm:text-lg">{ticket.eventName}</h1>

      <div className="space-y-2 rounded-lg bg-slate-900/60 p-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-slate-400 shrink-0">Date & Time</span>
          <span className="font-medium text-slate-100 text-right text-xs">{formatDate(ticket.eventTime)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400 shrink-0">Location</span>
          <span className="font-medium text-slate-100 text-right text-xs max-w-[55%] truncate">{ticket.eventLocation}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Ticket</span>
          <span className="font-medium text-slate-100 text-xs">{ticket.tier} × {ticket.quantity}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Price</span>
          <span className="font-semibold text-sky-300 text-sm">
            {ticket.price === 0 ? "Free" : `$${ticket.price.toFixed(2)}`}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-2 text-[11px] text-slate-500">
        <span>Order #{orderId}</span>
        <span>ID: {ticket.id.slice(0, 8)}</span>
      </div>

      <div className="mt-3 flex h-16 items-center justify-center rounded-lg border border-dashed border-slate-600 bg-slate-900/50">
        <div className="text-center">
          <p className="text-[10px] font-mono tracking-widest text-slate-400">||||| {ticket.id.slice(0, 12)} |||||</p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500">Show at door</p>
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] text-slate-500">
        Valid for entry. Present at venue.
      </p>
    </div>
  );
}
