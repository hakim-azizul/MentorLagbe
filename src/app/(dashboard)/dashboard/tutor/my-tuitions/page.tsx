import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import MyTuitions from "./_components/MyTuitions";

export const metadata: Metadata = {
  title: "My Tuitions | MentorLagbe",
};

export default async function MyTuitionsPage() {
  const user = await requireDashboardUser("tutor");
  return <MyTuitions email={user.email} />;
}
