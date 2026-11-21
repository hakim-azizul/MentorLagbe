"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-14 sm:px-6 lg:px-8">
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-tint/60 blur-3xl"
      />

      {/* Ruled Notebook Sheet */}
      <article className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-sm">
        {/* SVG Ruled Horizontal Lines */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-border-subtle/60"
        >
          <defs>
            <pattern
              id="notebook-ruled-lines"
              width="100%"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="35"
                x2="100%"
                y2="35"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#notebook-ruled-lines)" />
        </svg>

        {/* Left Notebook Margin Line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-11 w-px bg-rose-400/35 sm:left-14"
        />

        {/* Notebook Content */}
        <div className="relative py-8 pl-15 pr-6 sm:py-11 sm:pl-20 sm:pr-10">
          {/* Top Header & Graded Score Stamp */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-tight text-heading">
                Mentor<span className="text-brand">Lagbe</span>
              </p>
              <p className="mt-0.5 text-xs font-medium text-body">
                Subject: Navigation · Off-Syllabus Route
              </p>
            </div>

            {/* Red-ink graded mark (0/10) */}
            <div
              aria-label="Score 0 out of 10"
              className="relative flex h-12 w-20 -rotate-6 items-center justify-center rounded-full border-2 border-rose-400/80 font-mono text-lg font-extrabold tracking-tight text-rose-400 select-none sm:h-14 sm:w-24 sm:text-xl"
            >
              <span>0/10</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 rounded-full border border-rose-400/45 rotate-6"
              />
            </div>
          </div>

          {/* Highlighted Red-Ink Circled 404 */}
          <div className="mt-6 flex flex-col items-start">
            <div className="relative inline-flex items-center justify-center px-6 py-2">
              <span className="text-6xl font-black tracking-tight text-rose-400 sm:text-7xl">
                404
              </span>
              <svg
                viewBox="0 0 220 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-2 -inset-y-1 h-[calc(100%+8px)] w-[calc(100%+16px)] text-rose-400/80"
              >
                <path
                  d="M18 56C16 24 58 8 112 9C168 10 206 28 204 58C202 88 158 102 106 101C52 100 14 82 22 48C26 30 46 19 68 15"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Teacher / Mentor note */}
            <p className="mt-2 -rotate-1 font-serif text-base italic font-semibold text-rose-400 sm:text-lg">
              See me after class!
            </p>
          </div>

          {/* Concise Main Headline & Route Info */}
          <div className="mt-5">
            <h1 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
              This page is not on the syllabus
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-body sm:text-base">
              <code className="rounded-md border border-border-subtle bg-background/90 px-2 py-0.5 font-mono text-xs text-heading sm:text-sm">
                {pathname || "/unknown-page"}
              </code>{" "}
              could not be found. The link may be broken or outdated.
            </p>
          </div>

          {/* Spacer */}
          <div className="my-8 h-px w-full bg-border-subtle/70" />

          {/* 1. Home, 2. Dashboard, 3. Recent */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-95 active:scale-[0.99]"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Home</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-background px-4 py-3 text-sm font-semibold text-heading transition-all hover:border-border-strong hover:bg-surface active:scale-[0.99]"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0 text-body" />
              <span>Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-background px-4 py-3 text-sm font-semibold text-heading transition-all hover:border-border-strong hover:bg-surface active:scale-[0.99] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-body" />
              <span>Recent</span>
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
