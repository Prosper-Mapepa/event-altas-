"use client";

import { useCallback } from "react";
import type { ApiTicket } from "@/lib/api";
import { PrintableTicket } from "./PrintableTicket";

type Props = {
  ticket: ApiTicket;
  orderId?: string;
  className?: string;
};

export function DownloadTicketButton({ ticket, orderId = "EA-00000", className = "" }: Props) {
  const handleDownload = useCallback(() => {
    const printWindow = window.open("", "_blank", "width=500,height=700");
    if (!printWindow) return;
    const dateStr = new Date(ticket.eventTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${ticket.eventName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #0f172a;
              color: #f1f5f9;
              min-height: 100vh;
              padding: 2rem;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 18px;
            }
            .ticket {
              width: 100%;
              max-width: 480px;
              border-radius: 1.25rem;
              border: 3px solid #334155;
              background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
              padding: 2rem;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            }
            .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1.25rem; border-bottom: 2px solid #334155; margin-bottom: 1.25rem; }
            .brand { font-size: 1.5rem; font-weight: 700; color: #38bdf8; letter-spacing: -0.02em; }
            .status { background: rgba(52,211,153,0.25); color: #34d399; padding: 0.35rem 1rem; border-radius: 9999px; font-size: 1rem; font-weight: 600; }
            h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; line-height: 1.3; color: #f8fafc; }
            .details { background: rgba(15,23,42,0.8); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.5rem; }
            .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; font-size: 1.05rem; gap: 1rem; }
            .row:last-child { margin-bottom: 0; }
            .label { color: #94a3b8; font-size: 0.95rem; flex-shrink: 0; }
            .value { font-weight: 600; color: #f1f5f9; text-align: right; }
            .price { color: #38bdf8; font-size: 1.15rem; }
            .footer { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 2px solid #334155; font-size: 1rem; color: #64748b; display: flex; justify-content: space-between; }
            .qr { margin-top: 1.5rem; height: 7rem; border: 3px dashed #475569; border-radius: 1rem; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; flex-direction: column; }
            .qr code { font-family: monospace; font-size: 1rem; color: #94a3b8; letter-spacing: 0.15em; }
            .qr-label { font-size: 1rem; color: #64748b; margin-top: 0.5rem; font-weight: 500; }
            .note { margin-top: 1.25rem; text-align: center; font-size: 1rem; color: #64748b; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <span class="brand">EventAtlas</span>
              <span class="status">${ticket.status}</span>
            </div>
            <h1>${ticket.eventName}</h1>
            <div class="details">
              <div class="row"><span class="label">Date & Time</span><span class="value">${dateStr}</span></div>
              <div class="row"><span class="label">Location</span><span class="value" style="max-width:58%">${ticket.eventLocation}</span></div>
              <div class="row"><span class="label">Ticket</span><span class="value">${ticket.tier} × ${ticket.quantity}</span></div>
              <div class="row"><span class="label">Price</span><span class="value price">${ticket.price === 0 ? "Free" : "$" + ticket.price.toFixed(2)}</span></div>
            </div>
            <div class="footer">
              <span>Order #${orderId}</span>
              <span>Ticket ID: ${ticket.id.slice(0, 8)}</span>
            </div>
            <div class="qr"><code>||||| ${ticket.id.slice(0, 12)} |||||</code><span class="qr-label">Show at door</span></div>
            <p class="note">Valid for entry. Present this ticket at the venue.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 250);
  }, [ticket, orderId]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:bg-slate-800/80 hover:text-sky-100 ${className}`}
    >
      Download ticket
    </button>
  );
}
