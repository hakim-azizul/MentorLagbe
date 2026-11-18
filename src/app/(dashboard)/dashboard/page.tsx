import { redirect } from "next/navigation";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import { roleHome } from "@/config/dashboardRoutes";

/** /dashboard — ব্যবহারকারীর রোল অনুযায়ী সঠিক ড্যাশবোর্ডে পাঠায় */
export default async function DashboardPage() {
  const user = await requireDashboardUser();
  redirect(roleHome[user.role]);
}
