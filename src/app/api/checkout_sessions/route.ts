import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/core/serverUser";

/** Pro প্ল্যানের দাম রোল অনুযায়ী — Price ID গুলো Stripe Dashboard থেকে। */
const priceIdByRole = (role: "student" | "tutor") =>
  role === "tutor"
    ? process.env.STRIPE_PRICE_TUTOR_PRO
    : process.env.STRIPE_PRICE_STUDENT_PRO;

/**
 * POST /api/checkout_sessions — `/payment` পেজের ফর্ম থেকে কল হয়।
 *
 * সেশন + রোল যাচাই করে রোলভিত্তিক Price ID দিয়ে Stripe Checkout Session
 * তৈরি করে এবং Stripe-এর হোস্টেড পেজে 303 রিডাইরেক্ট করে। ব্যর্থ হলে
 * `/payment?error=<code>`-এ ফেরত পাঠায় (কোনো JSON/ক্র্যাশ নয়)।
 */
export async function POST() {
  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const paymentError = (code: string) =>
    NextResponse.redirect(`${origin}/payment?error=${code}`, 303);

  const userSession = await getSession();
  const user = userSession?.user;

  if (!user) return paymentError("signin_required");
  if (user.plan === "pro") return paymentError("already_pro");
  if (user.role !== "student" && user.role !== "tutor")
    return paymentError("invalid_role");

  const role = user.role;
  const price = priceIdByRole(role);
  if (!price) {
    console.error(
      `[stripe] Missing price id env for role "${role}" (STRIPE_PRICE_${role.toUpperCase()}_PRO).`,
    );
    return paymentError("price_missing");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        role,
        plan: "pro",
      },
      payment_intent_data: {
        metadata: { userId: user.id, role, plan: "pro" },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment?canceled=1`,
      // Stripe Dashboard-এ এই ইন্টিগ্রেশনের লেবেল হিসেবে দেখাবে।
      integration_identifier: "mentor_lagbe_web_001",
    });

    if (!session.url) return paymentError("checkout_failed");

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("[stripe] Checkout session creation failed:", error);
    return paymentError("checkout_failed");
  }
}
