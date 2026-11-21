import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BookMarked,
  Users,
  ShieldCheck,
  CreditCard,
  Bookmark,
} from "lucide-react";
import type { tUserRole } from "@/lib/types/user";

/** সাইডবারের রুট — প্রতিটি রোলের ড্যাশবোর্ড লিংক এখানেই ডিফাইন করা */
export interface DashboardRoute {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** রোল অনুযায়ী ড্যাশবোর্ডের হোম পেজ */
export const roleHome: Record<tUserRole, string> = {
  student: "/dashboard/student",
  tutor: "/dashboard/tutor",
  admin: "/dashboard/admin",
};

export const dashboardRoutes: Record<tUserRole, DashboardRoute[]> = {
  student: [
    { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    {
      label: "My Applications",
      href: "/dashboard/student/my-applications",
      icon: FileText,
    },
    {
      label: "Saved Tuitions",
      href: "/dashboard/student/saved-tuitions",
      icon: Bookmark,
    },
  ],
  tutor: [
    { label: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
    {
      label: "Post a Tuition",
      href: "/dashboard/tutor/post-tuition",
      icon: PlusCircle,
    },
    {
      label: "My Tuitions",
      href: "/dashboard/tutor/my-tuitions",
      icon: BookMarked,
    },
    { label: "Applicants", href: "/dashboard/tutor/applicants", icon: Users },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/dashboard/admin/users", icon: Users },
    {
      label: "Tuition Approval",
      href: "/dashboard/admin/tuitions",
      icon: ShieldCheck,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
    },
  ],
};

/** ড্যাশবোর্ড সাইডবারের ব্র্যান্ড টাইটেল */
export const dashboardTitles: Record<tUserRole, string> = {
  student: "Student Dashboard",
  tutor: "Tutor Workspace",
  admin: "Admin Panel",
};
