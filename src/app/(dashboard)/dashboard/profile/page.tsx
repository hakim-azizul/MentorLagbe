import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import ProfileForm from "./_components/ProfileForm";

export const metadata: Metadata = {
  title: "My Profile | MentorLagbe",
};

/**
 * /dashboard/profile — (dashboard) লেআউট সেশন গার্ড চালায়; এখানে ভূমিকা নির্বিশেষে
 * প্রতিটি অথেনটিকেটেড ইউজার নিজের প্রোফাইল দেখতে ও আপডেট করতে পারে।
 * ফর্মটি ক্লায়েন্ট কম্পোনেন্ট — ফোন/বায়ো সেশনে না থাকায় `GET /api/profile`
 * থেকে লোড হয়।
 */
export default async function ProfilePage() {
  const user = await requireDashboardUser();
  return <ProfileForm initial={user} />;
}
