import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import UserManagement from "./_components/UserManagement";

export const metadata: Metadata = {
  title: "User Management | MentorLagbe",
};

export default async function UserManagementPage() {
  const user = await requireDashboardUser("admin");
  return <UserManagement adminEmail={user.email} />;
}
