import { redirect } from "next/navigation";
import { getSession } from "./serverUser";
import { roleHome } from "@/config/dashboardRoutes";
import type { tUserRole, tUserPlan } from "@/lib/types/user";

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: tUserRole;
  plan: tUserPlan;
}

const VALID_ROLES: tUserRole[] = ["student", "tutor", "admin"];

/**
 * ড্যাশবোর্ড পেজের গার্ড: সেশন না থাকলে /signin-এ, ভুল রোল হলে
 * ওই রোলের নিজস্ব ড্যাশবোর্ডে রিডাইরেক্ট করে।
 */
export async function requireDashboardUser(
  requiredRole?: tUserRole
): Promise<DashboardUser> {
  const session = await getSession();

  if (!session) redirect("/signin");

  const { user } = session;
  const rawRole = user.role as tUserRole;
  const role = VALID_ROLES.includes(rawRole) ? rawRole : "student";
  const plan = (user.plan === "pro" ? "pro" : "free") as tUserPlan;

  if (requiredRole && role !== requiredRole) {
    redirect(roleHome[role]);
  }

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? null,
    role,
    plan,
  };
}
