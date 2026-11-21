"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import PageHeader from "@/components/dashboard/PageHeader";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import { useSession } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/uploadImage";
import { ApiError, fetchCurrentUserProfile, updateUserProfile } from "@/lib/api";
import { roleHome } from "@/config/dashboardRoutes";
import type { DashboardUser } from "@/lib/core/dashboardAuth";
import type { tUserEdit } from "@/lib/types/user";

const fieldClass =
  "h-11 w-full rounded-2xl border border-border-subtle bg-surface px-4 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+\s()-]{6,20}$/;

interface ProfileFormProps {
  /** লেআউট গার্ডের ইউজার — ইনিশিয়াল প্রিফিল (ফোন/বায়ো পরে API থেকে আসে)। */
  initial: DashboardUser;
}

export default function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  // সেভ হলে সব ক্লায়েন্ট কম্পোনেন্টের useSession রিফ্রেশ হয় (সাইডবার সহ)
  const { refetch } = useSession();

  const [form, setForm] = useState<tUserEdit>({
    name: initial.name,
    email: initial.email,
    image: initial.image ?? "",
    phone: "",
    bio: "",
  });
  /** রোল/প্ল্যান শুধু ডিসপ্লের জন্য — ফর্ম বা PATCH payload-এর অংশ নয়। */
  const [meta, setMeta] = useState<{ role: string; plan: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loadTick, setLoadTick] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof tUserEdit, string>>
  >({});

  // প্রথম লোড: পূর্ণ প্রোফাইল (ফোন/বায়ো সেশনে থাকে না)।
  // সিঙ্ক setState এড়াতে ফলাফল শুধু প্রমিস কলব্যাকে সেট হয়।
  useEffect(() => {
    let cancelled = false;

    fetchCurrentUserProfile()
      .then((profile) => {
        if (cancelled) return;
        setForm({
          name: profile.name,
          email: profile.email,
          image: profile.image,
          phone: profile.phone,
          bio: profile.bio,
        });
        setMeta({ role: profile.role, plan: profile.plan });
        setImgError(false);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSessionExpired(error instanceof ApiError && error.status === 401);
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "Could not load your profile. Please try again."
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadTick]);

  const retryLoad = () => {
    setLoadError(null);
    setSessionExpired(false);
    setLoading(true);
    setLoadTick((tick) => tick + 1);
    toast.add({
      title: "Retrying",
      description: "Loading your profile again.",
      type: "info",
    });
  };

  const setField = <K extends keyof tUserEdit>(key: K, value: tUserEdit[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
    setSuccess(null);
    setPhotoUploaded(false);
    if (key === "image") setImgError(false);
  };

  /** ফাইল নির্বাচন → ImgBB আপলোড → পাওয়া URL ফর্মের `image` ফিল্ডে। */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = ""; // একই ফাইল আবার বাছাই করা যায়
    if (!file) return;

    setServerError(null);
    setSuccess(null);
    setPhotoUploaded(false);

    if (!file.type.startsWith("image/")) {
      setServerError("Please choose a valid image file.");
      toast.add({
        title: "Invalid file",
        description: "Please choose a valid image file.",
        type: "error",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setServerError("Image must be smaller than 5 MB.");
      toast.add({
        title: "Image too large",
        description: "Profile photos must be smaller than 5 MB.",
        type: "error",
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setForm((previous) => ({ ...previous, image: url }));
      setImgError(false);
      setPhotoUploaded(true);
      toast.add({
        title: "Photo uploaded",
        description: "Save your profile to keep the new photo.",
        type: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try again.";
      setServerError(message);
      toast.add({
        title: "Upload failed",
        description: message,
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setField("image", "");
    setPhotoUploaded(false);
    // আগের ফাইল সিলেকশনও মুছে যাক — একই ফাইল আবার বাছাই করা যায়
    if (photoInputRef.current) photoInputRef.current.value = "";
    toast.add({
      title: "Photo removed",
      description: "Save your profile to apply this change.",
      type: "info",
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    const initials = parts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials || "U";
  };

  const validate = () => {
    const errors: Partial<Record<keyof tUserEdit, string>> = {};

    if (!form.name.trim()) errors.name = "Name is required.";

    const email = form.email.trim();
    if (!email) errors.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

    const phone = form.phone.trim();
    if (phone && !PHONE_RE.test(phone)) {
      errors.phone = "Enter a valid phone number (6–20 digits).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    setSuccess(null);

    if (!validate()) {
      toast.add({
        title: "Check your details",
        description: "Fix the highlighted fields before saving.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateUserProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        image: form.image.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
      });

      // সার্ভার ফেরত ডকুমেন্টই সত্য — ফর্মও ওই ডেটায় সিঙ্ক করা হয়
      setForm({
        name: updated.name,
        email: updated.email,
        image: updated.image,
        phone: updated.phone,
        bio: updated.bio,
      });
      setMeta({ role: updated.role, plan: updated.plan });
      setPhotoUploaded(false);
      setSuccess("Profile updated successfully.");
      toast.add({
        title: "Profile saved",
        description: "Your changes are now live across the dashboard.",
        type: "success",
      });

      // সাইডবার/ন্যাভবার/শেল — নতুন নাম ও ছবি সব জায়গায় ছড়িয়ে পড়বে
      void refetch();
      router.refresh();
    } catch (error) {
      setSessionExpired(error instanceof ApiError && error.status === 401);
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not update your profile. Please try again.";
      setServerError(message);
      toast.add({
        title: "Save failed",
        description: message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My Profile"
        description="Update your personal details and profile photo. Changes appear across the dashboard immediately."
      />

      {sessionExpired && (
        <div className="mb-6">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-heading transition-colors hover:bg-brand-hover"
          >
            Your session expired — sign in again
          </Link>
        </div>
      )}

      {serverError && (
        <div className="mb-6">
          <ErrorAlert message={serverError} />
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-2.5 rounded-3xl border border-brand/30 bg-brand-tint p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-sm font-medium text-heading">{success}</p>
        </div>
      )}

      {loading ? (
        <div
          className="space-y-5 rounded-3xl border border-border-subtle bg-background p-5 sm:p-7"
          aria-busy="true"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : loadError ? (
        <ErrorAlert message={loadError} onRetry={retryLoad} />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-border-subtle bg-background p-5 sm:p-7"
        >
          {/* Photo + role/plan */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-heading">
              Profile Photo
            </Label>
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border-subtle bg-surface p-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-background">
                {form.image && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image}
                    alt="Profile photo preview"
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-tint text-lg font-extrabold text-heading">
                    {getInitials(form.name)}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                    <Loader2 className="h-7 w-7 animate-spin text-brand" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col items-start gap-2">
                {meta && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-tint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-heading">
                      {meta.role}
                    </span>
                    <span className="rounded-full border border-border-subtle bg-background px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-body">
                      {meta.plan} plan
                    </span>
                  </div>
                )}
                <label
                  htmlFor="photo-input"
                  aria-disabled={uploading}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm font-semibold text-heading transition-colors ${
                    uploading
                      ? "opacity-60"
                      : "hover:border-brand/40 hover:bg-brand-tint"
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  ) : (
                    <Camera className="h-4 w-4 text-brand" />
                  )}
                  {uploading ? "Uploading to ImgBB…" : "Upload new photo"}
                </label>
                <input
                  id="photo-input"
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileChange}
                />
                <p className="text-xs text-body">
                  JPG or PNG up to 5 MB — uploads to ImgBB instantly, then press
                  Save Changes. You can also paste any image URL below.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || !form.image}
                onClick={removePhoto}
                className="shrink-0 border-border-subtle text-body hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
            {photoUploaded && (
              <p className="text-xs font-semibold text-brand">
                Photo uploaded — press “Save Changes” to apply it to your
                account.
              </p>
            )}
          </div>

          {/* Photo URL (manual) */}
          <div className="mt-5 space-y-1.5">
            <Label
              htmlFor="image"
              className="text-xs font-bold uppercase tracking-wider text-heading"
            >
              Photo URL
            </Label>
            <Input
              id="image"
              type="url"
              value={form.image}
              onChange={(event) => setField("image", event.target.value)}
              placeholder="https://i.ibb.co/…"
              className={fieldClass}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-wider text-heading"
              >
                Full Name *
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="e.g. Rahim Uddin"
                className={fieldClass}
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <FieldError message={fieldErrors.name} />}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-heading"
              >
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="you@example.com"
                className={fieldClass}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <FieldError message={fieldErrors.email} />}
              <p className="text-xs text-body">
                Use a new email with care — it becomes your sign-in address.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-wider text-heading"
              >
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                placeholder="e.g. 017XXXXXXXX"
                className={fieldClass}
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
            </div>

            {/* Bio */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="bio"
                className="text-xs font-bold uppercase tracking-wider text-heading"
              >
                Bio
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(event) => setField("bio", event.target.value)}
                placeholder="A short introduction — subjects you teach, experience, availability…"
                rows={4}
                className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={roleHome[initial.role]}
              className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-background px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={submitting || uploading}
              className="bg-brand px-6 py-2.5 text-sm font-bold text-heading hover:bg-brand-hover"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-600">{message}</p>;
}
