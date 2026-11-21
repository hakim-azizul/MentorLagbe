import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Checkout" };

/**
 * পুরনো `/checkout` সফলতা-রুটের ব্যাকওয়ার্ড-কম্প্যাটিবল রিডাইরেক্ট।
 *
 * আসল পেজ এখন `/checkout/success`-এ (ক্লায়েন্ট-সাইড ভেরিফিকেশন সহ)।
 * `session_id` না থাকলে প্ল্যান পেজে ফেরত পাঠায়।
 */
export default async function CheckoutRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id } = await searchParams;
  const sessionId = Array.isArray(session_id) ? session_id[0] : session_id;

  if (!sessionId) redirect("/payment");
  redirect(`/checkout/success?session_id=${encodeURIComponent(sessionId)}`);
}
