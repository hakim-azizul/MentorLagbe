import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import StudentOverview from "./_components/StudentOverview";

export const metadata: Metadata = {
  title: "Student Dashboard | MentorLagbe",
};

export default async function StudentDashboardPage() {
  const user = await requireDashboardUser("student");
  return <StudentOverview email={user.email} />;
}
