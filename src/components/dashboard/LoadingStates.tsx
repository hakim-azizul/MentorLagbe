import { Skeleton } from "@/components/ui/skeleton";

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
