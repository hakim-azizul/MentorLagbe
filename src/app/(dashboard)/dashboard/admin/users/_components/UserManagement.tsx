"use client";

import { useMemo, useState } from "react";
import { Users, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import { TableSkeleton } from "@/components/dashboard/LoadingStates";
import StatusBadge, { planTone } from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { tUser, tUserRole } from "@/lib/types/user";

const ROLES: tUserRole[] = ["student", "tutor", "admin"];

export default function UserManagement({ adminEmail }: { adminEmail: string }) {
  const { data, loading, error, refetch } = useApi<tUser[]>("/api/admin/users");

  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const users = useMemo(() => {
    const list = data ?? [];
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
  }, [data, query]);

  const handleRoleChange = async (id: string, role: tUserRole) => {
    setBusyId(id);
    setActionError(null);
    try {
      await apiFetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: { role },
      });
      refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Could not update the role."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="User Management"
        description="Search every registered account and update its role."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body pointer-events-none" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email..."
              className="h-11 rounded-2xl border-border-subtle bg-surface pl-10 pr-4 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
            />
          </div>
        }
      />

      {actionError && (
        <div className="mb-5">
          <ErrorAlert message={actionError} />
        </div>
      )}
      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {loading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No users match your search" : "No users yet"}
          description={
            query
              ? `Nothing found for "${query}". Try a different name or email.`
              : "Registered accounts will appear here."
          }
        />
      ) : (
        <div className="rounded-3xl border border-border-subtle bg-background p-3 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-heading">Name</TableHead>
                <TableHead className="text-heading">Email</TableHead>
                <TableHead className="text-heading">Current Role</TableHead>
                <TableHead className="text-heading">Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.email === adminEmail;
                return (
                  <TableRow
                    key={user._id}
                    className="border-border-subtle hover:bg-surface"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand-tint text-xs font-bold text-heading">
                          {(user.name || "U")
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                        <span className="font-semibold text-heading">
                          {user.name || "—"}
                        </span>
                        {isSelf && (
                          <StatusBadge tone="info">You</StatusBadge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-body">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role || "student"}
                        disabled={isSelf || busyId === user._id}
                        onValueChange={(value) =>
                          void handleRoleChange(user._id, value as tUserRole)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className={cn(
                            "w-36 border-border-subtle bg-surface text-heading",
                            isSelf && "opacity-60"
                          )}
                          title={
                            isSelf
                              ? "You cannot change your own role"
                              : "Change role"
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              <span className="capitalize">{role}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={planTone(user.plan)} className="capitalize">
                        {user.plan || "free"}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="mt-4 text-xs text-body">
        Role changes take effect immediately — the user&apos;s dashboard sidebar
        updates on their next page load.
      </p>
    </div>
  );
}
