"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookMarked, Pencil, PlusCircle, Trash2, ImagePlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { TableSkeleton } from "@/components/dashboard/LoadingStates";
import StatusBadge, { approvalTone } from "@/components/dashboard/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { apiFetch, ApiError } from "@/lib/api";
import { uploadToImgBB } from "@/lib/uploadImage";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { tTuition, tmode } from "@/lib/types/tuition";

const MODES: tmode[] = ["Online", "Offline", "Hybrid"];
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
const fieldClass =
  "h-11 w-full rounded-2xl border border-border-subtle bg-surface px-4 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20";

export default function MyTuitions({ email }: { email: string }) {
  const { data, loading, error, refetch } = useApi<tTuition[]>(
    email ? `/api/tuitions/tutor?email=${encodeURIComponent(email)}` : null
  );

  const [editing, setEditing] = useState<tTuition | null>(null);
  const [deleting, setDeleting] = useState<tTuition | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const handleToggle = async (tuition: tTuition) => {
    setTogglingId(tuition._id);
    setBannerError(null);
    try {
      await apiFetch(`/api/tuitions/${tuition._id}`, {
        method: "PATCH",
        body: { isActive: !tuition.isActive },
      });
      refetch();
      toast.add({
        title: tuition.isActive ? "Tuition deactivated" : "Tuition activated",
        description: tuition.isActive
          ? "This tuition is now paused and hidden from students."
          : "This tuition is active again.",
        type: tuition.isActive ? "destructive" : "success",
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not update the status.";
      setBannerError(message);
      toast.add({
        title: "Status update failed",
        description: message,
        type: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    setActionError(null);
    try {
      await apiFetch(`/api/tuitions/${deleting._id}`, { method: "DELETE" });
      setDeleting(null);
      refetch();
      toast.add({
        title: "Tuition deleted",
        description: "The tuition and its applications were removed.",
        type: "destructive",
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not delete this tuition.";
      setActionError(message);
      toast.add({
        title: "Delete failed",
        description: message,
        type: "error",
      });
    } finally {
      setDeletingBusy(false);
    }
  };

  const tuitions = data ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Tuitions"
        description="Edit, pause or remove your tuition posts and track admin approval."
        actions={
          <Link
            href="/dashboard/tutor/post-tuition"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover"
          >
            <PlusCircle className="h-4 w-4" />
            Post a Tuition
          </Link>
        }
      />

      {bannerError && (
        <div className="mb-5">
          <ErrorAlert message={bannerError} onRetry={refetch} />
        </div>
      )}
      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {loading ? (
        <TableSkeleton rows={4} columns={6} />
      ) : tuitions.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No tuitions posted yet"
          description="Create your first tuition post and start receiving applications from students."
          action={
            <Link
              href="/dashboard/tutor/post-tuition"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-hover"
            >
              <PlusCircle className="h-4 w-4" />
              Post a Tuition
            </Link>
          }
        />
      ) : (
        <div className="rounded-3xl border border-border-subtle bg-background p-3 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-heading">Tuition</TableHead>
                <TableHead className="text-heading">Fee</TableHead>
                <TableHead className="text-heading">Approval</TableHead>
                <TableHead className="text-heading">Status</TableHead>
                <TableHead className="text-right text-heading">Actions</TableHead>
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
                          {tuition.subject} · {tuition.classLevel} · {tuition.mode}
                        </p>
                      </div>
                    </div>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tuition.isActive}
                        disabled={togglingId === tuition._id}
                        onCheckedChange={() => void handleToggle(tuition)}
                        aria-label={`Toggle status for ${tuition.title}`}
                      />
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          tuition.isActive
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-body"
                        )}
                      >
                        {tuition.isActive ? "Active" : "Closed"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActionError(null);
                          setEditing(tuition);
                        }}
                        className="border-border-subtle text-heading hover:border-brand/40 hover:bg-brand-tint"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setActionError(null);
                          setDeleting(tuition);
                        }}
                        className="font-semibold"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && (
        <EditTuitionDialog
          key={editing._id}
          tuition={editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          onSaved={() => {
            setEditing(null);
            refetch();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this tuition?"
        description={`"${deleting?.title ?? ""}" and its applications will be permanently removed.`}
        confirmLabel="Yes, delete"
        destructive
        loading={deletingBusy}
        error={actionError}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ------------------------------ Edit dialog ----------------------------- */

type EditState = {
  title: string;
  subject: string;
  classLevel: string;
  mode: tmode;
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
};

function EditTuitionDialog({
  tuition,
  onOpenChange,
  onSaved,
}: {
  tuition: tTuition;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  // key={tuition._id} দিয়ে রিমাউন্ট হওয়ায় lazy initializer-ই যথেষ্ট
  const [form, setForm] = useState<EditState>(() => ({
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location ?? "",
    monthlyFee: String(tuition.monthlyFee),
    daysPerWeek: String(tuition.daysPerWeek),
    description: tuition.description,
  }));
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof EditState>(key: K, value: EditState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError(null);
  };

  const failValidation = (message: string) => {
    setError(message);
    toast.add({
      title: "Check your details",
      description: message,
      type: "error",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const fee = Number(form.monthlyFee);
    const days = Number(form.daysPerWeek);
    if (form.title.trim().length < 5) {
      failValidation("Title must be at least 5 characters.");
      return;
    }
    if (!Number.isFinite(fee) || fee <= 0) {
      failValidation("Enter a valid monthly fee.");
      return;
    }
    if (!Number.isInteger(days) || days < 1 || days > 7) {
      failValidation("Days per week must be between 1 and 7.");
      return;
    }
    if (form.mode !== "Online" && !form.location.trim()) {
      failValidation("Location is required for offline/hybrid tuitions.");
      return;
    }
    if (form.description.trim().length < 15) {
      failValidation("Description must be at least 15 characters.");
      return;
    }

    setSaving(true);
    try {
      let bannerImage: string | undefined;
      if (bannerFile) {
        bannerImage = await uploadToImgBB(bannerFile);
      }

      await apiFetch(`/api/tuitions/${tuition._id}`, {
        method: "PATCH",
        body: {
          title: form.title.trim(),
          subject: form.subject.trim(),
          classLevel: form.classLevel,
          mode: form.mode,
          location: form.location.trim(),
          monthlyFee: fee,
          daysPerWeek: days,
          description: form.description.trim(),
          ...(bannerImage ? { bannerImage } : {}),
        },
      });
      onSaved();
      toast.add({
        title: "Tuition updated",
        description: "Your changes have been saved.",
        type: "success",
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not save the changes.";
      setError(message);
      toast.add({
        title: "Save failed",
        description: message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(tuition)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-heading">Edit Tuition</DialogTitle>
          <DialogDescription className="text-body">
            Changes are saved immediately after you update them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className="text-xs font-bold uppercase tracking-wider text-heading">
              Title *
            </Label>
            <Input
              id="edit-title"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-subject" className="text-xs font-bold uppercase tracking-wider text-heading">
                Subject *
              </Label>
              <Input
                id="edit-subject"
                value={form.subject}
                onChange={(event) => setField("subject", event.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-heading">
                Class Level *
              </Label>
              <Select
                value={form.classLevel || null}
                onValueChange={(value) => setField("classLevel", String(value ?? ""))}
              >
                <SelectTrigger className={cn(fieldClass, "justify-between")}>
                  <SelectValue placeholder="Select class level" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-heading">
                Mode *
              </Label>
              <Select
                value={form.mode}
                onValueChange={(value) => setField("mode", (value as tmode) || "Online")}
              >
                <SelectTrigger className={cn(fieldClass, "justify-between")}>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-location" className="text-xs font-bold uppercase tracking-wider text-heading">
                Location
              </Label>
              <Input
                id="edit-location"
                value={form.location}
                onChange={(event) => setField("location", event.target.value)}
                disabled={form.mode === "Online"}
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-fee" className="text-xs font-bold uppercase tracking-wider text-heading">
                Monthly Fee (৳) *
              </Label>
              <Input
                id="edit-fee"
                type="number"
                min={1}
                value={form.monthlyFee}
                onChange={(event) => setField("monthlyFee", event.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-days" className="text-xs font-bold uppercase tracking-wider text-heading">
                Days / Week *
              </Label>
              <Input
                id="edit-days"
                type="number"
                min={1}
                max={7}
                value={form.daysPerWeek}
                onChange={(event) => setField("daysPerWeek", event.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-xs font-bold uppercase tracking-wider text-heading">
              Description *
            </Label>
            <Textarea
              id="edit-description"
              rows={4}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-heading">
              Replace Banner (optional)
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
                {tuition.bannerImage ? (
                  <Image
                    src={tuition.bannerImage}
                    alt={tuition.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-body">
                    <ImagePlus className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="edit-banner"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-xs font-semibold text-heading transition-colors hover:border-brand/40 hover:bg-brand-tint"
                >
                  Choose image
                </label>
                <input
                  id="edit-banner"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)}
                />
                {bannerFile && (
                  <p className="mt-1.5 text-xs text-body">{bannerFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border-subtle text-heading hover:bg-surface"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-brand font-semibold text-heading hover:bg-brand-hover"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
