// src/pages/about/index.tsx

import { Building2, Target, Eye, Award, Shield, Lightbulb, Users, Leaf, Heart, Handshake, TrendingUp, Globe, Zap, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Loader2 } from "lucide-react";
import { usePageData } from "@/hooks/pages/usePageData";

// Mapeamento de ícones para cada valor
const valueIcons: Record<string, React.ElementType> = {
  integrity: Shield,
  transparency: Eye,
  excellence: Award,
  sustainability: Leaf,
  innovation: Lightbulb,
  collaboration: Users,
  // Ícones adicionais caso sejam adicionados novos valores
  trust: Heart,
  partnership: Handshake,
  growth: TrendingUp,
  global: Globe,
  energy: Zap,
  community: Smile,
};

// Fallback values caso o JSON não tenha todos os valores
const defaultValues = {
  integrity: { title: "Integridade", description: "Actuamos com honestidade, ética e responsabilidade em todas as nossas acções." },
  transparency: { title: "Transparência", description: "Compromisso com a clareza e abertura em todas as operações." },
  excellence: { title: "Excelência", description: "Padrões internacionais de qualidade e eficiência." },
  sustainability: { title: "Sustentabilidade", description: "Desenvolvimento responsável dos recursos energéticos." },
  innovation: { title: "Inovação", description: "Adopção de tecnologias avançadas no sector." },
  collaboration: { title: "Colaboração", description: "Trabalho em equipa e parcerias estratégicas para alcançar objectivos comuns." },
};

// Fallback para objectivos estratégicos
const defaultStrategicObjectives = [
  { key: "reserves", label: "Maximizar reservas provadas e recuperação de hidrocarbonetos" },
  { key: "growth", label: "Assegurar o crescimento sustentável do sector" },
  { key: "localContent", label: "Aumentar os níveis de Conteúdo Local" },
  { key: "governance", label: "Garantir boa governação, transparência e prestação de contas" },
  { key: "data", label: "Melhorar a Gestão de Dados do Sector Petrolífero Nacional" },
  { key: "safety", label: "Alcançar níveis de excelência na área de QSMS" },
];

// Fallback para CTA
const defaultCta = {
  title: "Quer saber mais sobre a ANPG?",
  description: "Explore as nossas páginas institucionais para conhecer melhor a nossa história, equipa e compromissos.",
  buttonPrimaryText: "Saber Mais",
  buttonPrimaryLink: "/about/anpg",
  buttonSecondaryText: "Contactar",
  buttonSecondaryLink: "/contacts",
};

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: pageData, isLoading } = usePageData("about");

  if (isLoading) {
    return (
      <PageLayout
        pageKey="about"
        breadcrumbs={[{ label: "Sobre nós", href: "/about" }]}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  // Extrair dados do JSON com fallbacks
  const content = pageData?.content || {};
  const strategicObjectives = pageData?.strategicObjectives?.items?.length 
    ? pageData.strategicObjectives.items 
    : defaultStrategicObjectives;
  const values = { ...defaultValues, ...(pageData?.values || {}) };
  const cta = { ...defaultCta, ...(pageData?.cta || {}) };
  const breadcrumbLabel = pageData?.breadcrumbLabel || "Sobre nós";
  const titleHighlight = pageData?.titleHighlight || "";

  return (
    <PageLayout
      pageKey="about"
      title={pageData?.title || "Sobre a ANPG"}
      subtitle={pageData?.subtitle || "Institucional"}
      description={pageData?.description || ""}
      icon={<Building2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: breadcrumbLabel, href: "/about" }
      ]}
    >
      {/* Mission & Vision Section */}
      <section className="mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionTransition>
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-primary" />
                {pageData?.subtitle || "Institucional"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {pageData?.title || "Sobre a ANPG"} 
                {titleHighlight && <span className="text-primary"> {titleHighlight}</span>}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {content.intro}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {content.role}
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
                    <p className="text-muted-foreground text-sm">{content.mission}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Visão</h3>
                    <p className="text-muted-foreground text-sm">{content.vision}</p>
                  </div>
                </div>
              </div>
            </SectionTransition>
          </div>
          
          {/* Values Grid */}
          <SectionTransition delay={0.3} direction="left">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(values).map(([key, value]: [string, any]) => {
                const Icon = valueIcons[key] || valueIcons.integrity;
                return (
                  <div 
                    key={key} 
                    className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">
                      {value.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                );
              })}
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
              {pageData?.strategicObjectives?.label || "Estratégia"}
              <span className="w-8 h-px bg-primary" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {pageData?.strategicObjectives?.title || "Objectivos Estratégicos"}
            </h2>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategicObjectives.map((item: any, index: number) => (
              <StaggerItem key={item.key || index}>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-border hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-primary font-bold">{index + 1}</span>
                  </div>
                  <p className="text-foreground font-medium">{item.label}</p>
                </div>
              </StaggerItem>
            ))}
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
                "{content.pcaMessage}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{content.pcaName}</p>
                  <p className="text-primary-foreground/70 text-sm">{content.pcaTitle}</p>
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
            {cta.title}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {cta.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to={cta.buttonPrimaryLink}>
                {cta.buttonPrimaryText}
              </Link>
            </Button>
            <Button variant="heroOutlineLight" size="lg" asChild>
              <Link to={cta.buttonSecondaryLink}>
                {cta.buttonSecondaryText}
              </Link>
            </Button>
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}