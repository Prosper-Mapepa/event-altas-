import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { events as eventsApi } from "@/lib/api";

type CheckoutPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;
  let event;
  try {
    event = await eventsApi.getById(id);
  } catch {
    notFound();
  }
  if (!event) notFound();

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <header className="relative z-10">
        <Link
          href={`/events/${event.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100"
        >
          ← Back to event
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-2 text-base text-slate-300">
          {event.name} · {event.time}
        </p>
      </header>

      <CheckoutForm
        eventId={event.id}
        eventName={event.name}
        eventTime={event.time}
        tiers={event.tiers}
      />
    </div>
  );
}
