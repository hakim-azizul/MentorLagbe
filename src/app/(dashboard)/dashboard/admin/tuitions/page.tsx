import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import TuitionApproval from "./_components/TuitionApproval";

export const metadata: Metadata = {
  title: "Tuition Approval",
};

export default async function TuitionApprovalPage() {
  await requireDashboardUser("admin");
  return <TuitionApproval />;
}
