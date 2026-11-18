import FeaturedTuitions from "@/components/home/FeaturedTuitions";
import HeroBanner from "@/components/home/HeroBanner";
import HowItWorks from "@/components/home/HowItWorks";
import PlatformStatsAndSubjects from "@/components/home/PlatformStatsAndSubjects";
import PricingSection from "@/components/home/PricingSection";

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
