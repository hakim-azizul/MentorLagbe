"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Video,
  MapPin,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const popularTags = [
  "HSC Physics",
  "SSC Math",
  "IELTS",
  "Programming",
  "English Spoken",
];

export default function HeroBanner() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tuitions?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/tuitions");
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-background pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
      {/* Subtle Background Decorative Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 -z-10 h-105 w-105 rounded-full bg-brand-tint/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-75 w-75 rounded-full bg-surface blur-2xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Headline, Search & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Trusted by 5,000+ Students & Verified Mentors</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-[54px] lg:leading-[1.12]">
              Find Your Ideal{" "}
              <span className="relative inline-block text-brand">
                Tutor
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 text-brand/35"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 9.5C55 3 145 3 198 9.5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              or Mentorship Batch Today
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl text-base leading-relaxed text-body sm:text-lg">
              Connect with verified subject specialists for 1-on-1 home tuition
              or structured online mentorship batches tailored to your class
              level, schedule, and budget.
            </p>

            {/* Interactive Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface p-2 shadow-sm sm:flex-row sm:items-center focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all max-w-2xl"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
                <Search className="h-5 w-5 shrink-0 text-body" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject, class (e.g. HSC Physics, Math)..."
                  className="w-full bg-transparent text-sm text-heading placeholder:text-body/70 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                className="bg-brand hover:bg-brand-hover text-heading font-semibold px-6 py-5 rounded-xl shadow-xs cursor-pointer shrink-0"
              >
                Search Tuitions
              </Button>
            </form>

            {/* Quick Subject Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-body">Popular:</span>
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tuitions?search=${encodeURIComponent(tag)}`}
                  className="rounded-lg border border-border-subtle bg-background px-2.5 py-1 font-medium text-body transition hover:border-brand hover:bg-brand-tint hover:text-heading"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href="/tuitions">
                <Button
                  size="lg"
                  className="bg-heading hover:bg-heading/90 text-background font-semibold px-6 rounded-xl gap-2 cursor-pointer"
                >
                  Browse All Tuitions
                  <ArrowRight className="h-4 w-4 text-brand" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border-subtle bg-background hover:bg-surface text-heading font-semibold px-6 rounded-xl cursor-pointer"
                >
                  Become a Mentor
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Modern Smart UI EdTech Illustration Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Featured Tuition Preview Card */}
              <div className="rounded-3xl border border-border-subtle bg-background p-6 shadow-xl shadow-heading/5">
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint text-heading font-bold text-lg border border-brand/20">
                      AR
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-heading text-base">
                          Tanvir Ahmed
                        </h3>
                        <CheckCircle2 className="h-4 w-4 text-brand fill-brand-tint" />
                      </div>
                      <p className="text-xs text-body">
                        BUET CSE • 4+ Yrs Experience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-brand-tint px-2.5 py-1 text-xs font-bold text-heading">
                    <Star className="h-3.5 w-3.5 fill-brand text-brand" />
                    <span>4.9</span>
                  </div>
                </div>

                {/* Tuition Batch Highlight */}
                <div className="my-5 rounded-2xl bg-surface p-4 border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-heading">
                      <Video className="h-3.5 w-3.5 text-brand" />
                      Online Live Batch
                    </span>
                    <span className="text-sm font-extrabold text-heading">
                      ৳2,500
                      <span className="text-xs font-normal text-body">/mo</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-heading text-base">
                    HSC Higher Math & Physics Special Care Batch
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-body">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-brand" />3 Days /
                      Week
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-brand" />4 Seats Left
                    </span>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full border-2 border-background bg-brand-tint flex items-center justify-center text-[10px] font-bold text-heading">
                      S1
                    </div>
                    <div className="h-7 w-7 rounded-full border-2 border-background bg-surface flex items-center justify-center text-[10px] font-bold text-heading">
                      S2
                    </div>
                    <div className="h-7 w-7 rounded-full border-2 border-background bg-brand text-heading flex items-center justify-center text-[10px] font-bold">
                      +18
                    </div>
                  </div>
                  <Link
                    href="/tuitions"
                    className="inline-flex items-center gap-1 text-xs font-bold text-heading hover:text-brand transition-colors"
                  >
                    View Batch Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Floating Stat Badge (Bottom Left) */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-6 flex items-center gap-3 rounded-2xl border border-border-subtle bg-background px-4 py-3 shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-heading">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-body">
                    Available Modes
                  </p>
                  <p className="text-sm font-bold text-heading">
                    Home & Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
