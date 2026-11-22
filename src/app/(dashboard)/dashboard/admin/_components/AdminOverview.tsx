"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  Clock,
  Banknote,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PageHeader from "@/components/dashboard/PageHeader";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import {
  StatCardSkeleton,
  QuickLinksSkeleton,
} from "@/components/dashboard/LoadingStates";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { formatUsdCurrency } from "@/lib/format";
import type { AdminStats } from "@/lib/types/dashboard";

export default function AdminOverview() {
  const { data, loading, error, refetch } = useApi<AdminStats>(
    "/api/dashboard/admin/stats"
  );

  const pending = data?.pendingTuitions ?? 0;
  const approved = data?.approvedTuitions ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Overview"
        description="Platform-wide users, tuition moderation and Stripe revenue."
        actions={
          <Link
            href="/dashboard/admin/tuitions"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover"
          >
            <ShieldCheck className="h-4 w-4" />
            Review Tuitions
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
              title="Total Users"
              value={data?.totalUsers ?? 0}
              icon={Users}
              subtitle="All registered accounts"
            />
            <StatCard
              title="Total Tutors"
              value={data?.totalTutors ?? 0}
              icon={GraduationCap}
              subtitle="Users with the tutor role"
            />
            <StatCard
              title="Pending vs Approved"
              value={`${pending} / ${approved}`}
              icon={Clock}
              subtitle="Tuition posts awaiting moderation"
              badge={
                <StatusBadge tone={pending ? "warning" : "success"}>
                  {pending ? `${pending} awaiting review` : "Queue is clear"}
                </StatusBadge>
              }
            />
            <StatCard
              title="Total Revenue"
              value={formatUsdCurrency(data?.totalRevenue ?? 0)}
              icon={Banknote}
              subtitle="Sum of all Stripe payments"
              badge={
                <StatusBadge tone="brand">
                  {data?.totalRevenue ? "Paid subscriptions" : "No payments yet"}
                </StatusBadge>
              }
            />
          </>
        )}
      </div>

      {loading && <QuickLinksSkeleton cards={3} />}
      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickLink
            href="/dashboard/admin/users"
            title="Manage Users"
            description="Update account roles between student, tutor and admin."
          />
          <QuickLink
            href="/dashboard/admin/tuitions"
            title="Review Tuitions"
            description={`${pending} post${pending === 1 ? "" : "s"} waiting for a decision.`}
          />
          <QuickLink
            href="/dashboard/admin/transactions"
            title="Payments"
            description="View every payment recorded on the platform."
          />
        </div>
      )}
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-border-subtle bg-background p-5 transition-all hover:border-brand/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-heading group-hover:text-brand">
            {title}
          </h3>
          <p className="mt-1 text-xs text-body">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-body transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
    </Link>
  );
}
