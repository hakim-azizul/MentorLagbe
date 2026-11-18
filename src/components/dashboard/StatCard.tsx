import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  /** ছোট টেক্সট বা Badge — ঐচ্ছিক */
  badge?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

/** ড্যাশবোর্ডের সব স্ট্যাট কার্ড একই ডিজাইনে দেখানোর জন্য রিইউজেবল কম্পোনেন্ট */
export default function StatCard({
  title,
  value,
  icon: Icon,
  badge,
  subtitle,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border-subtle bg-background p-5 shadow-xs transition-all hover:border-brand/40 sm:p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-body">
            {title}
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-heading">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs text-body line-clamp-2">{subtitle}</p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-brand-tint text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {badge && <div className="mt-4 border-t border-border-subtle pt-3">{badge}</div>}
    </div>
  );
}
