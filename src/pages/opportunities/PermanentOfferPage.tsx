import {
  Search, FileText, Handshake, Award,
  Clock, Users, RefreshCw, Database,
  CheckCircle2, ArrowRight, Mail, MapPin
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePageData } from "@/hooks/pages/usePageData";

const stepIcons = [Search, FileText, Handshake, Award];
const advantageIcons = [Clock, Handshake, RefreshCw, Database];

function SectionDivider({ label, icon: Icon }: { label?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/60" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-background px-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PermanentOfferPage() {
  const { data: pageData } = usePageData("permanentOffer");

  const steps: Array<{ title: string; desc: string }> = pageData?.howItWorks || [];
  const advantages: Array<{ title: string; desc: string }> = pageData?.advantages || [];
  const eligibility: string[] = pageData?.eligibility || [];
  const blocks: Array<{ name: string; basin: string; areaKm2: number; depthCategory: string; status: string }> = pageData?.blocks || [];

  return (
    <PageLayout
      pageKey="permanent-offer"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      breadcrumbs={[
        { labelKey: "nav.opportunities", href: "/opportunities" },
        { labelKey: "nav.submenu.permanentOffer" },
      ]}
    >
      {/* Intro */}
      <SectionTransition>
        <section className="mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
            {pageData?.intro || ""}
          </p>
        </section>
      </SectionTransition>

      {/* How It Works */}
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
            {pageData?.howItWorksTitle || "Como Funciona"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = stepIcons[i % stepIcons.length];
              return (
                <div key={i} className="relative group p-6 rounded-2xl border border-border bg-card hover:shadow-card hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                      <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="text-3xl font-bold text-primary/20">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>

      {/* Divider */}
      <SectionTransition delay={0.15}>
        <SectionDivider label={pageData?.advantagesTitle || "Vantagens"} icon={Users} />
      </SectionTransition>

      {/* Advantages */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {advantages.map((adv, i) => {
              const Icon = advantageIcons[i % advantageIcons.length];
              return (
                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{adv.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{adv.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>

      {/* Divider */}
      <SectionTransition delay={0.25}>
        <SectionDivider label={pageData?.availableBlocksTitle || "Blocos Disponíveis"} icon={MapPin} />
      </SectionTransition>

      {/* Available Blocks Table */}
      <SectionTransition delay={0.3}>
        <section className="mb-16">
          <p className="text-muted-foreground mb-8 max-w-3xl">
            {pageData?.availableBlocksIntro || ""}
          </p>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-semibold text-foreground">{pageData?.blockHeaders?.name || "Bloco"}</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden sm:table-cell">{pageData?.blockHeaders?.basin || "Bacia"}</th>
                  <th className="text-left p-4 font-semibold text-foreground">{pageData?.blockHeaders?.area || "Área (km²)"}</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">{pageData?.blockHeaders?.depth || "Profundidade"}</th>
                  <th className="text-left p-4 font-semibold text-foreground">{pageData?.blockHeaders?.status || "Estado"}</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block, i) => (
                  <tr key={block.name || i} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{block.name}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{block.basin || "—"}</td>
                    <td className="p-4 text-muted-foreground">
                      {block.areaKm2 ? `${block.areaKm2.toLocaleString()} km²` : "—"}
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {block.depthCategory || "—"}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        block.status === (pageData?.statusAvailable || "Disponível")
                          ? "bg-status-success/10 text-status-success-foreground border-status-success/20 hover:bg-status-success/20"
                          : "bg-status-warning/10 text-status-warning-foreground border-status-warning/20 hover:bg-status-warning/20"
                      )}>
                        {block.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {blocks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {pageData?.noDataText || "Sem dados disponíveis"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </SectionTransition>

      {/* Divider */}
      <SectionTransition delay={0.35}>
        <SectionDivider label={pageData?.eligibilityTitle || "Critérios de Elegibilidade"} icon={CheckCircle2} />
      </SectionTransition>

      {/* Eligibility */}
      <SectionTransition delay={0.4}>
        <section className="mb-16">
          <div className="max-w-3xl space-y-4">
            {eligibility.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionTransition>

      {/* CTA */}
      <SectionTransition delay={0.45}>
        <section className="max-w-2xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-primary/5 border border-primary/10">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {pageData?.ctaTitle || "Interessado numa Oferta Permanente?"}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {pageData?.ctaDesc || "Entre em contacto com a nossa equipa de investimentos para mais informações."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <a href="/contacts">
                  <Handshake className="w-4 h-4 mr-2" />
                  {pageData?.ctaButton || "Contactar Equipa de Investimentos"}
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={`mailto:${pageData?.ctaEmailAddress || "investimentos@anpg.co.ao"}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  {pageData?.ctaEmail || "Enviar Email"}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
