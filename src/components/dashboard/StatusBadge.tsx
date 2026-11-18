import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { tStatus } from "@/lib/types/application";
import type { tapprovalStatus } from "@/lib/types/tuition";
import type { tUserPlan } from "@/lib/types/user";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info"
  | "brand";

const toneStyles: Record<BadgeTone, string> = {
  success: "border-brand/30 bg-brand-tint text-[#047857]",
  warning: "border-amber-500/30 bg-amber-50 text-amber-700",
  danger: "border-red-500/30 bg-red-50 text-red-600",
  neutral: "border-border-subtle bg-surface text-body",
  info: "border-sky-500/30 bg-sky-50 text-sky-700",
  brand: "border-brand/40 bg-brand text-heading font-bold",
};

interface StatusBadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

/** স্ট্যাটাস অনুযায়ী রঙিন ব্যাজ */
export default function StatusBadge({
  tone = "neutral",
  children,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 gap-1.5 rounded-full px-2.5 text-[11px]", toneStyles[tone], className)}
    >
      {children}
    </Badge>
  );
}

/** আবেদনের স্ট্যাটাস (pending / accepted / rejected) */
export function applicationTone(status: tStatus | string): BadgeTone {
  switch (status) {
    case "accepted":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "warning";
  }
}

/** অ্যাডমিনের টিউশন অ্যাপ্রুভাল স্ট্যাটাস */
export function approvalTone(status: tapprovalStatus | string): BadgeTone {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "warning";
  }
}

/** প্ল্যান (free / pro) */
export function planTone(plan: tUserPlan | string): BadgeTone {
  return plan === "pro" ? "brand" : "neutral";
}

/** টিউশন চালু আছে কিনা (Active / Closed) */
export function activeTone(isActive: boolean): BadgeTone {
  return isActive ? "success" : "neutral";
}
