import { HostEventForm } from "@/components/HostEventForm";

export default function HostPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="glow-orbit" />
      <div className="grain" />

      <section className="relative z-10 grid w-full gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-sky-500/40 bg-slate-900/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-100 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.35)]" />
            For organizers · venues · curators
          </div>
          <div className="space-y-4">
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl lg:text-[2.6rem]">
              Host events that feel{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                alive on the map
              </span>
              .
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300/90 sm:text-[15px]">
              Create beautiful listings in seconds, sell tickets securely, and watch
              your crowd materialize in real time. EventAtlas gives you analytics,
              smart promotion, and a live radar of who&apos;s on the way.
            </p>
          </div>

          <ul className="mt-3 grid gap-3 text-[11px] text-slate-200 sm:grid-cols-2">
            <li className="rounded-2xl bg-slate-950/80 px-4 py-3 ring-1 ring-slate-800/80">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Tickets & payouts
              </span>
              <p className="mt-1 text-xs text-slate-200">
                Multiple ticket tiers, instant confirmations, transparent fees.
              </p>
            </li>
            <li className="rounded-2xl bg-slate-950/80 px-4 py-3 ring-1 ring-slate-800/80">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Discovery boost
              </span>
              <p className="mt-1 text-xs text-slate-200">
                Reach locals based on interests, past attendance, and friends.
              </p>
            </li>
          </ul>
        </div>

        <div className="glass-panel relative flex flex-col gap-4 border-slate-700/80 bg-slate-950/90 px-6 pb-6 pt-6 sm:px-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
              Create an event
            </h2>
            <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-200 ring-1 ring-slate-700/80">
              3 steps · under 2 min
            </span>
          </div>

          <HostEventForm />
        </div>
      </section>
    </div>
  );
}

