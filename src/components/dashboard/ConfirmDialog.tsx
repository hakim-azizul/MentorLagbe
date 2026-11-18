"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** বিপজ্জনক/ডিলিট অ্যাকশনে true */
  destructive?: boolean;
  loading?: boolean;
  /** ব্যাকএন্ড এরর ডায়লগের ভেতরেই দেখানোর জন্য */
  error?: string | null;
  onConfirm: () => void;
}

/** ডিলিট/ক্যানসেলের আগে কনফার্মেশন চাওয়ার জন্য রিইউজেবল ডায়লগ */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  error,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-body">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-border-subtle text-heading hover:bg-surface"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            className={
              destructive
                ? "font-semibold"
                : "bg-brand font-semibold text-heading hover:bg-brand-hover"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
