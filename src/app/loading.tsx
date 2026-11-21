"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MENTOR_MESSAGES = [
  "Setting up your study desk...",
  "Matching you with the right mentor...",
  "Preparing today's lesson notes...",
  "Almost ready for class...",
];

export default function RootLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MENTOR_MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4"
    >
      {/* Subtle ambient glow using brand tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-brand-tint/70 blur-3xl animate-pulse"
      />

      {/* Center Card */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-border-subtle bg-surface/95 px-8 py-10 text-center shadow-xs backdrop-blur-xs">
        {/* Animated Logo Container */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Outer breathing ring */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl border border-brand/25 bg-brand-tint/40 animate-ping animation-duration-[2.6s]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-1 rounded-2xl border border-brand/30 bg-brand-tint/60 animate-pulse"
          />

          {/* Your Logo Image with gentle float & subtle scale */}
          <div className="relative z-10 h-16 w-16 animate-bounce animation-duration-[2.2s]">
            <Image
              src="/logo.png"
              alt="MentorLagbe logo"
              width={64}
              height={64}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Brand Name */}
        <p className="mt-5 text-base font-extrabold tracking-tight text-heading">
          Mentor<span className="text-brand">Lagbe</span>
        </p>

        {/* Relatable Rotating Loading Text */}
        <p className="mt-2 min-h-10 text-sm font-medium leading-snug text-body transition-opacity duration-300">
          {MENTOR_MESSAGES[messageIndex]}
        </p>

        {/* Smooth Progress Indicator Bar */}
        <div className="mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-background border border-border-subtle">
          <div className="h-full w-1/2 rounded-full bg-brand animate-[pulse_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
