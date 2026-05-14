import {
  Heart,
  GraduationCap,
  Leaf,
  Users,
  Shield,
  Target,
  BookOpen,
  Briefcase,
  Trophy,
  Palette,
  Scale,
  Building2,
  Handshake,
  Loader2
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { usePageData } from "@/hooks/pages/usePageData";
import chevronLogo from "@/assets/partners/chevron.png";
import totalLogo from "@/assets/partners/totalenergies.png";
import essoLogo from "@/assets/partners/esso.png";
import eniLogo from "@/assets/partners/eni.svg";
import bpLogo from "@/assets/partners/bp.png";
import sonangolLogo from "@/assets/partners/sonangol.svg";

const iconMap: Record<string, React.ElementType> = {
  education: GraduationCap,
  training: BookOpen,
  health: Shield,
  economic: Briefcase,
  social: Users,
  sports: Trophy,
  culture: Palette,
  environment: Leaf,
};

const statIconMap: Record<string, React.ElementType> = {
  education: GraduationCap,
  economic: Building2,
  training: BookOpen,
  health: Shield,
};

const partnerLogos: Record<string, string> = {
  "Chevron": chevronLogo,
  "TotalEnergies": totalLogo,
  "Esso": essoLogo,
  "Eni": eniLogo,
  "BP": bpLogo,
  "Sonangol P&P": sonangolLogo,
};

export default function SocialResponsibilityPage() {
  const { data: pageData, isLoading } = usePageData("socialResponsibility");

  const impactStats: Array<{ value: string; label: string; icon: string }> = pageData?.impactStats || [];
  const areas: Array<{ key: string; icon: string; title: string; description: string }> = pageData?.areas || [];
  const partners: Array<{ name: string; blocks: string }> = pageData?.partners || [];
  const sdgGoals: Array<{ number: number; name: string }> = pageData?.sdgGoals || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageLayout
      pageKey="social-responsibility"
      title={pageData?.title || "Responsabilidade Social"}
      subtitle={pageData?.subtitle || "Compromisso com Angola"}
      description={pageData?.description || ""}
      icon={<Heart className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: "Sobre Nós", href: "/about" },
        { label: pageData?.title || "Responsabilidade Social" },
      ]}
    >
      {/* Impact Stats */}
      <SectionTransition>
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {impactStats.map((stat, index) => {
              const Icon = statIconMap[stat.icon] || GraduationCap;
              return (
                <div
                  key={index}
                  className="bg-secondary/50 border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>

      {/* Introduction */}
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {pageData?.introTitle || "Introdução"}
            </h2>
          </div>
          <div className="max-w-4xl space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {pageData?.introP1 || ""}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {pageData?.introP2 || ""}
            </p>
          </div>
        </section>
      </SectionTransition>

      {/* Mission & Objectives */}
      <SectionTransition delay={0.15}>
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{pageData?.objectivesTitle || "Objectivos"}</h3>
              </div>
              <ul className="space-y-4">
                {(pageData?.objectivesList || []).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary/50 border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{pageData?.missionTitle || "Nossa Missão"}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {pageData?.missionP1 || ""}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {pageData?.missionP2 || ""}
              </p>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Areas of Focus */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {pageData?.areasTitle || "Áreas de Actuação"}
            </h2>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {areas.map((area) => {
              const Icon = iconMap[area.icon || area.key] || Users;
              return (
                <StaggerItem key={area.key}>
                  <div className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{area.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* Legal Framework & SDGs */}
      <SectionTransition delay={0.25}>
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {pageData?.legalTitle || "Enquadramento Legal"}
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-4xl">
              {pageData?.legalText || ""}
            </p>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {pageData?.sdgTitle || "Objectivos de Desenvolvimento Sustentável (ODS) Alinhados"}
              </h3>
              <div className="flex flex-wrap gap-3">
                {sdgGoals.map((goal) => (
                  <div
                    key={goal.number}
                    className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 flex items-center gap-2"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {goal.number}
                    </span>
                    <span className="text-sm text-foreground">{goal.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Partners */}
      <SectionTransition delay={0.3}>
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Handshake className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {pageData?.partnersTitle || "Parceiros do Sector"}
            </h2>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            {pageData?.partnersDescription || ""}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((partner) => {
              const logo = partnerLogos[partner.name];
              return (
                <div
                  key={partner.name}
                  className="bg-secondary/50 border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center"
                >
                  {logo ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-background flex items-center justify-center mx-auto mb-3 border border-border">
                      <img src={logo} alt={partner.name} className="w-12 h-12 object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground text-sm mb-1">{partner.name}</h4>
                  <span className="text-xs text-muted-foreground">{partner.blocks}</span>
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
