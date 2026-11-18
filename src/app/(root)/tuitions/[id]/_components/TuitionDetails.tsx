"use client";

import Image from "next/image";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/format";
import type { tTuitionDetails, tmode } from "@/lib/types/tuition";
import ApplySection from "./ApplySection";

function ModeIcon({ mode }: { mode: tmode }) {
  if (mode === "Online") return <Video className="h-4 w-4 text-brand" />;
  return <MapPin className="h-4 w-4 text-brand" />;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

/**
 * পাবলিক টিউশন ডিটেইলস — ২-কলাম লেআউট:
 * বাঁয়ে বিস্তারিত, ডানে sticky ফি + টিউশনার কার্ড ও আবেদন ফ্লো।
 */
export default function TuitionDetails({
  tuition,
}: {
  tuition: tTuitionDetails;
}) {
  const { tutor } = tuition;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ---------------- Main details (left) ---------------- */}
          <div className="space-y-6 lg:col-span-2">
            {/* Banner */}
            <div className="relative h-56 w-full overflow-hidden rounded-3xl border border-border-subtle bg-surface sm:h-72">
              {tuition.bannerImage ? (
                <Image
                  src={tuition.bannerImage}
                  alt={tuition.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-tint">
                  <BookOpen className="h-12 w-12 text-brand" />
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="h-6 bg-brand px-3 text-heading">
                {tuition.subject}
              </Badge>
              <Badge className="h-6 bg-heading px-3 text-background">
                {tuition.mode}
              </Badge>
              <Badge
                variant="outline"
                className="h-6 border-border-subtle bg-surface px-3 text-heading"
              >
                {tuition.classLevel}
              </Badge>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
                {tuition.title}
              </h1>

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-body">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-brand" />
                  {tuition.subject}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-brand" />
                  {tuition.daysPerWeek} days/week
                </span>
                {tuition.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand" />
                    {tuition.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand" />
                  Posted {formatDate(tuition.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <section className="rounded-3xl border border-border-subtle bg-surface p-6">
              <h2 className="text-lg font-bold text-heading">
                About This Tuition
              </h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-body">
                {tuition.description}
              </p>
            </section>
          </div>

          {/* ---------------- Sticky sidebar (right) ---------------- */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Fee card */}
              <div className="space-y-5 rounded-3xl border border-border-subtle bg-surface p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-body">
                    Monthly Fee
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-heading">
                    {formatCurrency(tuition.monthlyFee)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-4">
                  <div>
                    <p className="text-xs text-body">Days / Week</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-heading">
                      <Calendar className="h-4 w-4 text-brand" />
                      {tuition.daysPerWeek}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-body">Mode</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-heading">
                      <ModeIcon mode={tuition.mode} />
                      {tuition.mode}
                    </p>
                  </div>
                </div>

                {tuition.location && (
                  <div className="border-t border-border-subtle pt-4">
                    <p className="text-xs text-body">Location</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-heading">
                      <MapPin className="h-4 w-4 shrink-0 text-brand" />
                      {tuition.location}
                    </p>
                  </div>
                )}

                {/* রোল-ভিত্তিক আবেদন ফ্লো */}
                <ApplySection
                  tuitionId={tuition._id}
                  tuitionTitle={tuition.title}
                />
              </div>

              {/* Tutor profile summary */}
              <div className="space-y-4 rounded-3xl border border-border-subtle bg-surface p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-body">
                  About the Tutor
                </p>

                <div className="flex items-center gap-3">
                  {tutor.image ? (
                    <Image
                      src={tutor.image}
                      alt={tutor.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-2xl border border-border-subtle object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand-tint text-base font-bold text-heading">
                      {initials(tutor.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-bold text-heading">
                        {tutor.name}
                      </p>
                      {tutor.plan === "pro" && (
                        <Badge className="h-5 bg-brand px-2 text-heading">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-body">Tutor</p>
                  </div>
                </div>

                {tutor.bio && (
                  <p className="text-sm leading-relaxed text-body">
                    {tutor.bio}
                  </p>
                )}

                <div className="flex items-center gap-2 border-t border-border-subtle pt-4 text-sm text-body">
                  <Mail className="h-4 w-4 shrink-0 text-brand" />
                  <span className="truncate">{tutor.email}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
