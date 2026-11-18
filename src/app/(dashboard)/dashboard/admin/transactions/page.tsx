import type { Metadata } from "next";
import { requireDashboardUser } from "@/lib/core/dashboardAuth";
import Transactions from "./_components/Transactions";

export const metadata: Metadata = {
  title: "Transactions | MentorLagbe",
};

export default async function TransactionsPage() {
  await requireDashboardUser("admin");
  return <Transactions />;
}
