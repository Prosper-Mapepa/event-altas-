import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
      <div className="glow-orbit" />
      <div className="grain" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20 pt-20 sm:px-6 sm:pt-24 lg:flex-row lg:items-center lg:gap-14 lg:px-10">
        <section className="relative z-10 flex flex-1 flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/40 bg-slate-900/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-sky-100">
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-slate-900">
              <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-emerald-400/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live · Nearby · Now
          </div>

          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Feel the city{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                come alive
              </span>{" "}
              tonight.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              EventAtlas shows you what&apos;s happening within minutes of where you are—concerts,
              nightlife, pop-ups, business events, and everything in between. Discover, chat with
              hosts, and get tickets in a few taps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500/95 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-[0_16px_40px_rgba(56,189,248,0.5)] transition hover:bg-sky-400"
            >
              Start exploring
              <span className="text-base">→</span>
            </Link>
            <Link
              href="/host"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-100 hover:border-sky-400/70 hover:text-sky-100"
            >
              Host an event
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-sky-300 ring-1 ring-slate-700/80">
                EA
              </span>
              <span>Built for explorers, businesses, and admins.</span>
            </div>
            <div className="h-4 w-px bg-slate-700/80" />
            <span>Real-time messaging · Smart tickets · Location-aware discovery</span>
          </div>
        </section>

        <section className="relative z-10 mt-4 flex flex-1 items-center justify-center lg:mt-0">
          <div className="glass-panel relative w-full max-w-xl overflow-hidden border-slate-700/80 bg-slate-950/90 px-0 pb-0 pt-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_100%_0,rgba(129,140,248,0.3),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(45,212,191,0.24),transparent_60%)] opacity-80 mix-blend-screen" />

            <div className="relative flex flex-col gap-3 px-5 pb-4 pt-4 sm:px-6 sm:pt-5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="rounded-full bg-slate-900/90 px-3 py-1 font-semibold uppercase tracking-[0.18em] text-slate-200 ring-1 ring-slate-700/80">
                  Nearby events
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-700/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.35)]" />
                  Live map
                </span>
              </div>

              <div className="relative mt-1 h-52 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/90 sm:h-64">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0,rgba(56,189,248,0.4),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(45,212,191,0.35),transparent_55%)] opacity-80" />
                <div className="relative flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                  <div className="flex items-center gap-2 rounded-full bg-slate-950/90 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-700/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Auto-curated within 5 km radius
                  </div>
                  <p className="max-w-xs text-sm text-slate-200">
                    On Discover, you&apos;ll see pins for every event near you, plus a live smart
                    feed with images, prices, and distance.
                  </p>
                  <p className="text-xs text-slate-400">
                    Switch location, filter by category, message a host, and grab tickets in
                    seconds.
                  </p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    For explorers
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    Save events, RSVP, chat with organizers, and see tickets in one place.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    For hosts & teams
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    Publish events, manage approvals, and watch real-time demand across the city.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
