import { useTranslation } from "react-i18next";
import { HelpCircle, Building2, FileText, Users, Globe, Shield } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useFAQItems } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";

const categoryMeta: Record<string, { icon: React.ReactNode; titlePt: string; titleEn: string }> = {
  investment: { icon: <Building2 className="w-5 h-5" />, titlePt: "Investimento", titleEn: "Investment" },
  tendering: { icon: <FileText className="w-5 h-5" />, titlePt: "Licitações", titleEn: "Tendering" },
  contracts: { icon: <Shield className="w-5 h-5" />, titlePt: "Contratos", titleEn: "Contracts" },
  localContent: { icon: <Users className="w-5 h-5" />, titlePt: "Conteúdo Local", titleEn: "Local Content" },
  data: { icon: <Globe className="w-5 h-5" />, titlePt: "Dados E&P", titleEn: "E&P Data" },
  general: { icon: <HelpCircle className="w-5 h-5" />, titlePt: "Geral", titleEn: "General" },
};

export default function FAQPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { data: faqGroups, isLoading } = useFAQItems();

  const breadcrumbs = [{ labelKey: "faq.breadcrumb" }];

  return (
    <PageLayout
      pageKey="faq"
      titleKey="faq.hero.title"
      descriptionKey="faq.hero.description"
      icon={<HelpCircle className="w-8 h-8" />}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("faq.intro")}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : faqGroups && Object.keys(faqGroups).length > 0 ? (
          Object.entries(faqGroups).map(([category, questions]) => {
            const meta = categoryMeta[category] || categoryMeta.general;
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {meta.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {isEn ? meta.titleEn : meta.titlePt}
                  </h2>
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                  {questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category}-${index}`}
                      className="bg-secondary/50 border border-border rounded-xl px-6 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/30 transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground font-medium">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 pl-8">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })
        ) : (
          <p className="text-center text-muted-foreground">{isEn ? "No FAQs available." : "Sem FAQs disponíveis."}</p>
        )}

        <div className="text-center pt-8 pb-4 border-t border-border">
          <p className="text-muted-foreground mb-4">{t("faq.contactCta.text")}</p>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            {t("faq.contactCta.link")}
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
