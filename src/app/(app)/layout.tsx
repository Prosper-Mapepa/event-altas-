"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { MessagesNavLink } from "@/components/MessagesNavLink";

const baseRoutes = [
  { href: "/discover", label: "Discover" },
  { href: "/map", label: "Map" },
  { href: "/tickets", label: "My Tickets" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Profile" },
];

function MobileNav() {
  const { user } = useAuth();
  const routes = [
    ...baseRoutes,
    ...(user?.role === "explorer" ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(user?.role === "business" ? [{ href: "/dashboard/business", label: "Dashboard" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <>
      {routes.map((route) =>
        route.href === "/messages" ? (
          <MessagesNavLink key={route.href} mobile />
        ) : (
          <Link
            key={route.href}
            href={route.href}
            className="flex flex-1 flex-col items-center gap-0.5 text-[10px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            <span className="truncate">{route.label}</span>
          </Link>
        )
      )}
    </>
  );
}

function NavInner() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const routes = [
    ...baseRoutes,
    ...(user?.role === "explorer" ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(user?.role === "business" ? [{ href: "/dashboard/business", label: "Dashboard" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <>
      <nav className="flex w-full items-center justify-between gap-4 px-4 py-3 text-[11px] text-slate-300 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-400/40">
            <span className="absolute inset-0 rounded-xl bg-sky-400/10 blur-xl" />
            <span className="relative text-sm font-semibold tracking-tight text-sky-300">
              EA
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight text-slate-50">
              EventAtlas
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {routes.map((route) => {
            if (route.href === "/messages") {
              return <MessagesNavLink key={route.href} />;
            }
            const active =
              pathname === route.href ||
              (route.href === "/discover" && pathname === "/");

            return (
              <Link
                key={route.href}
                href={route.href}
                className={`text-xs font-medium uppercase tracking-[0.16em] ${
                  active ? "text-sky-100" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {route.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <button
              onClick={() => signOut()}
              className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-700/70 transition-colors hover:bg-slate-900/80 hover:text-slate-100 lg:inline-flex"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/sign-in"
              className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-700/70 transition-colors hover:bg-slate-900/80 hover:text-slate-100 lg:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/host"
            className="pill inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-50 shadow-lg shadow-sky-500/30"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.35)]" />
            Host an event
          </Link>
        </div>

        {/* Mobile hamburger */}
        <Link
          href="/host"
          className="pill mr-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-50 shadow-lg shadow-sky-500/30 md:hidden"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.35)]" />
          Host an event
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 p-2 text-xs text-slate-200 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="flex h-3 w-3 flex-col justify-between">
            <span className="h-[1px] w-full bg-slate-300" />
            <span className="h-[1px] w-full bg-slate-300" />
            <span className="h-[1px] w-full bg-slate-300" />
          </span>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-b border-slate-800/70 bg-slate-950/98 px-4 pb-3 pt-2 text-xs text-slate-200 md:hidden">
          <div className="flex flex-col gap-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center justify-between rounded-full px-3 py-1.5 ${
                  pathname === route.href ||
                  (route.href === "/discover" && pathname === "/")
                    ? "bg-slate-900 text-sky-100"
                    : "text-slate-300 hover:bg-slate-900/80 hover:text-slate-50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="uppercase tracking-[0.16em]">{route.label}</span>
              </Link>
            ))}

            <div className="mt-1 flex items-center justify-between gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/70 hover:bg-slate-900/80 hover:text-slate-100"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/70 hover:bg-slate-900/80 hover:text-slate-100"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/host"
                onClick={() => setMobileOpen(false)}
                className="pill inline-flex flex-1 items-center justify-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-50 shadow-lg shadow-sky-500/30"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.35)]" />
                Host an event
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <LocationProvider>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/30 backdrop-blur-xl">
          <NavInner />
        </header>

        <main className="flex-1">{children}</main>

      <div className="fixed inset-x-0 bottom-3 z-40 mx-auto flex max-w-xs items-center justify-center md:hidden">
        <div className="pill flex w-full items-center justify-between px-3 py-1.5 text-[11px] text-slate-200">
          <MobileNav />
        </div>
      </div>
    </div>
      </LocationProvider>
    </SocketProvider>
  );
}

