"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Check, X, ArrowRight, Mail, Phone } from "lucide-react";
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
import StatusBadge, { applicationTone } from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { tApplication } from "@/lib/types/application";

export default function Applicants({ email }: { email: string }) {
  const { data, loading, error, refetch } = useApi<tApplication[]>(
    email ? `/api/applications/tutor?email=${encodeURIComponent(email)}` : null
  );

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const updateStatus = async (id: string, status: "accepted" | "rejected") => {
    setBusyId(id);
    setActionError(null);
    try {
      await apiFetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      refetch();
      toast.add({
        title: "Application updated",
        description: `The application was ${status}.`,
        type: "success",
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not update the application.";
      setActionError(message);
      toast.add({
        title: "Update failed",
        description: message,
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const applications = data ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Applicants"
        description="Students who applied to your tuitions — accept or reject them in one click."
        actions={
          <Link
            href="/dashboard/tutor/my-tuitions"
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-brand/40 hover:bg-brand-tint"
          >
            My Tuitions
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
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="Applications will show up here as soon as students apply to your tuition posts."
          action={
            <Link
              href="/dashboard/tutor/my-tuitions"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover"
            >
              Manage My Tuitions
            </Link>
          }
        />
      ) : (
        <div className="rounded-3xl border border-border-subtle bg-background p-3 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-heading">Student</TableHead>
                <TableHead className="text-heading">Tuition</TableHead>
                <TableHead className="text-heading">Schedule</TableHead>
                <TableHead className="text-heading">Note</TableHead>
                <TableHead className="text-heading">Status</TableHead>
                <TableHead className="text-right text-heading">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const decided = application.status !== "pending";
                const busy = busyId === application._id;
                return (
                  <TableRow
                    key={application._id}
                    className="border-border-subtle hover:bg-surface"
                  >
                    <TableCell>
                      <p className="font-semibold text-heading">
                        {application.studentName}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-body">
                        <Mail className="h-3 w-3" />
                        {application.studentEmail}
                      </p>
                      {application.studentPhone && (
                        <p className="flex items-center gap-1 text-xs text-body">
                          <Phone className="h-3 w-3" />
                          {application.studentPhone}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-52 truncate text-sm font-medium text-heading">
                        {application.tuitionTitle}
                      </p>
                      <p className="text-xs text-body">
                        Applied {formatDate(application.appliedAt)}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-body">
                      {application.preferredSchedule || "—"}
                    </TableCell>
                    <TableCell className="max-w-52 text-sm text-body">
                      <span className="line-clamp-2">
                        {application.studentNote || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={applicationTone(application.status)}
                        className="capitalize"
                      >
                        {application.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={decided || busy}
                          onClick={() =>
                            void updateStatus(application._id, "accepted")
                          }
                          className="bg-brand font-semibold text-heading hover:bg-brand-hover disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Accept
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={decided || busy}
                          onClick={() =>
                            void updateStatus(application._id, "rejected")
                          }
                          className="font-semibold"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
