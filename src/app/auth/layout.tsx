import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="glow-orbit" />
      <div className="grain" />
      <Link
        href="/discover"
        className="absolute left-6 top-6 z-10 flex items-center gap-2 text-[11px] text-slate-400 transition-colors hover:text-slate-100"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-400/40">
          <span className="text-sm font-semibold tracking-tight text-sky-300">
            EA
          </span>
        </span>
        <span className="font-medium">EventAtlas</span>
      </Link>
      <main className="relative z-10 w-full max-w-md">{children}</main>
    </div>
  );
}
