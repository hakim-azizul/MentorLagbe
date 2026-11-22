"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/shared/SafeImage";
import {
  BookOpen,
  MapPin,
  Video,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tTuitionView } from "@/lib/types/tuition";
import { fetchApprovedTuitions } from "@/lib/api/tuitionApi";
import { TuitionCardSkeleton } from "@/components/dashboard/LoadingStates";
import BookmarkButton from "@/components/shared/BookmarkButton";

export type tmode = "Online" | "Offline";

interface FeaturedTuitionsProps {
  tuitions?: tTuitionView[];
}

const MAX_FEATURED = 6;

export default function FeaturedTuitions({
  tuitions: initialTuitions,
}: FeaturedTuitionsProps) {
  const hasInitialTuitions = Array.isArray(initialTuitions);
  const [tuitions, setTuitions] = useState<tTuitionView[]>(() =>
    hasInitialTuitions ? initialTuitions.slice(0, MAX_FEATURED) : []
  );
  const [loading, setLoading] = useState<boolean>(!hasInitialTuitions);

  useEffect(() => {
    if (hasInitialTuitions) {
      return;
    }

    const controller = new AbortController();
    let active = true;

    fetchApprovedTuitions(`limit=${MAX_FEATURED}`, controller.signal)
      .then((list) => {
        if (!active) return;
        setTuitions(Array.isArray(list) ? list.slice(0, MAX_FEATURED) : []);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if ((error as { name?: string })?.name === "AbortError") return;
        console.error("Failed to fetch featured tuitions:", error);
        setTuitions([]);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [hasInitialTuitions]);

  return (
    <section className="bg-surface py-16 sm:py-24 border-b border-border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Handpicked for You</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              Featured Tuition & Mentorship Batches
            </h2>
            <p className="mt-2 text-base text-body max-w-2xl">
              Browse approved tuitions from verified tutors and find the right fit for your class, subject and schedule.
            </p>
          </div>
          <Link href="/tuitions">
            <Button
              variant="outline"
              className="border-border-subtle bg-background hover:bg-brand-tint hover:border-brand/40 text-heading font-semibold gap-2 cursor-pointer shrink-0"
            >
              Browse All Tuitions
              <ArrowRight className="h-4 w-4 text-brand" />
            </Button>
          </Link>
        </div>

        {/* Loading / Empty / Data States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: MAX_FEATURED }).map((_, idx) => (
              <TuitionCardSkeleton key={idx} />
            ))}
          </div>
        ) : tuitions.length === 0 ? (
          <div className="rounded-3xl border border-border-subtle bg-background p-10 text-center">
            <p className="text-base font-semibold text-heading">
              No featured tuitions available right now.
            </p>
            <p className="mt-1 text-sm text-body">
              Please check back later or browse all active tuition listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tuitions.slice(0, MAX_FEATURED).map((item) => {
              const tutorName = item.tutor?.name || item.tutorName || "Tutor";
              const tutorImage = item.tutor?.image || "";
              const initials = tutorName
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={item._id}
                  className="group flex flex-col justify-between rounded-3xl border border-border-subtle bg-background overflow-hidden shadow-xs transition-all duration-300 hover:shadow-xl hover:border-brand/40"
                >
                  {/* Card Top: Banner Image & Badges */}
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-surface">
                      <SafeImage
                        src={
                          item.bannerImage ||
                          "/tuition-placeholder.svg"
                        }
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fallback={
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-tint">
                            <BookOpen className="h-10 w-10 text-brand" />
                          </div>
                        }
                      />
                      {/* Mode Badge (Online / Offline) */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold shadow-sm ${
                            item.mode === "Online"
                              ? "bg-brand text-heading"
                              : "bg-heading text-background"
                          }`}
                        >
                          {item.mode === "Online" ? (
                            <Video className="h-3.5 w-3.5" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5 text-brand" />
                          )}
                          {item.mode}
                        </span>
                      </div>

                      {/* Class Level Badge + Bookmark */}
                      <div className="absolute top-3 right-12">
                        <span className="rounded-lg bg-background/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-heading shadow-xs">
                          {item.classLevel}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <BookmarkButton tuitionId={item._id} />
                      </div>
                    </div>

                    {/* Card Body Info */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium text-body">
                        <span className="text-brand font-semibold uppercase tracking-wider">
                          {item.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-body" />
                          {item.daysPerWeek} days/week
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-heading line-clamp-2 group-hover:text-brand transition-colors">
                        {item.title}
                      </h3>

                      {/* Location or Mode Details */}
                      {item.mode === "Offline" && item.location && (
                        <p className="flex items-center gap-1.5 text-xs text-body">
                          <MapPin className="h-3.5 w-3.5 text-brand shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-sm text-body line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Tutor Info, Price & View Details Button */}
                  <div className="p-6 pt-0 mt-auto space-y-4">
                    <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {tutorImage ? (
                          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-brand/20 shrink-0">
                            <SafeImage
                              src={tutorImage}
                              alt={tutorName}
                              fill
                              sizes="36px"
                              className="object-cover"
                              fallback={
                                <div className="flex h-full w-full items-center justify-center bg-brand-tint text-[10px] font-bold text-heading">
                                  {initials}
                                </div>
                              }
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-tint text-heading font-bold text-xs border border-brand/20 shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-body">Tutor</p>
                          <p className="text-sm font-semibold text-heading truncate max-w-30">
                            {tutorName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-body block">
                          Monthly Fee
                        </span>
                        <span className="text-base font-extrabold text-heading">
                          ৳{Number(item.monthlyFee || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link href={`/tuitions/${item._id}`} className="block">
                      <Button className="w-full bg-brand hover:bg-brand-hover text-heading font-semibold py-5 rounded-xl shadow-xs transition-all cursor-pointer">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}