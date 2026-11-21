import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import MyApplications from "./_components/MyApplications";

export const metadata: Metadata = {
  title: "My Applications",
};

export default async function MyApplicationsPage() {
  const user = await requireDashboardUser("student");
  return <MyApplications email={user.email} />;
}
