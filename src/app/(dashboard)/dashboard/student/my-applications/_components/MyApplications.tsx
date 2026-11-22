"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, X, ArrowRight } from "lucide-react";
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
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { TableSkeleton } from "@/components/dashboard/LoadingStates";
import StatusBadge, { applicationTone } from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { apiFetch, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { tApplication } from "@/lib/types/application";

export default function MyApplications({ email }: { email: string }) {
  const { data, loading, error, refetch } = useApi<tApplication[]>(
    email ? `/api/applications/student?email=${encodeURIComponent(email)}` : null
  );

  const [targetId, setTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // শুধু pending আবেদন বাতিল করা যায়
  const handleCancel = async () => {
    if (!targetId) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await apiFetch(`/api/applications/${targetId}`, { method: "DELETE" });
      setTargetId(null);
      refetch();
      toast.add({
        title: "Application canceled",
        description: "Your application has been withdrawn.",
        type: "destructive",
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not cancel this application.";
      setActionError(message);
      toast.add({
        title: "Cancellation failed",
        description: message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const applications = data ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Applications"
        description="Every tuition you have applied to, with its latest status."
        actions={
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover"
          >
            Browse Tuitions
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="You haven't applied to any tuitions yet. Browse the listings and send your first application."
          action={
            <Link
              href="/tuitions"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover"
            >
              Browse Tuitions
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="rounded-3xl border border-border-subtle bg-background p-3 sm:p-4">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-heading">Tuition Title</TableHead>
                <TableHead className="text-heading">Tutor</TableHead>
                <TableHead className="text-heading">Monthly Fee</TableHead>
                <TableHead className="text-heading">Applied Date</TableHead>
                <TableHead className="text-heading">Status</TableHead>
                <TableHead className="text-right text-heading">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow
                  key={application._id}
                  className="border-border-subtle hover:bg-surface"
                >
                  <TableCell className="max-w-56 font-semibold text-heading">
                    <span
                      className="block truncate"
                      title={application.tuitionTitle}
                    >
                      {application.tuitionTitle}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-52">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-heading">
                        {application.tutorName || "—"}
                      </p>
                      <p
                        className="truncate text-xs text-body"
                        title={application.tutorEmail}
                      >
                        {application.tutorEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold text-heading">
                    {formatCurrency(application.monthlyFee)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-body">
                    {formatDate(application.appliedAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge
                      tone={applicationTone(application.status)}
                      className="capitalize"
                    >
                      {application.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          application.status !== "pending" || submitting
                        }
                        onClick={() => {
                          setActionError(null);
                          setTargetId(application._id);
                        }}
                        className="shrink-0 whitespace-nowrap border-border-subtle text-heading hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/40 dark:hover:bg-red-950/50 dark:hover:text-red-400 disabled:hover:border-border-subtle disabled:hover:bg-transparent"
                        title={
                          application.status !== "pending"
                            ? "Only pending applications can be cancelled"
                            : "Cancel application"
                        }
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(targetId)}
        onOpenChange={(open) => {
          if (!open) {
            setTargetId(null);
            setActionError(null);
          }
        }}
        title="Cancel this application?"
        description="The tutor will no longer see your application. This cannot be undone."
        confirmLabel="Yes, cancel it"
        destructive
        loading={submitting}
        error={actionError}
        onConfirm={handleCancel}
      />
    </div>
  );
}
