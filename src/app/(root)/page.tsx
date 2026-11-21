import type { Metadata } from "next";
import FeaturedTuitions from "@/components/home/FeaturedTuitions";
import HeroBanner from "@/components/home/HeroBanner";
import HowItWorks from "@/components/home/HowItWorks";
import PlatformStatsAndSubjects from "@/components/home/PlatformStatsAndSubjects";
import PricingSection from "@/components/home/PricingSection";

export const metadata: Metadata = {
  title: { absolute: "MentorLagbe — Tuition & Mentorship Platform" },
  description:
    "Discover verified tutors and structured mentorship batches for every class level, subject and budget.",
};

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <FeaturedTuitions />
      <PricingSection />
      <HowItWorks />
      <PlatformStatsAndSubjects />
    </div>
  );
}
