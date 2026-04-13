import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import { useContentBlocks } from "@/hooks/useCMSData";

export default function WhistleblowerPage() {
  const { t } = useTranslation();
  const { data: blocks } = useContentBlocks("whistleblower");

  const getSection = (key: string) => blocks?.find(b => b.section_key === key)?.content;

  const introContent = getSection("intro");
  const contactContent = getSection("contact");

  const features = [
    { icon: ShieldCheck, titleKey: "pages.whistleblower.features.confidentiality.title", descKey: "pages.whistleblower.features.confidentiality.desc" },
    { icon: Lock, titleKey: "pages.whistleblower.features.security.title", descKey: "pages.whistleblower.features.security.desc" },
    { icon: Mail, titleKey: "pages.whistleblower.features.followUp.title", descKey: "pages.whistleblower.features.followUp.desc" },
  ];

  // CMS features override
  const cmsFeatures = introContent?.features as Array<{ title: string; desc: string }> | undefined;
  const featureIcons = [ShieldCheck, Lock, Mail];

  return (
    <PageLayout
      pageKey="whistleblower"
      title={t("pages.whistleblower.title")}
      subtitle={t("pages.whistleblower.subtitle")}
      breadcrumbs={[
        { label: t("pages.whistleblower.title") },
      ]}
    >
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <SectionTransition>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {cmsFeatures ? cmsFeatures.map((item, i) => {
                const Icon = featureIcons[i % featureIcons.length];
                return (
                  <div key={i} className="bg-card border border-border rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              }) : features.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-2xl p-8 text-center">
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

          <SectionTransition delay={0.2}>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-5">
              <p>{introContent?.p1 || t("pages.whistleblower.p1")}</p>
              <p>{introContent?.p2 || t("pages.whistleblower.p2")}</p>
              <p>{introContent?.p3 || t("pages.whistleblower.p3")}</p>
            </div>
          </SectionTransition>

          <SectionTransition delay={0.3}>
            <div className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-10">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {contactContent?.title || t("pages.whistleblower.howToTitle")}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Email:</strong> {contactContent?.email || t("pages.whistleblower.email")}</p>
                <p><strong className="text-foreground">{t("pages.contacts.phone", "Telefone")}:</strong> {contactContent?.phone || t("pages.whistleblower.phone")}</p>
                <p className="text-sm italic">{contactContent?.disclaimer || t("pages.whistleblower.disclaimer")}</p>
              </div>
            </div>
          </SectionTransition>
        </div>
      </section>
    </PageLayout>
  );
}
