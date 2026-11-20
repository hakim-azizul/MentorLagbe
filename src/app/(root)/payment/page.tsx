import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/core/serverUser";
import { roleHome } from "@/config/dashboardRoutes";
import type { tUserRole } from "@/lib/types/user";

export const metadata: Metadata = {
  title: "Upgrade to Pro — MentorLagbe",
  description: "Upgrade your MentorLagbe account to Pro and unlock unlimited access.",
};

/** রোল অনুযায়ী Pro প্ল্যানের দাম ও সুবিধা — হোমের PricingSection-এর সাথে সামঞ্জস্যপূর্ণ। */
const proPlans: Record<
  "student" | "tutor",
  { name: string; price: number; description: string; features: string[] }
> = {
  student: {
    name: "Pro Student",
    price: 10,
    description:
      "Stand out to top mentors with priority booking and unlimited applications.",
    features: [
      "Unlimited tuition & batch applications",
      "Priority booking badge on applications",
      "Direct 1-on-1 mentorship scheduling",
      "Early access to newly posted batches",
      "24/7 dedicated student support",
    ],
  },
  tutor: {
    name: "Pro Tutor",
    price: 15,
    description:
      "Scale your mentorship with unlimited posts, a Verified Badge, and top ranking.",
    features: [
      "Unlimited active tuition & batch posts",
      "Official Verified Mentor Badge on profile",
      "Featured placement at top of search results",
      "Detailed student enrollment analytics",
      "Zero platform commission on direct bookings",
    ],
  },
};

/** `/api/checkout_sessions` থেকে ফেরা error কোডগুলোর ইউজার-ফ্রেন্ডলি বার্তা। */
const errorMessages: Record<string, string> = {
  signin_required: "Please sign in before upgrading to Pro.",
  already_pro: "Your account is already on the Pro plan.",
  invalid_role: "Only students and tutors can upgrade to Pro.",
  price_missing:
    "Pro pricing is not configured yet. Please try again in a moment.",
  checkout_failed: "We could not start checkout. Please try again.",
};

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; canceled?: string }>;
}) {
  const [{ error, canceled }, session] = await Promise.all([
    searchParams,
    getSession(),
  ]);

  const user = session?.user;
  const errorMessage = error ? errorMessages[error] : null;
  const isPro = user?.plan === "pro";
  const isPayableRole = user?.role === "student" || user?.role === "tutor";
  const plan = isPayableRole ? proPlans[user.role as "student" | "tutor"] : null;

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-surface/60 py-16 sm:py-24">
      {/* নরম ব্র্যান্ড গ্লো */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-4 py-1.5 text-xs font-semibold tracking-wide text-heading uppercase">
            <Sparkles className="h-4 w-4 text-brand" />
            MentorLagbe Pro
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Upgrade your learning experience
          </h1>
          <p className="mt-4 text-base leading-7 text-body">
            One simple payment unlocks every Pro feature on your account. No
            hidden fees, cancel anytime.
          </p>
        </div>

        {/* error / cancel নোটিশ */}
        {errorMessage ? (
          <div
            role="alert"
            className="mx-auto mt-8 max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        ) : null}
        {canceled ? (
          <div
            role="status"
            className="mx-auto mt-8 max-w-xl rounded-2xl border border-border-subtle bg-background px-4 py-3 text-sm text-body"
          >
            Checkout was canceled. Your account has not been charged.
          </div>
        ) : null}

        <div className="mt-10">
          {/* সাইন-আউট অবস্থা */}
          {!user ? (
            <StateCard
              icon={<ShieldCheck className="h-7 w-7 text-brand" />}
              title="Sign in to upgrade"
              description="You need an account so we can activate Pro for you after payment."
            >
              <Link href="/signin">
                <Button className="bg-brand hover:bg-brand-hover text-heading font-semibold gap-2 cursor-pointer">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </StateCard>
          ) : isPro ? (
            <StateCard
              icon={<BadgeCheck className="h-7 w-7 text-brand" />}
              title="You are already on Pro"
              description="Every Pro feature is unlocked on your account. Thanks for supporting MentorLagbe!"
            >
              <Link href={roleHome[user.role as tUserRole]}>
                <Button className="bg-brand hover:bg-brand-hover text-heading font-semibold gap-2 cursor-pointer">
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </StateCard>
          ) : !plan ? (
            <StateCard
              icon={<ShieldCheck className="h-7 w-7 text-brand" />}
              title="Pro is not available for this account"
              description="Pro plans are available for student and tutor accounts only."
            >
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-border-subtle bg-background text-heading font-semibold gap-2 cursor-pointer"
                >
                  Back to home
                </Button>
              </Link>
            </StateCard>
          ) : (
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-[1.1fr_1fr]">
              {/* প্রাইসিং কার্ড */}
              <div className="relative flex flex-col rounded-3xl border-2 border-brand bg-background p-8 shadow-xl shadow-brand/10">
                <span className="absolute -top-3.5 right-6 inline-flex items-center rounded-full bg-brand px-3 py-1 text-[11px] font-bold tracking-wide text-heading uppercase">
                  {user.role === "tutor" ? "For tutors" : "For students"}
                </span>

                <h2 className="text-xl font-bold text-heading">{plan.name}</h2>
                <p className="mt-2 text-sm leading-6 text-body">{plan.description}</p>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl font-bold tracking-tight text-heading">
                    ${plan.price}
                  </span>
                  <span className="pb-1.5 text-sm text-body">/month</span>
                </div>
                <p className="mt-2 text-xs text-body">
                  Billed monthly in USD through Stripe Checkout.
                </p>

                <form action="/api/checkout_sessions" method="POST" className="mt-8">
                  <Button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand-hover text-heading font-bold py-6 rounded-2xl shadow-sm gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                    Continue to secure checkout
                  </Button>
                </form>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-body">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                  Payments are secured by Stripe. Cancel anytime.
                </p>
              </div>

              {/* ফিচার তালিকা */}
              <div className="rounded-3xl border border-border-subtle bg-background p-8">
                <h3 className="text-sm font-semibold tracking-wide text-heading uppercase">
                  Everything included
                </h3>
                <ul className="mt-5 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint">
                        <Check className="h-3.5 w-3.5 text-brand" />
                      </span>
                      <span className="text-sm leading-6 text-body">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StateCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-border-subtle bg-background p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-bold text-heading">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-body">{description}</p>
      <div className="mt-7 flex justify-center">{children}</div>
    </div>
  );
}
