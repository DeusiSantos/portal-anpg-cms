import { FileCheck, Target, Calendar, FileText, Download, ArrowRight, CheckCircle2, Clock, Users, Lightbulb, TrendingUp, Shield, Map, HelpCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { BlocksMap } from "@/components/tender/BlocksMap";
import { TenderFAQ } from "@/components/tender/TenderFAQ";
import { usePageData } from "@/hooks/pages/usePageData";

const objectiveIcons = [Target, Lightbulb, TrendingUp, Users, Shield];

export default function Tender2025Page() {
  const { data: pageData } = usePageData("tender2025Content");

  const objectives: Array<{ title: string; description: string }> = pageData?.objectives || [];
  const phases: Array<{ title: string; description: string; period: string; status: string }> = pageData?.phases || [];
  const documents: Array<{ title: string; description: string; type: string; size: string }> = pageData?.documents || [];

  return (
    <PageLayout
      pageKey="tender-2025"
      title={pageData?.bannerTitle}
      subtitle={pageData?.bannerHighlight}
      icon={<FileCheck className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.opportunities", href: "/opportunities" },
        { labelKey: "nav.submenu.tender2025" },
      ]}
      heroChildren={
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="hero" size="lg">
            {pageData?.heroInterest || "Declarar Interesse"}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="heroOutline" size="lg">
            {pageData?.heroBrochure || "Download Brochura"}
          </Button>
        </div>
      }
    >
      {/* Intro Banner */}
      <SectionTransition>
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 md:p-10 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="hidden md:flex w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center flex-shrink-0">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-3">
                  {pageData?.launchDate || "2025"}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  {pageData?.bannerTitle || "Concurso Público Internacional 2025"}
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-3xl">
                  {pageData?.bannerDescription || ""}
                </p>
              </div>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Objectives */}
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.objectivesTitle || "Objectivos do Concurso"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.objectivesSubtitle || "O que pretendemos alcançar"}</p>
            </div>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((objective, index) => {
              const Icon = objectiveIcons[index % objectiveIcons.length];
              return (
                <StaggerItem key={index}>
                  <div className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{objective.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{objective.description}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* Process Timeline */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.phasesTitle || "Fases do Concurso"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.phasesSubtitle || "Calendário do processo"}</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {phases.map((phase, index) => (
                <div key={index} className="relative flex gap-6 md:gap-8">
                  <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                    phase.status === 'active' || phase.status === 'Em curso'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'bg-secondary border-2 border-border text-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className={`flex-1 pb-6 ${index === phases.length - 1 ? 'pb-0' : ''}`}>
                    <div className={`p-5 rounded-xl border transition-all duration-300 ${
                      phase.status === 'active' || phase.status === 'Em curso'
                        ? 'bg-primary/5 border-primary/30 shadow-md'
                        : 'bg-secondary/30 border-border hover:border-primary/20'
                    }`}>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-foreground">{phase.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          phase.status === 'active' || phase.status === 'Em curso'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {phase.period}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                      {(phase.status === 'active' || phase.status === 'Em curso') && (
                        <div className="flex items-center gap-2 mt-3 text-primary text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          {pageData?.statusInProgress || "Em curso"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Interactive Map */}
      <SectionTransition delay={0.25}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.mapTitle || "Localização dos Blocos"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.mapSubtitle || "Blocos disponíveis no concurso"}</p>
            </div>
          </div>
          <BlocksMap />
        </section>
      </SectionTransition>

      {/* Documents */}
      <SectionTransition delay={0.3}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.documentsTitle || "Documentação"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.documentsSubtitle || "Documentos do concurso"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-4 p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <FileText className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{doc.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{doc.type} • {doc.size}</span>
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </SectionTransition>

      {/* FAQ Section */}
      <SectionTransition delay={0.35}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.faqTitle || "Perguntas Frequentes"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.faqSubtitle || "Esclarecimento de dúvidas"}</p>
            </div>
          </div>
          <TenderFAQ />
        </section>
      </SectionTransition>

      {/* CTA */}
      <SectionTransition delay={0.4}>
        <section>
          <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-8 md:p-12 text-primary-foreground text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{pageData?.ctaTitle || "Interessado em participar?"}</h3>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">{pageData?.ctaDescription || "Entre em contacto com a nossa equipa para obter mais informações sobre o processo de participação."}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg">
                {pageData?.ctaInterest || "Declarar Interesse"}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                {pageData?.ctaContact || "Contactar ANPG"}
              </Button>
            </div>
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
