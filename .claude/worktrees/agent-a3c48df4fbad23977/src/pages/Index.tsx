import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InvestmentSection } from "@/components/home/InvestmentSection";
import { NewsSection } from "@/components/home/NewsSection";
import { CTASection } from "@/components/home/CTASection";
import { SectionTransition } from "@/components/layout/SectionTransition";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <SectionTransition>
          <StatsSection />
        </SectionTransition>
        <SectionTransition delay={0.1} direction="left">
          <AboutSection />
        </SectionTransition>
        <SectionTransition delay={0.1}>
          <ServicesSection />
        </SectionTransition>
        <SectionTransition delay={0.1} direction="right">
          <InvestmentSection />
        </SectionTransition>
        <SectionTransition delay={0.1}>
          <NewsSection />
        </SectionTransition>
        <SectionTransition delay={0.1}>
          <CTASection />
        </SectionTransition>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
