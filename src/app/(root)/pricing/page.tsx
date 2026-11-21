import type { Metadata } from "next";
import PricingSection from "@/components/home/PricingSection";

export const metadata: Metadata = {
  title: "Plans & Pricing",
  description:
    "Compare free and Pro plans for students and tutors on MentorLagbe. Upgrade for unlimited posts, applications and priority booking.",
};

export default function PricingPage() {
  return <PricingSection />;
}
