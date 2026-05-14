import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Flame, BarChart3, Globe2, TrendingUp } from "lucide-react";
import { usePageData } from "@/hooks/pages/usePageData";

const highlightIcons = [Flame, BarChart3, Globe2, TrendingUp];

export default function GasPage() {
  const { data: pageData } = usePageData("gas");

  const highlights: Array<{ key: string; title: string; desc: string }> = pageData?.highlights || [];

  return (
    <PageLayout
      pageKey="gas"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      breadcrumbs={[
        { labelKey: "nav.opportunities", href: "/opportunities" },
        { label: pageData?.title || "Gás" },
      ]}
    >
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <SectionTransition>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {pageData?.intro || ""}
              </p>
            </div>
          </SectionTransition>

          <SectionTransition delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {highlights.map((item, i) => {
                const Icon = highlightIcons[i % highlightIcons.length];
                return (
                  <div key={item.key || i} className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </SectionTransition>

          <SectionTransition delay={0.3}>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-10 lg:p-14">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {pageData?.opportunitiesTitle || "Oportunidades de Investimento em Gás"}
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>{pageData?.p1 || ""}</p>
                <p>{pageData?.p2 || ""}</p>
              </div>
            </div>
          </SectionTransition>
        </div>
      </section>
    </PageLayout>
  );
}
