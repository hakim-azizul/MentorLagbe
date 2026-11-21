"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useSavedTuitions } from "@/components/shared/SavedTuitionsProvider";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  tuitionId: string;
  className?: string;
  /** Saved Tuitions পেজে আনসেভের পর লিস্ট রিফ্রেশ করতে। */
  onChanged?: (saved: boolean) => void;
}

/** টিউশন কার্ড ও ডিটেইলস পেজে ব্যবহৃত অ্যাক্সেসিবল সেভ/আনসেভ টগল। */
export default function BookmarkButton({
  tuitionId,
  className,
  onChanged,
}: BookmarkButtonProps) {
  const router = useRouter();
  const {
    savedIds,
    loading,
    canSave,
    role,
    limit,
    sessionPending,
    toggle,
  } = useSavedTuitions();
  const [pending, setPending] = useState(false);

  const saved = savedIds.has(tuitionId);
  const limitReached = !saved && limit !== null && savedIds.size >= limit;
  const label = saved ? "Remove from saved tuitions" : "Save tuition";
  const disabled = pending || loading || sessionPending;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // পাবলিক ব্রাউজিং ভাঙা যাবে না — শুধু পরিচ্ছন্ন বার্তা দেখাই
    if (!role) {
      toast.add({
        title: "Sign in to save tuitions",
        description: "Please sign in as a student to build your saved list.",
        type: "info",
      });
      router.push("/signin");
      return;
    }
    if (!canSave) {
      toast.add({
        title: "Only students can save tuitions",
        description: "Bookmarks are available on student accounts only.",
        type: "warning",
      });
      return;
    }
    if (limitReached) {
      toast.add({
        title: "Bookmark limit reached",
        description: `Free students can save up to ${limit ?? 5} tuitions. Upgrade to Pro for unlimited bookmarks.`,
        type: "warning",
      });
      return;
    }
    if (disabled) return;

    setPending(true);
    try {
      const nextSaved = await toggle(tuitionId);
      onChanged?.(nextSaved);
      toast.add({
        title: nextSaved ? "Tuition saved" : "Removed from saved",
        description: nextSaved
          ? "Find it anytime in Saved Tuitions."
          : "This tuition was removed from your saved list.",
        type: nextSaved ? "success" : "destructive",
      });
    } catch (error) {
      toast.add({
        title: "Could not update saved tuitions",
        description:
          error instanceof ApiError
            ? error.message
            : "Please try again in a moment.",
        type: "error",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={saved}
      title={label}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-background/90 text-heading shadow-xs backdrop-blur-md transition-colors hover:border-brand/50 hover:bg-brand-tint focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer disabled:cursor-wait disabled:opacity-60",
        saved && "border-brand/60 bg-brand-tint text-brand hover:border-brand",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Bookmark
          className={cn("h-4 w-4", saved && "fill-brand")}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
