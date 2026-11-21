"use client";

import { Receipt, CheckCircle2, Search } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import { TableSkeleton } from "@/components/dashboard/LoadingStates";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/lib/types/payment";

export default function Transactions() {
  const { data, loading, error, refetch } = useApi<Payment[]>(
    "/api/admin/transactions"
  );

  const [query, setQuery] = useState("");

  const payments = (data ?? []).filter((payment) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      payment.userName?.toLowerCase().includes(term) ||
      payment.userEmail?.toLowerCase().includes(term) ||
      payment.transactionId?.toLowerCase().includes(term)
    );
  });

  const total = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Payments"
        description="Every payment recorded on MentorLagbe."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body pointer-events-none" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or tx id..."
              className="h-11 rounded-2xl border-border-subtle bg-surface pl-10 pr-4 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
            />
          </div>
        }
      />

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {loading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={query ? "No matching transactions" : "No transactions yet"}
          description={
            query
              ? `Nothing found for "${query}".`
              : "Stripe payments will appear here as soon as users upgrade to Pro."
          }
        />
      ) : (
        <>
          <div className="rounded-3xl border border-border-subtle bg-background p-3 sm:p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="text-heading">User</TableHead>
                  <TableHead className="text-heading">Email</TableHead>
                  <TableHead className="text-heading">Role</TableHead>
                  <TableHead className="text-heading">Plan</TableHead>
                  <TableHead className="text-heading">Amount</TableHead>
                  <TableHead className="text-heading">Transaction ID</TableHead>
                  <TableHead className="text-heading">Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment._id}
                    className="border-border-subtle hover:bg-surface"
                  >
                    <TableCell className="font-semibold text-heading">
                      {payment.userName || "—"}
                    </TableCell>
                    <TableCell className="text-body">{payment.userEmail}</TableCell>
                    <TableCell>
                      <StatusBadge tone="info" className="capitalize">
                        {payment.userRole}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone="brand" className="capitalize">
                        {payment.planName}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="font-semibold text-heading">
                      {formatCurrency(payment.amount)}
                      {payment.currency && (
                        <span className="ml-1 text-xs font-normal uppercase text-body">
                          {payment.currency}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-48 truncate font-mono text-xs text-body">
                      {payment.transactionId || payment.stripeSessionId || "—"}
                    </TableCell>
                    <TableCell className="text-body">
                      {formatDate(payment.paidAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border-subtle bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-body">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              {payments.length} payment{payments.length === 1 ? "" : "s"} shown
            </p>
            <p className="text-sm text-body">
              Total{" "}
              <span className="font-extrabold text-heading">
                {formatCurrency(total)}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
