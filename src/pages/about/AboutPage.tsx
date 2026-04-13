import { Building2, Target, Eye, Award, Shield, Lightbulb, Users, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { useContentBlocks } from "@/hooks/useCMSData";

const valueIcons: Record<string, React.ElementType> = {
  integrity: Shield,
  transparency: Eye,
  excellence: Award,
  sustainability: Leaf,
  innovation: Lightbulb,
  collaboration: Users,
};

const defaultStrategicObjectives = [
  "reserves", "growth", "localContent", "governance", "data", "safety"
];

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("about");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const strategySection = getSection("strategy");
  const ctaSection = getSection("cta");

  const strategicObjectives = strategySection?.items?.length
    ? strategySection.items
    : defaultStrategicObjectives;

  return (
    <PageLayout
      pageKey="about"
      titleKey="pages.about.title"
      subtitleKey="pages.about.subtitle"
      descriptionKey="pages.about.description"
      
      icon={<Building2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.aboutUs" },
      ]}
    >
      {/* Mission & Vision Section */}
      <section className="mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionTransition>
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-primary" />
                {t("pages.about.subtitle")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t("about.title")} <span className="text-primary">{t("about.titleHighlight")}</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("pages.about.content.intro")}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {t("pages.about.content.role")}
              </p>
            </SectionTransition>
            
            <SectionTransition delay={0.2}>
              <div className="space-y-6">
                <div className="flex gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Missão</h3>
                    <p className="text-muted-foreground text-sm">{t("pages.about.content.mission")}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Visão</h3>
                    <p className="text-muted-foreground text-sm">{t("pages.about.content.vision")}</p>
                  </div>
                </div>
              </div>
            </SectionTransition>
          </div>
          
          {/* Values Grid */}
          <SectionTransition delay={0.3} direction="left">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(valueIcons).map(([key, Icon]) => (
                <div 
                  key={key} 
                  className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">
                    {t(`about.values.${key}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t(`about.values.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </SectionTransition>
        </div>
      </section>

      {/* Strategic Objectives */}
      <SectionTransition>
        <section className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-4">
              <span className="w-8 h-px bg-primary" />
              {strategySection?.label || "Estratégia"}
              <span className="w-8 h-px bg-primary" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {strategySection?.title || t("pages.about.strategicObjectives.title")}
            </h2>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategicObjectives.map((item: any, index: number) => {
              const key = typeof item === "string" ? item : item.key;
              const label = typeof item === "string"
                ? t(`pages.about.strategicObjectives.items.${key}`)
                : item.label;
              return (
                <StaggerItem key={key}>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-border hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <p className="text-foreground font-medium">{label}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* PCA Message */}
      <SectionTransition delay={0.2}>
        <section className="mb-20">
          <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-8 md:p-12 text-primary-foreground">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-6">
                <span className="w-8 h-px bg-primary" />
                Mensagem do PCA
              </span>
              <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 italic">
                "{t("pages.about.content.pcaMessage")}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{t("pages.about.content.pcaName")}</p>
                  <p className="text-primary-foreground/70 text-sm">{t("pages.about.content.pcaTitle")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* CTA */}
      <SectionTransition delay={0.3}>
        <section className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            {ctaSection?.title || "Quer saber mais sobre a ANPG?"}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {ctaSection?.description || "Explore as nossas páginas institucionais para conhecer melhor a nossa história, equipa e compromissos."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/about/anpg">{t("common.learnMore")}</Link>
            </Button>
            <Button variant="heroOutlineLight" size="lg" asChild>
              <Link to="/contacts">{t("common.contact")}</Link>
            </Button>
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
