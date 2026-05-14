import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Shield, Eye, Lock, Server, UserCheck, Mail, Loader2 } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { usePageData } from "@/hooks/pages/usePageData";

const sectionIcons = [Eye, Server, Lock, UserCheck, Shield, Mail];

export default function PrivacyPage() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const { data: pageData, isLoading } = usePageData("privacy");

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
      pageKey="privacy"
      title={pageData?.title || t("pages.privacy.title")}
      subtitle={pageData?.subtitle || t("pages.privacy.subtitle")}
      description={pageData?.description || t("pages.privacy.description")}
      breadcrumbs={[
        { labelKey: "nav.aboutUs", href: "/about" },
        { label: pageData?.title || t("pages.privacy.title") },
      ]}
    >
      <section className="section-padding bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <SectionTransition>
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none mb-12">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {pageData?.intro || t("pages.privacy.intro")}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  {pageData?.lastUpdated || t("pages.privacy.lastUpdated")}: {pageData?.lastUpdatedValue || "Janeiro 2025"}
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
                  <p className="text-muted-foreground text-center py-8">{t("pages.privacy.intro")}</p>
                )}
              </div>

              <SectionTransition delay={0.6}>
                <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {pageData?.dpo?.title || t("pages.privacy.dpo.title")}
                  </h3>
                  <div className="text-muted-foreground space-y-2">
                    <p><strong>{t("pages.privacy.dpo.entity")}:</strong> {pageData?.dpo?.entityValue || "ANPG - Agência Nacional de Petróleo, Gás e Biocombustíveis"}</p>
                    <p><strong>{t("pages.privacy.dpo.email")}:</strong> {pageData?.dpo?.emailValue || settings.contact?.email || "privacidade@anpg.co.ao"}</p>
                    <p><strong>{t("pages.privacy.dpo.address")}:</strong> {pageData?.dpo?.addressValue || settings.contact?.address || "Rua Kwamme Nkrumah, Nº 6-8, Ingombota, Luanda, Angola"}</p>
                  </div>
                </div>
              </SectionTransition>
            </div>
          </SectionTransition>
        </div>
      </section>
    </PageLayout>
  );
}
