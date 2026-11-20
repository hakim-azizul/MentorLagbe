import { apiFetch } from "./client";
import type { tUserPlan, tUserRole } from "@/lib/types/user";

/**
 * পেমেন্ট সার্ভিস — mentor-server-এর `POST /payments/checkout-verify`।
 *
 * Stripe Checkout থেকে ফেরার পর সেশনটি সার্ভার-সাইডে যাচাই হয় এবং
 * ইউজারের `plan` `"pro"` হয়ে যায়। `apiFetch` ব্যবহার করায় Bearer JWT,
 * ৪০১-রিট্রাই ও `ApiError` হ্যান্ডলিং স্বয়ংক্রিয়ভাবে পাওয়া যায়।
 */
export type tCheckoutVerifyResult = {
  success: true;
  /** ওয়েবহুক ইতিমধ্যে পেমেন্টটি রেকর্ড করে থাকলে `true`। */
  duplicate: boolean;
  plan: Extract<tUserPlan, "pro">;
  role: Extract<tUserRole, "student" | "tutor">;
  message: string;
};

/**
 * Checkout Session যাচাই করে Pro প্ল্যান চালু করে।
 * 400 = সেশন অসম্পূর্ণ/অপরিশোধিত বা ভুল userId,
 * 404 = এমন session নেই, 500 = Stripe কনফিগার করা নেই।
 */
export async function checkoutVerify(
  sessionId: string,
  signal?: AbortSignal
): Promise<tCheckoutVerifyResult> {
  return apiFetch<tCheckoutVerifyResult>("/payments/checkout-verify", {
    method: "POST",
    body: { sessionId },
    signal,
  });
}
