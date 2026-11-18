import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import Applicants from "./_components/Applicants";

export const metadata: Metadata = {
  title: "Manage Applicants | MentorLagbe",
};

export default async function ApplicantsPage() {
  const user = await requireDashboardUser("tutor");
  return <Applicants email={user.email} />;
}
