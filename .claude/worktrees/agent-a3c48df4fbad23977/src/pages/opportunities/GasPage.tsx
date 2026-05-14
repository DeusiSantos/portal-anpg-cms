import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Flame, BarChart3, Globe2, TrendingUp } from "lucide-react";
import { useContentBlocks } from "@/hooks/useCMSData";

const defaultHighlightIcons = [Flame, BarChart3, Globe2, TrendingUp];

export default function GasPage() {
  const { t } = useTranslation();
  const { data: blocks } = useContentBlocks("gas");

  const getSection = (key: string) => blocks?.find(b => b.section_key === key)?.content;

  const introContent = getSection("intro");
  const highlightsContent = getSection("highlights");
  const opportunitiesContent = getSection("opportunities");

  // CMS highlights: [{title, desc},...] or fallback to i18n
  const defaultHighlights = [
    { titleKey: "pages.gas.highlights.lng.title", descKey: "pages.gas.highlights.lng.desc" },
    { titleKey: "pages.gas.highlights.production.title", descKey: "pages.gas.highlights.production.desc" },
    { titleKey: "pages.gas.highlights.export.title", descKey: "pages.gas.highlights.export.desc" },
    { titleKey: "pages.gas.highlights.investment.title", descKey: "pages.gas.highlights.investment.desc" },
  ];

  const cmsHighlights = highlightsContent?.items as Array<{ title: string; desc: string }> | undefined;

  return (
    <PageLayout
      pageKey="gas"
      title={t("pages.gas.title")}
      subtitle={t("pages.gas.subtitle")}
      
      breadcrumbs={[
        { label: t("nav.opportunities"), href: "/opportunities" },
        { label: t("pages.gas.title") },
      ]}
    >
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <SectionTransition>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {introContent?.text || t("pages.gas.intro")}
              </p>
            </div>
          </SectionTransition>

          <SectionTransition delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {cmsHighlights ? cmsHighlights.map((item, i) => {
                const Icon = defaultHighlightIcons[i % defaultHighlightIcons.length];
                return (
                  <div key={i} className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              }) : defaultHighlights.map((item, i) => {
                const Icon = defaultHighlightIcons[i];
                return (
                  <div key={i} className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t(item.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                  </div>
                );
              })}
            </div>
          </SectionTransition>

          <SectionTransition delay={0.3}>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-10 lg:p-14">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {opportunitiesContent?.title || t("pages.gas.opportunitiesTitle")}
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>{opportunitiesContent?.p1 || t("pages.gas.p1")}</p>
                <p>{opportunitiesContent?.p2 || t("pages.gas.p2")}</p>
              </div>
            </div>
          </SectionTransition>
        </div>
      </section>
    </PageLayout>
  );
}
