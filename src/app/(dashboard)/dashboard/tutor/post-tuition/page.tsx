import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import PostTuition from "./_components/PostTuition";

export const metadata: Metadata = {
  title: "Post a Tuition | MentorLagbe",
};

export default async function PostTuitionPage() {
  const user = await requireDashboardUser("tutor");
  return <PostTuition email={user.email} />;
}
