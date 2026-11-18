"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ImagePlus,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import { uploadToImgBB } from "@/lib/uploadImage";
import { apiFetch, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { TutorStats } from "@/lib/types/dashboard";
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

interface FormState {
  title: string;
  subject: string;
  classLevel: string;
  mode: tmode;
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
}

const initialForm: FormState = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "Online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "3",
  description: "",
};

export default function PostTuition({ email }: { email: string }) {
  const statsPath = email
    ? `/api/dashboard/tutor/stats?email=${encodeURIComponent(email)}`
    : null;
  const { data: stats, refetch: refetchStats } = useApi<TutorStats>(statsPath);

  const [form, setForm] = useState<FormState>(initialForm);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  // লোকাল প্রিভিউ ক্লিনআপ
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const usedPosts = stats?.totalPosted ?? 0;
  const isFree = (stats?.plan ?? "free") === "free";
  const limitReached = isFree && usedPosts >= 2;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
    setSuccess(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSuccess(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setServerError("Please choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setServerError("Image must be smaller than 5 MB.");
      return;
    }

    setServerError(null);
    setBannerFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setBannerFile(null);
    setPreviewUrl(null);
  };

  const validate = () => {
    const errors: Partial<Record<keyof FormState, string>> = {};

    if (form.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters.";
    }
    if (!form.subject.trim()) errors.subject = "Subject is required.";
    if (!form.classLevel) errors.classLevel = "Please select a class level.";
    if (form.mode !== "Online" && !form.location.trim()) {
      errors.location = "Location is required for offline/hybrid tuitions.";
    }
    const fee = Number(form.monthlyFee);
    if (!form.monthlyFee.trim() || !Number.isFinite(fee) || fee <= 0) {
      errors.monthlyFee = "Enter a valid monthly fee.";
    }
    const days = Number(form.daysPerWeek);
    if (!Number.isInteger(days) || days < 1 || days > 7) {
      errors.daysPerWeek = "Days per week must be between 1 and 7.";
    }
    if (form.description.trim().length < 15) {
      errors.description = "Description must be at least 15 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    setSuccess(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      // ImgBB তে সরাসরি আপলোড, পাওয়া URL ব্যাকএন্ডে পাঠানো হবে
      let bannerImage = "";
      if (bannerFile) {
        bannerImage = await uploadToImgBB(bannerFile);
      }

      await apiFetch<tTuition>("/api/tuitions", {
        method: "POST",
        body: {
          title: form.title.trim(),
          subject: form.subject.trim(),
          classLevel: form.classLevel,
          mode: form.mode,
          location: form.location.trim(),
          monthlyFee: Number(form.monthlyFee),
          daysPerWeek: Number(form.daysPerWeek),
          description: form.description.trim(),
          bannerImage,
        },
      });

      setForm(initialForm);
      clearImage();
      setSuccess("Tuition posted successfully! It is now pending admin approval.");
      refetchStats();
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setLimitMessage(error.message);
        setLimitOpen(true);
      } else {
        setServerError(
          error instanceof ApiError
            ? error.message
            : "Could not post the tuition. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Post a Tuition"
        description="Fill in the details below. Admins will review your post before it goes live."
      />

      {/* Free plan limit info */}
      {limitReached && (
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-amber-500/30 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              You have used {usedPosts} of your 2 free tuition posts. Upgrade to
              Pro for unlimited posts.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-xl bg-heading px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-heading/90"
          >
            View Pricing
          </Link>
        </div>
      )}

      {serverError && (
        <div className="mb-6">
          <ErrorAlert message={serverError} />
        </div>
      )}

      {success && (
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-brand/30 bg-brand-tint p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p className="text-sm font-medium text-heading">{success}</p>
          </div>
          <Link
            href="/dashboard/tutor/my-tuitions"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-heading transition-colors hover:bg-brand-hover"
          >
            View My Tuitions
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-border-subtle bg-background p-5 sm:p-7"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Title */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-heading">
              Tuition Title *
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="e.g. HSC Physics & Higher Math Home Tuition"
              className={fieldClass}
              aria-invalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title && <FieldError message={fieldErrors.title} />}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-heading">
              Subject *
            </Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(event) => setField("subject", event.target.value)}
              placeholder="e.g. Physics"
              className={fieldClass}
              aria-invalid={Boolean(fieldErrors.subject)}
            />
            {fieldErrors.subject && <FieldError message={fieldErrors.subject} />}
          </div>

          {/* Class level */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-heading">
              Class Level *
            </Label>
            <Select
              value={form.classLevel || null}
              onValueChange={(value) =>
                setField("classLevel", String(value ?? ""))
              }
            >
              <SelectTrigger
                size="default"
                className={cn(fieldClass, "justify-between")}
              >
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
            {fieldErrors.classLevel && (
              <FieldError message={fieldErrors.classLevel} />
            )}
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-heading">
              Mode *
            </Label>
            <Select
              value={form.mode}
              onValueChange={(value) =>
                setField("mode", (value as tmode) || "Online")
              }
            >
              <SelectTrigger size="default" className={cn(fieldClass, "justify-between")}>
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

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-heading">
              Location {form.mode === "Online" ? "(optional)" : "*"}
            </Label>
            <Input
              id="location"
              value={form.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder={form.mode === "Online" ? "Not needed for online" : "e.g. Dhanmondi, Dhaka"}
              disabled={form.mode === "Online"}
              className={fieldClass}
              aria-invalid={Boolean(fieldErrors.location)}
            />
            {fieldErrors.location && <FieldError message={fieldErrors.location} />}
          </div>

          {/* Monthly fee */}
          <div className="space-y-1.5">
            <Label htmlFor="fee" className="text-xs font-bold uppercase tracking-wider text-heading">
              Monthly Fee (৳) *
            </Label>
            <Input
              id="fee"
              type="number"
              min={1}
              value={form.monthlyFee}
              onChange={(event) => setField("monthlyFee", event.target.value)}
              placeholder="e.g. 4000"
              className={fieldClass}
              aria-invalid={Boolean(fieldErrors.monthlyFee)}
            />
            {fieldErrors.monthlyFee && (
              <FieldError message={fieldErrors.monthlyFee} />
            )}
          </div>

          {/* Days per week */}
          <div className="space-y-1.5">
            <Label htmlFor="days" className="text-xs font-bold uppercase tracking-wider text-heading">
              Days / Week *
            </Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={7}
              value={form.daysPerWeek}
              onChange={(event) => setField("daysPerWeek", event.target.value)}
              placeholder="e.g. 3"
              className={fieldClass}
              aria-invalid={Boolean(fieldErrors.daysPerWeek)}
            />
            {fieldErrors.daysPerWeek && (
              <FieldError message={fieldErrors.daysPerWeek} />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-heading">
              Description *
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Describe the syllabus, schedule, requirements and anything students should know..."
              rows={5}
              className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
              aria-invalid={Boolean(fieldErrors.description)}
            />
            {fieldErrors.description && (
              <FieldError message={fieldErrors.description} />
            )}
          </div>

          {/* Banner image */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-heading">
              Banner Image (optional)
            </Label>
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border-subtle bg-surface p-4 sm:flex-row sm:items-center">
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-background sm:w-44">
                {previewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Tuition banner preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 text-heading shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-body">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-[11px]">No image selected</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start gap-2">
                <label
                  htmlFor="banner"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-brand/40 hover:bg-brand-tint"
                >
                  <UploadCloud className="h-4 w-4 text-brand" />
                  Choose image
                </label>
                <input
                  id="banner"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-body">
                  JPG or PNG, up to 5 MB. Uploaded to ImgBB automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/dashboard/tutor/my-tuitions"
            className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-background px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-brand px-6 py-2.5 text-sm font-bold text-heading hover:bg-brand-hover"
          >
            {submitting ? "Posting..." : "Post Tuition"}
          </Button>
        </div>
      </form>

      {/* Free plan limit / upgrade prompt */}
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-heading">
              <Sparkles className="h-4 w-5 text-brand" />
              Free plan limit reached
            </DialogTitle>
            <DialogDescription className="text-body">
              {limitMessage ||
                "Free plan tutors can only post up to 2 tuitions. Upgrade to Pro for unlimited posts."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border-subtle text-heading hover:bg-surface"
              onClick={() => setLimitOpen(false)}
            >
              Maybe later
            </Button>
            <Link href="/pricing">
              <Button
                type="button"
                className="bg-brand font-semibold text-heading hover:bg-brand-hover"
                onClick={() => setLimitOpen(false)}
              >
                Upgrade to Pro
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-600">{message}</p>;
}
