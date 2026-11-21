import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import TutorOverview from "./_components/TutorOverview";

export const metadata: Metadata = {
  title: "Tutor Dashboard",
};

export default async function TutorDashboardPage() {
  const user = await requireDashboardUser("tutor");
  return <TutorOverview email={user.email} />;
}
