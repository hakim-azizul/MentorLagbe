import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** ডেটা না থাকলে বা রেজাল্ট খালি হলে দেখানোর জন্য */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border-subtle bg-background px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand-tint text-brand">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-bold text-heading">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-body">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
