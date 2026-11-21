import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import MyTuitions from "./_components/MyTuitions";

export const metadata: Metadata = {
  title: "My Tuitions",
};

export default async function MyTuitionsPage() {
  const user = await requireDashboardUser("tutor");
  return <MyTuitions email={user.email} />;
}
