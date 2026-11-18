"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { fetchApprovedTuitions } from "@/lib/api/tuitionApi";
import { formatCurrency } from "@/lib/format";
import type { tmode, tTuitionView } from "@/lib/types/tuition";

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

/** ড্রপডাউনের "সব দেখাও" অপশন — আসল ভ্যালুর সাথে কখনো মিলবে না */
const ALL_OPTION = "__all__";

const DEBOUNCE_MS = 300;

function ModeIcon({ mode }: { mode: tmode }) {
  if (mode === "Online") return <Video className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

export default function BrowseTuitionsPage() {
  const [tuitions, setTuitions] = useState<tTuitionView[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    let cancelled = false;

    // সার্চ টাইপ করার সময় বারবার রিকোয়েস্ট না যায় তাই ডিবাউন্স
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      const term = search.trim();
      if (term) params.set("search", term);
      if (subject) params.set("subject", subject);
      if (classLevel) params.set("classLevel", classLevel);
      if (mode) params.set("mode", mode);
      const queryString = params.toString();

      setLoading(true);
      setError(null);
      try {
        const data = await fetchApprovedTuitions(queryString || undefined);
        if (cancelled) return;
        setTuitions(data);
        // সাবজেক্ট ড্রপডাউনের তালিকা আসে আনফিল্টারড রেসপন্স থেকে,
        // নাহলে ফিল্টার দিলেই বাকি অপশনগুলো মুছে যায়
        if (!queryString) {
          setSubjects([...new Set(data.map((item) => item.subject))].sort());
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, subject, classLevel, mode, refreshKey]);

  const hasFilters = Boolean(search.trim() || subject || classLevel || mode);

  const clearFilters = () => {
    setSearch("");
    setSubject("");
    setClassLevel("");
    setMode("");
  };

  return (
    <div className="bg-background">
      {/* Page header */}
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
        {/* Filter bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-body" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or subject..."
              aria-label="Search tuitions"
              className="border-border-subtle bg-background pl-9"
            />
          </div>

          <Select
            value={subject || ALL_OPTION}
            items={{ [ALL_OPTION]: "All subjects" }}
            onValueChange={(value) =>
              setSubject(value === ALL_OPTION ? "" : String(value ?? ""))
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
              setClassLevel(value === ALL_OPTION ? "" : String(value ?? ""))
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
              setMode(value === ALL_OPTION ? "" : String(value ?? ""))
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
            {tuitions.length === 0
              ? "No tuitions found"
              : `${tuitions.length} tuition${tuitions.length === 1 ? "" : "s"} available`}
          </p>
        )}

        {/* States */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-96 w-full rounded-3xl" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border-subtle bg-surface py-16 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="text-sm text-body">{error}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRefreshKey((key) => key + 1)}
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
                      <Image
                        src={tuition.bannerImage}
                        alt={tuition.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
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

                    <div className="absolute top-3 right-3">
                      <span className="rounded-lg bg-background/90 px-2.5 py-1 text-xs font-semibold text-heading shadow-xs backdrop-blur-md">
                        {tuition.classLevel}
                      </span>
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
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand/20 bg-brand-tint text-xs font-bold text-heading">
                            {(tuition.tutorName || "?")
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs text-body">Tutor</p>
                            <p className="max-w-30 truncate text-sm font-semibold text-heading">
                              {tuition.tutorName}
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
      </div>
    </div>
  );
}
