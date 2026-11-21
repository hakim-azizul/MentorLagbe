import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import AdminOverview from "./_components/AdminOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  await requireDashboardUser("admin");
  return <AdminOverview />;
}
