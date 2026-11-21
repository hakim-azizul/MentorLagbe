import type { Metadata } from "next";
import CheckoutSuccess from "./_components/CheckoutSuccess";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Verify your Stripe payment and activate your MentorLagbe Pro plan.",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id } = await searchParams;
  const sessionId = Array.isArray(session_id) ? session_id[0] : session_id;

  return <CheckoutSuccess sessionId={sessionId ?? ""} />;
}
