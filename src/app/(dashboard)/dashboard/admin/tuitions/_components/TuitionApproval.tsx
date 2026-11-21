"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Check, X, ImagePlus, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import { TableSkeleton } from "@/components/dashboard/LoadingStates";
import StatusBadge, { approvalTone } from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { apiFetch, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { tTuition } from "@/lib/types/tuition";

export default function TuitionApproval() {
  const { data, loading, error, refetch } = useApi<tTuition[]>(
    "/api/admin/tuitions"
  );

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const setApproval = async (
    id: string,
    approvalStatus: "approved" | "rejected"
  ) => {
    setBusyId(id);
    setActionError(null);
    try {
      await apiFetch(`/api/admin/tuitions/${id}/approval`, {
        method: "PATCH",
        body: { approvalStatus },
      });
      refetch();
      toast.add({
        title: "Tuition reviewed",
        description: `This tuition was ${approvalStatus}.`,
        type: "success",
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not update the approval status.";
      setActionError(message);
      toast.add({
        title: "Review failed",
        description: message,
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const tuitions = data ?? [];
  const pendingCount = tuitions.filter(
    (tuition) => tuition.approvalStatus === "pending"
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Tuition Approval"
        description="Moderate every tuition post submitted on the platform."
        actions={
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-brand/40 hover:bg-brand-tint"
          >
            Back to Overview
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {actionError && (
        <div className="mb-5">
          <ErrorAlert message={actionError} />
        </div>
      )}
      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : tuitions.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No tuition posts yet"
          description="When tutors submit tuitions, they will appear here for moderation."
        />
      ) : (
        <>
          {pendingCount > 0 && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-950/40">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                {pendingCount} tuition post{pendingCount === 1 ? "" : "s"} waiting
                for your decision.
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-border-subtle bg-background p-3 sm:p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="text-heading">Tuition</TableHead>
                  <TableHead className="text-heading">Tutor</TableHead>
                  <TableHead className="text-heading">Fee</TableHead>
                  <TableHead className="text-heading">Status</TableHead>
                  <TableHead className="text-right text-heading">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tuitions.map((tuition) => (
                  <TableRow
                    key={tuition._id}
                    className="border-border-subtle hover:bg-surface"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
                          {tuition.bannerImage ? (
                            <Image
                              src={tuition.bannerImage}
                              alt={tuition.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-body">
                              <ImagePlus className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-64 truncate text-sm font-semibold text-heading">
                            {tuition.title}
                          </p>
                          <p className="text-xs text-body">
                            {tuition.subject} · {tuition.classLevel} ·{" "}
                            {tuition.mode}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-heading">
                        {tuition.tutorName || "—"}
                      </p>
                      <p className="text-xs text-body">{tuition.tutorEmail}</p>
                    </TableCell>
                    <TableCell className="font-semibold text-heading">
                      {formatCurrency(tuition.monthlyFee)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={approvalTone(tuition.approvalStatus)}
                        className="capitalize"
                      >
                        {tuition.approvalStatus}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            tuition.approvalStatus === "approved" ||
                            busyId === tuition._id
                          }
                          onClick={() =>
                            void setApproval(tuition._id, "approved")
                          }
                          className="bg-brand font-semibold text-heading hover:bg-brand-hover disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={
                            tuition.approvalStatus === "rejected" ||
                            busyId === tuition._id
                          }
                          onClick={() =>
                            void setApproval(tuition._id, "rejected")
                          }
                          className="font-semibold"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
