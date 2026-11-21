"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";
import {
  applyForTuition,
  checkStudentApplication,
} from "@/lib/api/applicationApi";
import type { tUserRole } from "@/lib/types/user";

const VALID_ROLES: tUserRole[] = ["student", "tutor", "admin"];

type ApplySectionProps = {
  tuitionId: string;
  tuitionTitle: string;
};

/**
 * রোল-ভিত্তিক আবেদন ফ্লো:
 *  • লগইন নেই        → "Sign in as Student to Apply" (/signin)
 *  • টিউশন/অ্যাডমিন → শুধু ছাত্রছাত্রী আবেদন করতে পারবে — notice
 *  • ছাত্রছাত্রী      → আগে আবেদন করেছে কিনা চেক করে, না করলে Dialog ফর্ম
 */
export default function ApplySection({
  tuitionId,
  tuitionTitle,
}: ApplySectionProps) {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [checkResult, setCheckResult] = useState<{
    key: string;
    hasApplied: boolean;
  } | null>(null);
  const [success, setSuccess] = useState(false);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [note, setNote] = useState("");

  const rawRole = (user?.role ?? "student") as tUserRole;
  const role: tUserRole = VALID_ROLES.includes(rawRole) ? rawRole : "student";

  // ছাত্র লগইন থাকলে আগে থেকেই আবেদন করা আছে কিনা জানা হয়।
  // চেক-কী না মিললে (ইউজার/টিউশন বদলেছে) পুরনো রেজাল্ট বাতিল হয়ে যায়।
  const checkKey = user?.email
    ? `${tuitionId}:${user.email.toLowerCase()}`
    : null;

  useEffect(() => {
    const email = user?.email;
    if (!email || role !== "student") return;

    let cancelled = false;
    const key = `${tuitionId}:${email.toLowerCase()}`;

    checkStudentApplication(tuitionId, email)
      .then((result) => {
        if (!cancelled) setCheckResult({ key, hasApplied: result.hasApplied });
      })
      .catch(() => {
        // নেটওয়ার্ক সমস্যায় false ধরে রাখা হয় — 409 এলে তখনও ধরা পড়বে
        if (!cancelled) setCheckResult({ key, hasApplied: false });
      });

    return () => {
      cancelled = true;
    };
  }, [tuitionId, role, user?.email]);

  // ডেরাইভড অবস্থা — ইফেক্টে সিঙ্ক setState করতে হয় না
  const freshResult = checkResult?.key === checkKey ? checkResult : null;
  const checking =
    Boolean(user?.email) && role === "student" && freshResult === null;
  const hasApplied = freshResult?.hasApplied ?? false;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setFormError(null);
  };

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!phone.trim()) missing.push("phone number");
    if (!preferredSchedule.trim()) missing.push("preferred schedule");
    if (!note.trim()) missing.push("learning note");
    if (missing.length) {
      const message = `Please fill in: ${missing.join(", ")}.`;
      setFormError(message);
      toast.add({
        title: "Missing details",
        description: message,
        type: "error",
      });
      return;
    }
    if (!user?.email || !checkKey) {
      toast.add({
        title: "Sign in required",
        description: "Please sign in as a student to apply for this tuition.",
        type: "warning",
      });
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await applyForTuition({
        tuitionId,
        studentEmail: user.email,
        studentName: user.name || "",
        phone: phone.trim(),
        preferredSchedule: preferredSchedule.trim(),
        note: note.trim(),
      });
      setCheckResult({ key: checkKey, hasApplied: true });
      setSuccess(true);
      setOpen(false);
      toast.add({
        title: "Application sent",
        description: "The tutor will review your application soon.",
        type: "success",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        // ডায়লগের বাইরেও অবস্থা সঠিক রাখতে 409-কে "আবেদন করা আছে" ধরে নেওয়া হয়
        if (error.status === 409) {
          setCheckResult({ key: checkKey, hasApplied: true });
          setSuccess(false);
          setOpen(false);
          toast.add({
            title: "Already applied",
            description: "You have already applied to this tuition.",
            type: "warning",
          });
        } else {
          setFormError(error.message);
          toast.add({
            title: "Application failed",
            description: error.message,
            type: "error",
          });
        }
      } else {
        const message = "Something went wrong. Please try again.";
        setFormError(message);
        toast.add({
          title: "Application failed",
          description: message,
          type: "error",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---- session loading --------------------------------------------------
  if (isPending) {
    return (
      <div className="h-11 w-full animate-pulse rounded-xl bg-border-subtle" />
    );
  }

  // ---- signed out -------------------------------------------------------
  if (!user) {
    return (
      <Link href="/signin" className="block">
        <Button className="w-full cursor-pointer gap-2 rounded-xl bg-brand py-5 font-semibold text-heading shadow-xs transition-all hover:bg-brand-hover">
          Sign in as Student to Apply
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    );
  }

  // ---- tutor / admin ----------------------------------------------------
  if (role === "tutor" || role === "admin") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-heading">
          Only students can apply for tuitions. You are currently signed in as a{" "}
          <span className="font-semibold">
            {role === "tutor" ? "Tutor" : "Admin"}
          </span>
          .
        </p>
      </div>
    );
  }

  // ---- student: checking ------------------------------------------------
  if (checking) {
    return (
      <div className="h-11 w-full animate-pulse rounded-xl bg-border-subtle" />
    );
  }

  // ---- student: already applied ----------------------------------------
  if (hasApplied) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-brand/40 bg-brand-tint p-4 text-center">
        <Badge className="h-6 bg-brand px-3 font-semibold text-heading">
          <CheckCircle2 className="h-3 w-3" />
          Already Applied
        </Badge>
        {success && (
          <p className="text-xs text-body">
            Your application has been sent to the tutor.
          </p>
        )}
      </div>
    );
  }
  // ---- student: already applied ----------------------------------------
  const initialPhone = user?.phone && user.phone.trim().length >= 8 ? user.phone.trim() : "";
  // ---- student: apply now ----------------------------------------------
  return (
    <>
      <Button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="w-full cursor-pointer rounded-xl bg-brand py-5 font-semibold text-heading shadow-xs transition-all hover:bg-brand-hover"
      >
        Apply Now
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-heading">
              Apply for {tuitionTitle}
            </DialogTitle>
            <DialogDescription className="text-body">
              Share your contact details and preferred schedule — the tutor will
              get back to you.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {formError}
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="apply-phone"
                className="text-xs font-bold uppercase tracking-wider text-heading"
              >
                Phone Number *
              </Label>
              <Input
                id="apply-phone"
                type="tel"
                value={phone || initialPhone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01XXXXXXXXX"
                className="border-border-subtle bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="apply-schedule"
                className="text-xs font-bold uppercase tracking-wider text-heading"
              >
                Preferred Schedule *
              </Label>
              <Input
                id="apply-schedule"
                value={preferredSchedule}
                onChange={(event) => setPreferredSchedule(event.target.value)}
                placeholder="e.g. Saturday & Monday, 6:00 PM"
                className="border-border-subtle bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="apply-note"
                className="text-xs font-bold uppercase tracking-wider text-heading"
              >
                Learning Note *
              </Label>
              <Textarea
                id="apply-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What do you want to focus on? (syllabus, exam prep, weak areas...)"
                rows={3}
                className="border-border-subtle bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="border-border-subtle text-heading hover:bg-surface"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 bg-brand font-semibold text-heading hover:bg-brand-hover"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
