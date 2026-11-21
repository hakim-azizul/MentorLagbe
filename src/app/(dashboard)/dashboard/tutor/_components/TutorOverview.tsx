"use client";

import Link from "next/link";
import {
  BookMarked,
  BadgeCheck,
  Users,
  Sparkles,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PageHeader from "@/components/dashboard/PageHeader";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import {
  StatCardSkeleton,
  PanelSkeleton,
} from "@/components/dashboard/LoadingStates";
import StatusBadge, { planTone } from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import type { TutorStats } from "@/lib/types/dashboard";

const primaryLink =
  "inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover";
const ghostLink =
  "inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-brand/40 hover:bg-brand-tint";

export default function TutorOverview({ email }: { email: string }) {
  const { data, loading, error, refetch } = useApi<TutorStats>(
    email ? `/api/dashboard/tutor/stats?email=${encodeURIComponent(email)}` : null
  );

  const isFree = (data?.plan ?? "free") === "free";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Overview"
        description="Your tuition posts, approvals and applicant activity at a glance."
        actions={
          <>
            <Link href="/dashboard/tutor/my-tuitions" className={ghostLink}>
              My Tuitions
            </Link>
            <Link href="/dashboard/tutor/post-tuition" className={primaryLink}>
              <PlusCircle className="h-4 w-4" />
              Post a Tuition
            </Link>
          </>
        }
      />

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              title="Total Tuitions Posted"
              value={data?.totalPosted ?? 0}
              icon={BookMarked}
              subtitle={
                isFree
                  ? "Free plan limit: 2 tuition posts"
                  : "Unlimited posts with Pro"
              }
              badge={
                isFree ? (
                  <StatusBadge tone="neutral">
                    {data?.totalPosted ?? 0} / 2 used
                  </StatusBadge>
                ) : undefined
              }
            />
            <StatCard
              title="Approved Tuitions"
              value={data?.approvedCount ?? 0}
              icon={BadgeCheck}
              subtitle="Approved posts visible to students"
              badge={
                <StatusBadge tone={data?.approvedCount ? "success" : "warning"}>
                  {data?.approvedCount ? "Live on platform" : "Awaiting approval"}
                </StatusBadge>
              }
            />
            <StatCard
              title="Total Applicants"
              value={data?.totalApplicants ?? 0}
              icon={Users}
              subtitle="Students who applied to your tuitions"
              badge={
                data?.totalApplicants ? (
                  <StatusBadge tone="info">Review applicants</StatusBadge>
                ) : undefined
              }
            />
            <StatCard
              title="Current Plan"
              value={<span className="capitalize">{data?.plan ?? "free"}</span>}
              icon={Sparkles}
              subtitle={
                isFree
                  ? "Upgrade to Pro for unlimited posts"
                  : "You are on the Pro plan"
              }
              badge={
                <StatusBadge tone={planTone(data?.plan ?? "free")}>
                  {isFree ? "Free plan" : "Pro member"}
                </StatusBadge>
              }
            />
          </>
        )}
      </div>

      {loading && <PanelSkeleton actions={2} />}
      {!loading && !error && (
        <div className="mt-6 rounded-3xl border border-border-subtle bg-background p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-heading">
                {isFree
                  ? "You have 2 free tuition posts"
                  : "Keep your profile active"}
              </h2>
              <p className="mt-1 text-sm text-body">
                {isFree
                  ? "Post a tuition to start receiving applications, or upgrade to Pro for unlimited listings."
                  : "Post new tuitions and respond to applicants quickly to keep your listings ranking."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/tutor/applicants" className={ghostLink}>
                Manage Applicants
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/tutor/post-tuition" className={primaryLink}>
                <PlusCircle className="h-4 w-4" />
                Post a Tuition
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
