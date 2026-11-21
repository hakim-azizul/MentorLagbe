import { Skeleton } from "@/components/ui/skeleton";

/**
 * টিউশন কার্ডের আসল লেআউটের সাথে মিল রেখে — ব্যানার, ব্যাজ, শিরোনাম,
 * মেটা, টিউটর ও ফি ফুটার। FeaturedTuitions ও BrowseTuitions দুটোতেই ব্যবহৃত।
 */
export function TuitionCardSkeleton() {
  return (
    <div
      className="flex h-96 flex-col overflow-hidden rounded-3xl border border-border-subtle bg-background"
      aria-busy="true"
    >
      <div className="relative h-48 w-full shrink-0 bg-surface">
        <Skeleton className="absolute top-3 left-3 h-6 w-20 rounded-lg bg-background/80" />
        <Skeleton className="absolute top-3 right-3 h-6 w-16 rounded-lg bg-background/80" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full bg-surface" />
          <Skeleton className="h-3 w-20 bg-surface" />
        </div>
        <Skeleton className="h-6 w-4/5 bg-surface" />
        <Skeleton className="h-4 w-full bg-surface" />
        <Skeleton className="h-4 w-2/3 bg-surface" />

        <div className="mt-auto space-y-3 pt-2">
          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 rounded-xl bg-surface" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-10 bg-surface" />
                <Skeleton className="h-4 w-24 bg-surface" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="ml-auto h-3 w-16 bg-surface" />
              <Skeleton className="ml-auto h-5 w-14 bg-surface" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-xl bg-surface" />
        </div>
      </div>
    </div>
  );
}

/** Public route-এর হিরো + কার্ড গ্রিড — `(root)/loading.tsx` ফলব্যাক। */
export function PublicPageSkeleton() {
  return (
    <div className="bg-surface/60">
      <section className="border-b border-border-subtle bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-4xl space-y-4 px-4 text-center sm:px-6">
          <Skeleton className="mx-auto h-7 w-48 rounded-full bg-surface" />
          <Skeleton className="mx-auto h-10 w-3/4 bg-surface" />
          <Skeleton className="mx-auto h-4 w-2/3 bg-surface" />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <TuitionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

/** সাইন-ইন / সাইন-আপ ফর্ম কার্ডের স্কেলেটন — `(auth)/loading.tsx`। */
export function AuthFormSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="w-full max-w-md space-y-7 rounded-3xl border border-border-subtle bg-background p-8 shadow-xl shadow-heading/5"
        aria-busy="true"
      >
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-6 w-40 rounded-full bg-surface" />
          <Skeleton className="mx-auto h-8 w-2/3 bg-surface" />
          <Skeleton className="mx-auto h-4 w-3/4 bg-surface" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-2xl bg-surface" />
          <Skeleton className="h-11 w-full rounded-2xl bg-surface" />
          <Skeleton className="h-11 w-full rounded-2xl bg-surface" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl bg-surface" />
      </div>
    </div>
  );
}

/** স্ট্যাট কার্ড লোড হওয়ার সময়ের স্কেলেটন */
export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border-subtle bg-background p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="w-2/3 space-y-3">
          <Skeleton className="h-3 w-24 bg-surface" />
          <Skeleton className="h-8 w-20 bg-surface" />
        </div>
        <Skeleton className="h-11 w-11 rounded-2xl bg-surface" />
      </div>
      <div className="mt-4 border-t border-border-subtle pt-3">
        <Skeleton className="h-3 w-32 bg-surface" />
      </div>
    </div>
  );
}

/** টেবিল লোড হওয়ার সময়ের স্কেলেটন */
export function TableSkeleton({
  rows = 4,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-3xl border border-border-subtle bg-background p-4 sm:p-5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40 bg-surface" />
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-3">
            {Array.from({ length: columns }).map((__, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 flex-1 rounded-lg bg-surface"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ওভারভিউ পেজের নিচের "দ্রুত অ্যাকশন" প্যানেল — লোডিংয়ে প্যানেলটি
 * অদৃশ্য হয়ে লেআউট শিফট হওয়া রোধ করে।
 */
export function PanelSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <div
      className="mt-6 rounded-3xl border border-border-subtle bg-background p-6"
      aria-busy="true"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-md space-y-2">
          <Skeleton className="h-5 w-52 bg-surface" />
          <Skeleton className="h-4 w-full bg-surface" />
          <Skeleton className="h-4 w-2/3 bg-surface" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: actions }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-10 w-32 rounded-xl bg-surface"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** অ্যাডমিন ওভারভিউয়ের ৩-কলাম কুইক-লিংক কার্ড। */
export function QuickLinksSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-busy="true">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-3xl border border-border-subtle bg-background p-5"
        >
          <Skeleton className="h-4 w-3/4 bg-surface" />
          <Skeleton className="h-3 w-full bg-surface" />
          <Skeleton className="h-3 w-2/3 bg-surface" />
        </div>
      ))}
    </div>
  );
}

/** `/tuitions/[id]` ডিটেইলস পেজের ২-কলাম লেআউটের স্কেলেটন। */
export function TuitionDetailsSkeleton() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3" aria-busy="true">
          {/* বাঁ পাশ — ব্যানার, ব্যাজ, শিরোনাম, বিবরণ */}
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-56 w-full rounded-3xl bg-surface sm:h-72" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-surface" />
              <Skeleton className="h-6 w-16 rounded-full bg-surface" />
              <Skeleton className="h-6 w-24 rounded-full bg-surface" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-9 w-3/4 bg-surface" />
              <Skeleton className="h-4 w-2/3 bg-surface" />
            </div>
            <div className="space-y-3 rounded-3xl border border-border-subtle bg-surface p-6">
              <Skeleton className="h-5 w-40 bg-surface" />
              <Skeleton className="h-4 w-full bg-surface" />
              <Skeleton className="h-4 w-full bg-surface" />
              <Skeleton className="h-4 w-4/5 bg-surface" />
            </div>
          </div>

          {/* ডান পাশ — ফি কার্ড + টিউটর কার্ড */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-5 rounded-3xl border border-border-subtle bg-surface p-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-surface" />
                  <Skeleton className="h-10 w-32 bg-surface" />
                </div>
                <Skeleton className="h-11 w-full rounded-xl bg-surface" />
                <Skeleton className="h-14 w-full rounded-xl bg-surface" />
              </div>
              <div className="space-y-4 rounded-3xl border border-border-subtle bg-surface p-6">
                <Skeleton className="h-3 w-28 bg-surface" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-2xl bg-surface" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 bg-surface" />
                    <Skeleton className="h-3 w-14 bg-surface" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full bg-surface" />
                <Skeleton className="h-4 w-2/3 bg-surface" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
