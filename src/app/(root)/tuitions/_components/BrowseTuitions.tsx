"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/shared/SafeImage";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TuitionCardSkeleton } from "@/components/dashboard/LoadingStates";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import {
  fetchApprovedTuitions,
  fetchTuitions,
} from "@/lib/api/tuitionApi";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  tmode,
  tTuitionPagination,
  tTuitionView,
} from "@/lib/types/tuition";

/** পোস্ট-টিউশন ফর্মের CLASS_LEVELS-এর সাথে মিল রেখে তৈরি */
const CLASS_LEVELS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "SSC",
  "HSC",
  "Admission",
  "University",
  "Professionals",
];

const MODES: tmode[] = ["Online", "Offline", "Hybrid"];

/**
 * সর্ট অপশন — ভ্যালুগুলো ব্যাকএন্ডের `TUITION_SORTS` কী-এর সাথে মিলে।
 * `items` ম্যাপ শুধু ট্রিগারের লেবেল দেখায়, নয়তো কাঁচা ভ্যালু
 * (`fee_asc`) দেখাত।
 */
const SORTS: Record<string, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  fee_asc: "Fee: low to high",
  fee_desc: "Fee: high to low",
};

/** ডিফল্ট সর্ট — URL-এ `sort` প্যারামিটার হিসেবে রাখা হয় না। */
const DEFAULT_SORT = "newest";

/** ড্রপডাউনের "সব দেখাও" অপশন — আসল ভ্যালুর সাথে কখনো মিলবে না */
const ALL_OPTION = "__all__";

const DEBOUNCE_MS = 300;

/** ব্রাউজ পেজের আকার — সার্ভার ডিফল্ট (12)-এর সাথে মিল। */
const PAGE_SIZE = 12;

/** `/tuitions` পেজের পুরো স্টেট URL-এ এই query param গুলোতে থাকে। */
type tParamKey = "search" | "subject" | "classLevel" | "mode" | "sort" | "page";

/** ১..totalPages — মাঝখানে ellipsis সহ সংক্ষিপ্ত পেজ নম্বর তালিকা। */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const candidates = new Set<number>([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ]);
  const sorted = [...candidates]
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) result.push("…");
    result.push(value);
    previous = value;
  }
  return result;
}

function ModeIcon({ mode }: { mode: tmode }) {
  if (mode === "Online") return <Video className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

/** অ্যাভাটারের ফলব্যাক ইনিশিয়াল — টিউশনার ছবি না থাকলে। */
function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * ব্রাউজ টিউশনস — সার্চ/ফিল্টার/সর্ট সবই URL query param থেকে চলে
 * (`search`, `subject`, `classLevel`, `mode`, `sort`), তাই রিফ্রেশ বা
 * লিংক শেয়ার করলেও একই ফল পাওয়া যায়। ডেটা আসে সার্ভিস লেয়ারের
 * `fetchApprovedTuitions()` → `GET /api/tuitions` (MongoDB-তে কোয়েরি)।
 */
export default function BrowseTuitions() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ---- URL → স্টেট (সোর্স অব ট্রুথ হলো URL) --------------------------
  const search = searchParams.get("search") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const classLevel = searchParams.get("classLevel") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const sortParam = searchParams.get("sort") ?? "";
  const sort = SORTS[sortParam] ? sortParam : DEFAULT_SORT;
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  /** প্যারামিটার সেট/ডিলিট করে (`null`/খালি/ডিফল্ট সর্ট = ডিলিট)। */
  const applyParams = useCallback(
    (patch: Partial<Record<tParamKey, string | null>>) => {
      const next = new URLSearchParams(searchParams.toString());
      let changed = false;

      for (const key of Object.keys(patch) as tParamKey[]) {
        const value = patch[key];
        const drop =
          value == null ||
          value === "" ||
          (key === "sort" && value === DEFAULT_SORT);
        const present = next.has(key);
        if (drop) {
          if (present) {
            next.delete(key);
            changed = true;
          }
        } else if (next.get(key) !== value) {
          next.set(key, value as string);
          changed = true;
        }
      }

      // যেকোনো ফিল্টার/সর্ট বদলালে পেজ ১-এ ফিরে যাই (পেজ বদলালে নয়)।
      const isFilterChange = (Object.keys(patch) as tParamKey[]).some(
        (key) => key !== "page"
      );
      if (isFilterChange && next.has("page")) {
        next.delete("page");
        changed = true;
      }

      if (!changed) return;
      const query = next.toString();
      // scroll: false — ফিল্টার বদলে পেজ উপরে স্ক্রল না করে যাওয়া
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  // সার্চ ইনপুট লোকাল রাখি, ৩০০ms অপেক্ষার পর URL-এ যায় — প্রতি
  // কী-প্রেসে রিকোয়েস্ট না যাওয়ার জন্য (URL বদলালেই ডেটা রিফেচ হয়)
  const [searchInput, setSearchInput] = useState(search);
  const [lastUrlSearch, setLastUrlSearch] = useState(search);

  // ব্রাউজার ব্যাক/ফরোয়ার্ড বা Clear চাপলে URL বদলায় — ইনপুটও তার
  // সাথে মিলিয়ে নেওয়া হয়। react.dev-এর "adjust state during render"
  // প্যাটার্ন — এফেক্টে সিঙ্ক setState চলে না, তাই শর্তসাপেক্ষে রেন্ডারেই সেট হয়।
  if (lastUrlSearch !== search) {
    setLastUrlSearch(search);
    if (searchInput.trim() !== search) setSearchInput(search);
  }

  useEffect(() => {
    const term = searchInput.trim();
    // মাউন্টে বা ব্যাক/ফরোয়ার্ডে ইনপুট আর URL একই হলে কিছু করবেন না —
    // নাহলে ডিবাউন্স এফেক্ট ?page=2 মুছে দিতে পারে।
    if (term === search) return;

    const timer = setTimeout(() => {
      applyParams({ search: term || null });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search, applyParams]);

  // ---- ডেটা ----------------------------------------------------------
  const [tuitions, setTuitions] = useState<tTuitionView[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState<tTuitionPagination>({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  // সর্বশেষ রেসপন্স কোন কোয়েরির জন্য এসেছে — `loading` এখান থেকেই
  // ডিরাইভড, তাই এফেক্টে সিঙ্ক setState করতে হয় না (react-hooks নিয়ম)
  const [loaded, setLoaded] = useState<{
    query: string;
    refresh: number;
  } | null>(null);

  /** URL-এর স্টেট থেকেই ব্যাকএন্ড কোয়েরি — ডিফল্ট সর্ট যায় না। */
  const fetchOptions = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      subject: subject || undefined,
      classLevel: classLevel || undefined,
      mode: mode || undefined,
      sort: sort !== DEFAULT_SORT ? sort : undefined,
    }),
    [page, search, subject, classLevel, mode, sort],
  );
  const fetchKey = JSON.stringify(fetchOptions);

  /** চলতি কোয়েরির রেসপন্স এখনো আসেনি বা রিফ্রেশ চলছে → স্কেলেটন। */
  const loading =
    !loaded || loaded.query !== fetchKey || loaded.refresh !== refreshKey;

  // URL বদললেই রিফেচ (সার্চ আগে ডিবাউন্স হয়ে URL-এ পৌঁছেছে)। আগের
  // রিকোয়েস্ট abort হয়ে যায় — নাহলে পুরনো রেসপন্স নতুন ফিল্টারে ঢুকে পড়ত।
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchTuitions({ ...fetchOptions, signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setTuitions(result.items);
        setPagination({
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        });
        setError(null);
        setLoaded({ query: fetchKey, refresh: refreshKey });
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setTuitions([]);
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again."
        );
        setLoaded({ query: fetchKey, refresh: refreshKey });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetchOptions, fetchKey, refreshKey]);

  // সাবজেক্ট ড্রপডাউনের তালিকা আসে আনফিল্টারড রেসপন্স থেকে,
  // নাহলে ফিল্টার দিলেই বাকি অপশনগুলো মুছে যায়
  useEffect(() => {
    const controller = new AbortController();
    fetchApprovedTuitions("limit=50", controller.signal)
      .then((rows) =>
        setSubjects([...new Set(rows.map((item) => item.subject))].sort())
      )
      .catch(() => {
        // সাইলেন্ট — সাবজেক্ট লোড না হলেও মূল তালিকা চলবে
      });
    return () => controller.abort();
  }, [refreshKey]);

  const hasFilters = Boolean(search.trim() || subject || classLevel || mode);

  /** ড্রপডাউন/সর্ট পরিবর্তন → URL আপডেট (ALL_OPTION = প্যারামিটার রিমুভ)। */
  const handleFilterChange = (key: tParamKey, value: string) => {
    const patch: Partial<Record<tParamKey, string | null>> = {};
    patch[key] = value === ALL_OPTION || value === "" ? null : value;
    applyParams(patch);
  };

  /** ফিল্টার ক্লিয়ার — সর্ট অক্ষত থাকে (সর্ট ফিল্টার নয়, ক্রম নির্দেশক)। */
  const clearFilters = () => {
    setSearchInput("");
    applyParams({ search: null, subject: null, classLevel: null, mode: null });
    toast.add({
      title: "Filters cleared",
      description: "Showing all approved tuitions again.",
      type: "info",
    });
  };

  const handleRefresh = () => {
    setRefreshKey((key) => key + 1);
    toast.add({
      title: "Refreshing tuitions",
      description: "Loading the latest listings.",
      type: "info",
    });
  };

  /** পেজ বদলালে URL আপডেট + তালিকার উপরে স्मুদ_scroll। */
  const handlePageChange = (nextPage: number) => {
    if (
      nextPage === page ||
      nextPage < 1 ||
      nextPage > pagination.totalPages
    ) {
      return;
    }
    applyParams({ page: String(nextPage) });
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      {/* ফিল্টার বার — প্রতিটি কন্ট্রোল URL প্যারামিটার ড্রাইভড */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-body" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title or subject..."
            aria-label="Search tuitions"
            className="border-border-subtle bg-background pl-9"
          />
        </div>

        <Select
          value={subject || ALL_OPTION}
          items={{ [ALL_OPTION]: "All subjects" }}
          onValueChange={(value) =>
            handleFilterChange("subject", String(value ?? ALL_OPTION))
          }
        >
          <SelectTrigger
            size="default"
            className="w-full border-border-subtle bg-background lg:w-44"
          >
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION}>All subjects</SelectItem>
            {subjects.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={classLevel || ALL_OPTION}
          items={{ [ALL_OPTION]: "All class levels" }}
          onValueChange={(value) =>
            handleFilterChange("classLevel", String(value ?? ALL_OPTION))
          }
        >
          <SelectTrigger
            size="default"
            className="w-full border-border-subtle bg-background lg:w-44"
          >
            <SelectValue placeholder="All class levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION}>All class levels</SelectItem>
            {CLASS_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={mode || ALL_OPTION}
          items={{ [ALL_OPTION]: "All modes" }}
          onValueChange={(value) =>
            handleFilterChange("mode", String(value ?? ALL_OPTION))
          }
        >
          <SelectTrigger
            size="default"
            className="w-full border-border-subtle bg-background lg:w-40"
          >
            <SelectValue placeholder="All modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION}>All modes</SelectItem>
            {MODES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          items={SORTS}
          onValueChange={(value) =>
            handleFilterChange("sort", String(value ?? DEFAULT_SORT))
          }
        >
          <SelectTrigger
            size="default"
            aria-label="Sort tuitions"
            className="w-full border-border-subtle bg-background lg:w-44"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORTS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="border-border-subtle bg-background text-heading hover:bg-brand-tint hover:border-brand/40"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Result count */}
      {!loading && !error && (
        <p className="mt-4 text-sm text-body" aria-live="polite">
          {pagination.totalItems === 0
            ? "No tuitions found"
            : `${pagination.totalItems} tuition${pagination.totalItems === 1 ? "" : "s"} available`}
        </p>
      )}

      {/* States */}
      <div ref={resultsRef} className="mt-6 scroll-mt-24">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <TuitionCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border-subtle bg-surface py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 dark:text-amber-400" />
            <p className="text-sm text-body">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              className="gap-2 border-border-subtle bg-background text-heading hover:bg-brand-tint"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : tuitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border-subtle bg-surface py-16 text-center">
            <BookOpen className="h-10 w-10 text-brand" />
            <p className="text-lg font-semibold text-heading">
              No tuitions match your filters
            </p>
            <p className="text-sm text-body">
              Try different keywords or clear the filters.
            </p>
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="mt-2 gap-2 border-border-subtle bg-background text-heading hover:bg-brand-tint"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition) => (
              <article
                key={tuition._id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border-subtle bg-background transition-all duration-300 hover:border-brand/40 hover:shadow-xl"
              >
                {/* Banner + overlay badges */}
                <div className="relative h-48 w-full overflow-hidden bg-surface">
                  {tuition.bannerImage ? (
                    <SafeImage
                      src={tuition.bannerImage}
                      alt={tuition.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      fallback={
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-tint">
                          <BookOpen className="h-10 w-10 text-brand" />
                        </div>
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-tint">
                      <BookOpen className="h-10 w-10 text-brand" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1 text-xs font-bold text-heading shadow-sm">
                      <ModeIcon mode={tuition.mode} />
                      {tuition.mode}
                    </span>
                  </div>

                  <div className="absolute top-3 right-12">
                    <span className="rounded-lg bg-background/90 px-2.5 py-1 text-xs font-semibold text-heading shadow-xs backdrop-blur-md">
                      {tuition.classLevel}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <BookmarkButton tuitionId={tuition._id} />
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center justify-between text-xs font-medium text-body">
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

                  {tuition.location && (
                    <p className="flex items-center gap-1.5 text-xs text-body">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                      <span className="truncate">{tuition.location}</span>
                    </p>
                  )}

                  <p className="line-clamp-2 text-sm text-body">
                    {tuition.description}
                  </p>

                  {/* Footer: tutor + fee + details link */}
                  <div className="mt-auto space-y-4 pt-2">
                    <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                      <div className="flex items-center gap-2.5">
                        {/* টিউশনার ছবি — না থাকলে ইনিশিয়াল (ডিটেইলস পেজের মতোই) */}
                        {tuition.tutor.image ? (
                          <SafeImage
                            src={tuition.tutor.image}
                            alt={tuition.tutor.name}
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-xl border border-border-subtle object-cover"
                            fallback={
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand/20 bg-brand-tint text-xs font-bold text-heading">
                                {initials(tuition.tutor.name)}
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand/20 bg-brand-tint text-xs font-bold text-heading">
                            {initials(tuition.tutor.name)}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs text-body">Tutor</p>
                          <p className="max-w-30 truncate text-sm font-semibold text-heading">
                            {tuition.tutor.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-xs text-body">
                          Monthly Fee
                        </span>
                        <span className="text-base font-extrabold text-heading">
                          {formatCurrency(tuition.monthlyFee)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/tuitions/${tuition._id}`} className="block">
                      <Button className="w-full cursor-pointer rounded-xl bg-brand py-5 font-semibold text-heading shadow-xs transition-all hover:bg-brand-hover">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Pagination — URL- driven, fully keyboard accessible */}
      {!loading && !error && pagination.totalPages > 1 && (
        <nav
          aria-label="Tuition pages"
          className="mt-8 flex flex-col items-center gap-4"
        >
          <p className="text-sm text-body">
            Page{" "}
            <span className="font-semibold text-heading">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-heading">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrevPage}
              aria-label="Previous page"
              className="gap-1 border-border-subtle bg-background text-heading hover:bg-brand-tint"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {pageNumbers(page, pagination.totalPages).map((item, index) =>
              item === "…" ? (
                <span
                  key={`gap-${index}`}
                  aria-hidden="true"
                  className="px-1 text-sm text-body"
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  onClick={() => handlePageChange(item)}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={`Go to page ${item}`}
                  className={cn(
                    "h-8 min-w-8 border px-2.5",
                    item === page
                      ? "border-brand bg-brand font-bold text-primary-foreground"
                      : "border-border-subtle bg-background text-heading hover:bg-brand-tint"
                  )}
                >
                  {item}
                </Button>
              )
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNextPage}
              aria-label="Next page"
              className="gap-1 border-border-subtle bg-background text-heading hover:bg-brand-tint"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}
    </>
  );
}
