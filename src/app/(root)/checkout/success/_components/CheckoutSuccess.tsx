"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkoutVerify } from "@/lib/api/paymentApi";
import { ApiError } from "@/lib/api/client";
import { roleHome } from "@/config/dashboardRoutes";

/** সফল ভেরিফিকেশনের পর ড্যাশবোর্ডে রিডাইরেক্টের আগে অপেক্ষার সময়। */
const REDIRECT_DELAY_MS = 2500;

type VerifyState =
  | { status: "verifying" }
  | { status: "success"; message: string; role: "student" | "tutor" }
  | { status: "error"; message: string };

/**
 * Stripe Checkout থেকে ফেরার পর সেশনটি ব্যাকএন্ডে যাচাই করে।
 * `sessionId` না থাকলে সরাসরি error স্টেট; নাহলে loading → success/error।
 * সফল হলে সার্ভার কম্পোনেন্ট রিফ্রেশ করে এবং কিছুক্ষণ পর ড্যাশবোর্ডে যায়।
 */
export default function CheckoutSuccess({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<VerifyState>(() =>
    sessionId
      ? { status: "verifying" }
      : { status: "error", message: "Missing checkout session id." }
  );

  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    checkoutVerify(sessionId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;

        setState({
          status: "success",
          message: result.message,
          role: result.role,
        });

        // Navbar/plan ব্যাজ যেন সাথে সাথে আপডেট হয়
        router.refresh();
        redirectTimer = setTimeout(() => {
          router.replace(roleHome[result.role]);
        }, REDIRECT_DELAY_MS);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We could not verify your payment. Please try again.",
        });
      });

    return () => {
      controller.abort();
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [sessionId, attempt, router]);

  const retry = useCallback(() => {
    setState({ status: "verifying" });
    setAttempt((count) => count + 1);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-surface/60 py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border-subtle bg-background p-10 text-center shadow-xl shadow-brand/5">
          {state.status === "verifying" ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-heading">
                Verifying your payment
              </h1>
              <p className="mt-3 text-sm leading-6 text-body">
                Please wait a moment — we are confirming your Stripe checkout and
                activating Pro.
              </p>
            </>
          ) : state.status === "success" ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand">
                <Check strokeWidth={3} className="h-8 w-8 text-heading" />
              </div>
              <p className="mt-6 inline-flex items-center rounded-full border border-brand/30 bg-brand-tint px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-heading uppercase">
                Upgrade successful
              </p>
              <h1 className="mt-4 text-2xl font-bold text-heading">
                Welcome to MentorLagbe Pro
              </h1>
              <p className="mt-3 text-sm leading-6 text-body">{state.message}</p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-body">
                <ShieldCheck className="h-4 w-4 text-brand" />
                Session verified — your transaction is recorded.
              </div>

              <Link href={roleHome[state.role]} className="mt-8 block">
                <Button className="w-full bg-brand hover:bg-brand-hover text-heading font-bold py-6 rounded-2xl gap-2 cursor-pointer">
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-body">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Redirecting you automatically…
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-heading">
                We could not verify this payment
              </h1>
              <p role="alert" className="mt-3 text-sm leading-6 text-body">
                {state.message}
              </p>

              <div className="mt-8 space-y-3">
                {sessionId ? (
                  <Button
                    onClick={retry}
                    className="w-full bg-brand hover:bg-brand-hover text-heading font-bold py-6 rounded-2xl cursor-pointer"
                  >
                    Try again
                  </Button>
                ) : null}
                <Link href="/payment" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-border-subtle bg-background text-heading font-semibold py-6 rounded-2xl cursor-pointer"
                  >
                    Back to Pro plan
                  </Button>
                </Link>
              </div>

              <p className="mt-5 text-xs leading-5 text-body">
                If you were charged but still see this, refresh this page in a
                minute — our Stripe webhook will activate Pro automatically.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
