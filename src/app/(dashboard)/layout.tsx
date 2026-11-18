import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // সেশন না থাকলে /signin-এ রিডাইরেক্ট হবে
  const user = await requireDashboardUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
