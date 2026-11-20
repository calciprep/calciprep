import LiveTicker from "@/components/features/home/LiveTicker";
import HeroSection from "@/components/features/home/HeroSection";
import SubjectsSection from "@/components/features/home/SubjectsSection";
import FreeToolsSection from "@/components/features/home/FreeToolsSection";
import FeaturesSection from "@/components/features/home/FeaturesSection";
import WhoWeAreSection from "@/components/features/home/WhoWeAreSection";

export default function HomePage() {
  return (
    <>
      <LiveTicker />
      <HeroSection />
      <SubjectsSection />
      <FreeToolsSection />
      <FeaturesSection />
      <WhoWeAreSection />
    </>
  );
}
