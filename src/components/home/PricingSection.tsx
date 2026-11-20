"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  GraduationCap,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type AudienceTab = "student" | "tutor";

interface PlanItem {
  id: string;
  name: string;
  badge?: string;
  price: number;
  period: string;
  description: string;
  isPro: boolean;
  features: string[];
  ctaText: string;
}

const plansData: Record<AudienceTab, PlanItem[]> = {
  student: [
    {
      id: "student-free",
      name: "Student Starter",
      price: 0,
      period: "/month",
      description: "Everything you need to browse verified tutors and apply for tuition batches.",
      isPro: false,
      features: [
        "Browse all verified tutors & batches",
        "Apply to up to 3 tuition posts per month",
        "Standard application review queue",
        "Basic student dashboard & tracking",
      ],
      ctaText: "Get Started Free",
    },
    {
      id: "student-pro",
      name: "Pro Student",
      badge: "Most Popular",
      price: 10,
      period: "/month",
      description: "Stand out to top mentors with priority booking and unlimited applications.",
      isPro: true,
      features: [
        "Unlimited tuition & batch applications",
        "Priority booking badge on applications",
        "Direct 1-on-1 mentorship scheduling",
        "Early access to newly posted batches",
        "24/7 dedicated student support",
      ],
      ctaText: "Subscribe with Stripe",
    },
  ],
  tutor: [
    {
      id: "tutor-free",
      name: "Tutor Basic",
      price: 0,
      period: "/month",
      description: "Start your teaching journey by creating batches and connecting with students.",
      isPro: false,
      features: [
        "Create up to 2 active tuition posts",
        "Manage student applications from dashboard",
        "Standard listing visibility in search",
        "Basic tutor profile page",
      ],
      ctaText: "Start Teaching Free",
    },
    {
      id: "tutor-pro",
      name: "Pro Tutor",
      badge: "Recommended",
      price: 15,
      period: "/month",
      description: "Scale your mentorship with unlimited posts, a Verified Badge, and top ranking.",
      isPro: true,
      features: [
        "Unlimited active tuition & batch posts",
        "Official Verified Mentor Badge on profile",
        "Featured placement at top of search results",
        "Detailed student enrollment analytics",
        "Zero platform commission on direct bookings",
      ],
      ctaText: "Subscribe with Stripe",
    },
  ],
};

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState<AudienceTab>("tutor");

  const currentPlans = plansData[activeTab];

  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-b border-border-subtle bg-background py-16 sm:py-24"
    >
      {/* Subtle Decorative Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-112.5 w-112.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-tint/60 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>Flexible Plans for Everyone</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-base text-body">
            Start for free and upgrade anytime to unlock verified badges, unlimited posts, and priority mentorship booking.
          </p>

          {/* Role Toggle Switch (For Tutors / For Students) */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-border-subtle bg-surface p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("tutor")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "tutor"
                  ? "bg-heading text-background shadow-xs"
                  : "text-body hover:text-heading"
              }`}
            >
              <BookOpen className="h-4 w-4 text-brand" />
              For Tutors
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "student"
                  ? "bg-heading text-background shadow-xs"
                  : "text-body hover:text-heading"
              }`}
            >
              <GraduationCap className="h-4 w-4 text-brand" />
              For Students
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {currentPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                plan.isPro
                  ? "border-2 border-brand bg-background shadow-xl shadow-brand/10"
                  : "border border-border-subtle bg-surface/70 hover:border-border-subtle hover:bg-background hover:shadow-md"
              }`}
            >
              {/* Pro Highlight Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 right-6">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-1 text-xs font-bold text-heading shadow-xs">
                    <Zap className="h-3.5 w-3.5 fill-heading" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan Title & Description */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-heading">{plan.name}</h3>
                  {plan.isPro && (
                    <ShieldCheck className="h-6 w-6 text-brand" />
                  )}
                </div>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1 border-b border-border-subtle pb-6">
                  <span className="text-4xl font-extrabold tracking-tight text-heading">
                    ${plan.price}
                  </span>
                  <span className="text-sm font-medium text-body">
                    {plan.period}
                  </span>
                </div>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.isPro
                            ? "bg-brand text-heading"
                            : "bg-brand-tint text-heading"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                      <span className="text-heading/90 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA Button */}
              <div className="mt-8 pt-4">
                {plan.isPro ? (
                  <Link href="/payment" className="block">
                    <Button className="w-full bg-brand hover:bg-brand-hover text-heading font-bold py-6 rounded-xl shadow-sm transition-all gap-2 cursor-pointer text-sm">
                      <CreditCard className="h-4 w-4" />
                      {plan.ctaText}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-border-subtle bg-background hover:bg-surface text-heading font-semibold py-6 rounded-xl cursor-pointer text-sm"
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}