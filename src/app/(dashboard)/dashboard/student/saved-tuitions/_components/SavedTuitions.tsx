"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Calendar, GraduationCap, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/dashboard/PageHeader";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import EmptyState from "@/components/dashboard/EmptyState";
import { TuitionCardSkeleton } from "@/components/dashboard/LoadingStates";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { useApi } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/format";
import type { tTuitionView } from "@/lib/types/tuition";

type SavedTuitionView = tTuitionView & { savedAt?: string | null };

/** Saved Tuitions-এর মূল ক্লায়েন্ট ভিউ — লোডিং/খালি/এরর স্টেট সহ। */
export default function SavedTuitions({ email }: { email: string }) {
  const { data, loading, error, refetch } = useApi<SavedTuitionView[]>(
    "/api/saved-tuitions",
  );
  const tuitions = data ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Saved Tuitions"
        description={`Bookmarks for ${email} — open a tuition or remove it anytime.`}
        actions={
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover"
          >
            Browse Tuitions
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <TuitionCardSkeleton key={index} />
          ))}
        </div>
      ) : !error && tuitions.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved tuitions yet"
          description="Tap the bookmark icon on any tuition to keep it here for later."
          action={
            <Link href="/tuitions">
              <Button className="gap-2 bg-brand font-semibold text-heading hover:bg-brand-hover">
                Explore tuitions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tuitions.map((tuition) => (
            <article
              key={tuition._id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border-subtle bg-background transition-all duration-300 hover:border-brand/40 hover:shadow-xl"
            >
              <div className="relative h-44 w-full overflow-hidden bg-surface">
                {tuition.bannerImage ? (
                  <Image
                    src={tuition.bannerImage}
                    alt={tuition.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-tint">
                    <GraduationCap className="h-10 w-10 text-brand" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <BookmarkButton
                    tuitionId={tuition._id}
                    onChanged={(saved) => {
                      if (!saved) refetch();
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-body">
                  <span className="rounded-full border border-brand/30 bg-brand-tint px-2.5 py-1 font-semibold uppercase tracking-wider text-heading">
                    {tuition.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {tuition.daysPerWeek} days/week
                  </span>
                </div>

                <h2 className="line-clamp-2 text-lg font-bold text-heading transition-colors group-hover:text-brand">
                  {tuition.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-body">
                  <span className="flex items-center gap-1.5">
                    {tuition.mode === "Online" ? (
                      <Video className="h-3.5 w-3.5 text-brand" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 text-brand" />
                    )}
                    {tuition.mode}
                  </span>
                  <span className="rounded-md bg-surface px-2 py-0.5">
                    {tuition.classLevel}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-body">
                  {tuition.description}
                </p>

                <div className="mt-auto space-y-3 pt-2">
                  <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                    <span className="truncate text-sm font-semibold text-heading">
                      {tuition.tutor?.name || tuition.tutorName}
                    </span>
                    <span className="text-base font-extrabold text-heading">
                      {formatCurrency(tuition.monthlyFee)}
                    </span>
                  </div>

                  <Link href={`/tuitions/${tuition._id}`} className="block">
                    <Button className="w-full cursor-pointer gap-2 rounded-xl bg-brand py-5 font-semibold text-heading shadow-xs transition-all hover:bg-brand-hover">
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
