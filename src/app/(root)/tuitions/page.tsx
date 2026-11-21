import type { Metadata } from "next";
import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TuitionCardSkeleton } from "@/components/dashboard/LoadingStates";
import BrowseTuitions from "./_components/BrowseTuitions";

export const metadata: Metadata = {
  title: "Browse Tuitions",
  description:
    "Explore approved and active tuition listings from verified tutors — search, filter by subject, class level and mode, and sort by date or fee.",
};

/**
 * `/tuitions` — সার্চ/ফিল্টার/সর্ট/পেজ সবই URL query param-এ চলে
 * (`search`, `subject`, `classLevel`, `mode`, `sort`, `page`), তাই রিফ্রেশ বা
 * লিংক শেয়ার করলেও একই ফল পাওয়া যায়। `useSearchParams` ব্যবহারে
 * Next.js ডকস অনুযায়ী Suspense বাউন্ডারি বাধ্যতামূলক — শুরুতে
 * স্কেলেটন দেখায়, তারপর ক্লায়েন্টে ডেটা লোড হয়।
 */
export default function TuitionsPage() {
  return (
    <div className="bg-background">
      {/* Page header — সার্ভার কম্পোনেন্ট, লোডিং সময়ও থেকে যায় */}
      <section className="border-b border-border-subtle bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading">
            <GraduationCap className="h-3.5 w-3.5 text-brand" />
            <span>Verified Listings</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            Browse Tuitions
          </h1>
          <p className="mt-2 max-w-2xl text-base text-body">
            Explore approved and active tuition listings from verified tutors —
            filter by subject, class level and mode to find your perfect match.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<BrowseSkeleton />}>
          <BrowseTuitions />
        </Suspense>
      </div>
    </div>
  );
}

/** Suspense ফলব্যাক — ফিল্টার বার + কার্ড গ্রিডের স্কেলেটন। */
function BrowseSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Skeleton className="h-10 min-w-52 flex-1" />
        <Skeleton className="h-10 w-full lg:w-44" />
        <Skeleton className="h-10 w-full lg:w-44" />
        <Skeleton className="h-10 w-full lg:w-40" />
        <Skeleton className="h-10 w-full lg:w-44" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <TuitionCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
}
