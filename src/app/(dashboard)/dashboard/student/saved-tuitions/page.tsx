import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import SavedTuitions from "./_components/SavedTuitions";

export const metadata: Metadata = {
  title: "Saved Tuitions",
  description: "All the tuitions you bookmarked, in one place.",
};

/** `/dashboard/student/saved-tuitions` — student-only, guarded like other features. */
export default async function SavedTuitionsPage() {
  const user = await requireDashboardUser("student");
  return <SavedTuitions email={user.email} />;
}
