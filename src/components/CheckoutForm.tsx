"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tickets } from "@/lib/api";

type Tier = { name: string; description?: string; price: number };

type CheckoutFormProps = {
  eventId: string;
  eventName: string;
  eventTime: string;
  tiers: Tier[];
};

export function CheckoutForm({
  eventId,
  eventName,
  eventTime,
  tiers,
}: CheckoutFormProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => tiers.reduce((acc, t, i) => ({ ...acc, [t.name]: i === 0 ? 1 : 0 }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = tiers
    .filter((t) => (quantities[t.name] ?? 0) > 0)
    .map((t) => ({
      tier: t.name,
      price: t.price / 100,
      quantity: quantities[t.name] ?? 0,
    }));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const fee = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + fee;

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      await tickets.createOrder({
        eventId,
        items: items.map((i) => ({
          tier: i.tier,
          price: i.price,
          quantity: i.quantity,
        })),
      });
      router.push(`/events/${eventId}/checkout/success`);
    } catch {
      setError("Could not place order. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative z-10 grid w-full gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-6">
        <div className="glass-panel border-slate-700/80 bg-slate-950/90 px-5 py-5 sm:px-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
            Select tickets
          </h2>
          <div className="space-y-3">
            {tiers.map((tier, i) => {
              const qty = quantities[tier.name] ?? 0;
              const priceDollars = tier.price / 100;
              return (
                <div
                  key={tier.name}
                  className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 ring-1 ${
                    i === 1 ? "border-amber-500/30 bg-slate-950/80 ring-amber-500/20" : "border border-slate-700/80 bg-slate-950/80"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        i === 1 ? "text-amber-100" : "text-slate-50"
                      }`}
                    >
                      {tier.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {tier.description ?? ""} · {tier.price === 0 ? "Free" : `$${priceDollars} each`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantities((prev) => ({
                          ...prev,
                          [tier.name]: Math.max(0, (prev[tier.name] ?? 0) - 1),
                        }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950/70 text-slate-300 transition-colors hover:bg-slate-800/80 hover:text-slate-100"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium text-slate-100">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantities((prev) => ({
                          ...prev,
                          [tier.name]: (prev[tier.name] ?? 0) + 1,
                        }))
                      }
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950/70 text-slate-300 transition-colors hover:border-sky-500/50 hover:text-sky-200 ${
                        i === 1 ? "hover:border-amber-500/50 hover:text-amber-200" : "hover:bg-sky-500/20"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass-panel border-slate-700/80 bg-slate-950/90 px-5 py-5 sm:px-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
            Payment
          </h2>
          <p className="text-base text-slate-400">
            Payment form placeholder. In production, integrate Stripe.
          </p>
        </div>
      </div>
      <aside className="glass-panel sticky top-24 flex flex-col gap-5 border-slate-700/80 bg-slate-950/90 px-5 py-5 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
          Order summary
        </h2>
        <div className="space-y-2 border-b border-slate-700/80 pb-4 text-sm text-slate-300">
          {items.map((i) => (
            <div key={i.tier} className="flex justify-between">
              <span>{i.quantity} × {i.tier}</span>
              <span>${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          {items.length > 0 && (
            <div className="flex justify-between">
              <span>Service fee (8%)</span>
              <span>${fee.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between text-base font-semibold text-slate-50">
          <span>Total</span>
          <span className="text-sky-200">${total.toFixed(2)}</span>
        </div>
        {error && (
          <div className="rounded-xl bg-red-500/10 px-4 py-2.5 text-base text-red-300">
            {error}
          </div>
        )}
        <button
          onClick={handlePlaceOrder}
          disabled={loading || items.length === 0}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/90 px-4 py-3.5 text-base font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_14px_40px_rgba(56,189,248,0.45)] transition-colors hover:bg-sky-400 disabled:opacity-60"
        >
          {loading ? "Processing…" : `Place order · $${total.toFixed(2)}`}
        </button>
        <p className="text-sm text-slate-500">
          Secure payment powered by Stripe. Your card is never stored.
        </p>
      </aside>
    </section>
  );
}
