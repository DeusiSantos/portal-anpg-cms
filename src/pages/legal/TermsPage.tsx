import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { FileText, Scale, AlertTriangle, Copyright, Globe, Gavel, Loader2 } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { usePageData } from "@/hooks/pages/usePageData";

const sectionIcons = [FileText, Globe, Copyright, AlertTriangle, Scale, Gavel];

export default function TermsPage() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const { data: pageData, isLoading } = usePageData("terms");

  const sections: Array<{ key: string; title: string; content: string }> = pageData?.sections || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageLayout
      pageKey="terms"
      title={pageData?.title || t("pages.terms.title")}
      subtitle={pageData?.subtitle || t("pages.terms.subtitle")}
      description={pageData?.description || t("pages.terms.description")}
      breadcrumbs={[
        { labelKey: "nav.aboutUs", href: "/about" },
        { label: pageData?.title || t("pages.terms.title") },
      ]}
    >
      <section className="section-padding bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <SectionTransition>
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none mb-12">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {pageData?.intro || t("pages.terms.intro")}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  {pageData?.lastUpdated || t("pages.terms.lastUpdated")}: {pageData?.lastUpdatedValue || "Janeiro 2025"}
                </p>
              </div>

              <div className="space-y-8">
                {sections.length > 0 ? sections.map((section, index) => (
                  <SectionTransition key={section.key || index} delay={index * 0.1}>
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
                )) : (
                  <p className="text-muted-foreground text-center py-8">{t("pages.terms.intro")}</p>
                )}
              </div>

              <SectionTransition delay={0.6}>
                <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {pageData?.updates?.title || t("pages.terms.updates.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {pageData?.updates?.content || t("pages.terms.updates.content")}
                  </p>
                </div>
              </SectionTransition>

              <SectionTransition delay={0.7}>
                <div className="mt-8 text-center text-muted-foreground">
                  <p>
                    {pageData?.questions || t("pages.terms.questions")}{" "}
                    <a
                      href={`mailto:${pageData?.contactEmail || settings.contact?.email || "geral@anpg.co.ao"}`}
                      className="text-primary hover:underline"
                    >
                      {pageData?.contactEmail || settings.contact?.email || "geral@anpg.co.ao"}
                    </a>
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
