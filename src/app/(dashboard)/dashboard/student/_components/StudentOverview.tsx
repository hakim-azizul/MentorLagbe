"use client";

import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
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
import type { StudentStats } from "@/lib/types/dashboard";

const primaryLink =
  "inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover";
const ghostLink =
  "inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-brand/40 hover:bg-brand-tint";

export default function StudentOverview({ email }: { email: string }) {
  const { data, loading, error, refetch } = useApi<StudentStats>(
    email ? `/api/dashboard/student/stats?email=${encodeURIComponent(email)}` : null
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Overview"
        description="Track every tuition application, its status and your current plan — all in one place."
        actions={
          <Link href="/dashboard/student/my-applications" className={primaryLink}>
            My Applications
            <ArrowRight className="h-4 w-4" />
          </Link>
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
              title="Total Applied Tuitions"
              value={data?.totalApplied ?? 0}
              icon={FileText}
              subtitle="Applications you have submitted so far"
            />
            <StatCard
              title="Accepted Applications"
              value={data?.acceptedCount ?? 0}
              icon={CheckCircle2}
              subtitle="Tutors who accepted your application"
              badge={
                <StatusBadge tone="success">
                  {data?.acceptedCount ? "Great progress" : "No acceptances yet"}
                </StatusBadge>
              }
            />
            <StatCard
              title="Pending Applications"
              value={data?.pendingCount ?? 0}
              icon={Clock}
              subtitle="Waiting for the tutor's response"
              badge={
                data?.pendingCount ? (
                  <StatusBadge tone="warning">Awaiting response</StatusBadge>
                ) : undefined
              }
            />
            <StatCard
              title="Current Plan"
              value={<span className="capitalize">{data?.plan ?? "free"}</span>}
              icon={Sparkles}
              subtitle={
                data?.plan === "pro"
                  ? "You are on the Pro plan"
                  : "Free plan — limited access"
              }
              badge={
                <StatusBadge tone={planTone(data?.plan ?? "free")}>
                  {data?.plan === "pro" ? "Pro member" : "Free plan"}
                </StatusBadge>
              }
            />
          </>
        )}
      </div>

      {/* দ্রুত অ্যাকশন */}
      {loading && <PanelSkeleton actions={2} />}
      {!loading && !error && (
        <div className="mt-6 rounded-3xl border border-border-subtle bg-background p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-heading">
                Find your next tuition
              </h2>
              <p className="mt-1 text-sm text-body">
                Review your applications or browse newly posted tuitions from
                verified tutors.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/student/my-applications"
                className={ghostLink}
              >
                View Applications
              </Link>
              <Link href="/tuitions" className={primaryLink}>
                Browse Tuitions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
