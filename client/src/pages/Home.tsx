/*
 * Design: Dark Cinematic Narrative — AeonStory (永恒的故事)
 * Color: Deep navy (#0A0A0F) + Gold (#E8C547) + Ice Blue (#4CC9F0)
 * Typography: Space Grotesk (headings) + Noto Sans SC (body)
 * Layout: Full-screen sections with parallax-like backgrounds
 */

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VisionSection from "@/components/VisionSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import WebsiteSection from "@/components/WebsiteSection";
import PipelineSection from "@/components/PipelineSection";
import M3UltraSection from "@/components/M3UltraSection";
import ControlCenterSection from "@/components/ControlCenterSection";
import SetupGuideSection from "@/components/SetupGuideSection";
import ApiListSection from "@/components/ApiListSection";
import DistributionSection from "@/components/DistributionSection";
import BusinessSection from "@/components/BusinessSection";
import ContentFormatSection from "@/components/ContentFormatSection";
import MarketingSection from "@/components/MarketingSection";
import RoadmapSection from "@/components/RoadmapSection";
import RiskSection from "@/components/RiskSection";
import FooterSection from "@/components/FooterSection";
import SampleShowcaseSection from "@/components/SampleShowcaseSection";
import ProductionSpecSection from "@/components/ProductionSpecSection";

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />
      <HeroSection onVisible={() => setActiveSection("hero")} />
      <VisionSection onVisible={() => setActiveSection("vision")} />
      <SampleShowcaseSection onVisible={() => setActiveSection("sample")} />
      <ProductionSpecSection onVisible={() => setActiveSection("production-spec")} />
      <ArchitectureSection onVisible={() => setActiveSection("architecture")} />
      <WebsiteSection onVisible={() => setActiveSection("website")} />
      <PipelineSection onVisible={() => setActiveSection("pipeline")} />
      <M3UltraSection onVisible={() => setActiveSection("m3-ultra")} />
      <ControlCenterSection onVisible={() => setActiveSection("control-center")} />
      <SetupGuideSection onVisible={() => setActiveSection("setup-guide")} />
      <ApiListSection onVisible={() => setActiveSection("api-list")} />
      <DistributionSection onVisible={() => setActiveSection("distribution")} />
      <BusinessSection onVisible={() => setActiveSection("business")} />
      <ContentFormatSection onVisible={() => setActiveSection("content-format")} />
      <MarketingSection onVisible={() => setActiveSection("marketing")} />
      <RoadmapSection onVisible={() => setActiveSection("roadmap")} />
      <RiskSection onVisible={() => setActiveSection("risk")} />
      <FooterSection />
    </div>
  );
}
