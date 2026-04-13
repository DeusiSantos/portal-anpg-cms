import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { FileText, Scale, AlertTriangle, Copyright, Globe, Gavel } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useContentBlocks } from "@/hooks/useCMSData";

const sectionIcons = [FileText, Globe, Copyright, AlertTriangle, Scale, Gavel];

export default function TermsPage() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const { data: blocks } = useContentBlocks("terms");

  const getSection = (key: string) => blocks?.find(b => b.section_key === key)?.content;

  const introContent = getSection("intro");
  const sectionsContent = getSection("sections");
  const updatesContent = getSection("updates");

  const defaultSections = [
    { icon: FileText, titleKey: "pages.terms.sections.acceptance.title", contentKey: "pages.terms.sections.acceptance.content" },
    { icon: Globe, titleKey: "pages.terms.sections.use.title", contentKey: "pages.terms.sections.use.content" },
    { icon: Copyright, titleKey: "pages.terms.sections.intellectual.title", contentKey: "pages.terms.sections.intellectual.content" },
    { icon: AlertTriangle, titleKey: "pages.terms.sections.limitations.title", contentKey: "pages.terms.sections.limitations.content" },
    { icon: Scale, titleKey: "pages.terms.sections.liability.title", contentKey: "pages.terms.sections.liability.content" },
    { icon: Gavel, titleKey: "pages.terms.sections.jurisdiction.title", contentKey: "pages.terms.sections.jurisdiction.content" },
  ];

  const cmsSections = sectionsContent?.items as Array<{ title: string; content: string }> | undefined;

  return (
    <PageLayout
      pageKey="terms"
      title={t("pages.terms.title")}
      subtitle={t("pages.terms.subtitle")}
      description={t("pages.terms.description")}
      breadcrumbs={[
        { labelKey: "nav.aboutUs", href: "/about" },
        { labelKey: "pages.terms.title" },
      ]}
    >
      <section className="section-padding bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <SectionTransition>
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none mb-12">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {introContent?.text || t("pages.terms.intro")}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  {t("pages.terms.lastUpdated")}: {introContent?.lastUpdated || "Janeiro 2025"}
                </p>
              </div>

              <div className="space-y-8">
                {cmsSections ? cmsSections.map((section, index) => (
                  <SectionTransition key={index} delay={index * 0.1}>
                    <div className="bg-secondary/30 rounded-lg p-6 border border-border">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          {(() => { const Icon = sectionIcons[index % sectionIcons.length]; return <Icon className="w-6 h-6 text-primary" />; })()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-3">{section.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                        </div>
                      </div>
                    </div>
                  </SectionTransition>
                )) : defaultSections.map((section, index) => (
                  <SectionTransition key={section.titleKey} delay={index * 0.1}>
                    <div className="bg-secondary/30 rounded-lg p-6 border border-border">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <section.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-3">{t(section.titleKey)}</h3>
                          <p className="text-muted-foreground leading-relaxed">{t(section.contentKey)}</p>
                        </div>
                      </div>
                    </div>
                  </SectionTransition>
                ))}
              </div>

              <SectionTransition delay={0.6}>
                <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {updatesContent?.title || t("pages.terms.updates.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {updatesContent?.content || t("pages.terms.updates.content")}
                  </p>
                </div>
              </SectionTransition>

              <SectionTransition delay={0.7}>
                <div className="mt-8 text-center text-muted-foreground">
                  <p>
                    {t("pages.terms.questions")} <a href={`mailto:${settings.contact?.email || "geral@anpg.co.ao"}`} className="text-primary hover:underline">{settings.contact?.email || "geral@anpg.co.ao"}</a>
                  </p>
                </div>
              </SectionTransition>
            </div>
          </SectionTransition>
        </div>
      </section>
    </PageLayout>
  );
}
