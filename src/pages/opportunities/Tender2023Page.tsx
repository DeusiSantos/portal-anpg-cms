import { Archive } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { useContentBlocks } from "@/hooks/useCMSData";

export default function Tender2023Page() {
  const { t } = useTranslation();
  const { data: blocks } = useContentBlocks("tender-2023");

  const intro = blocks?.find((b) => b.section_key === "intro")?.content;
  const results = blocks?.find((b) => b.section_key === "results")?.content;
  const timeline = blocks?.find((b) => b.section_key === "timeline")?.content;

  return (
    <PageLayout
      pageKey="tender-2023"
      titleKey="pages.tender2023.title"
      subtitleKey="pages.tender2023.subtitle"
      descriptionKey="pages.tender2023.description"
      
      icon={<Archive className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.opportunities", href: "/opportunities" },
        { labelKey: "nav.submenu.tender2023" },
      ]}
    >
      <div className="space-y-16">
        {intro && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-4">{intro.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-3">{intro.description}</p>
            {intro.status && (
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent text-accent-foreground">
                {intro.status}
              </span>
            )}
          </div>
        )}

        {results?.items && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{results.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.items.map((item: any, i: number) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-secondary/50 border border-border">
                  <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {timeline?.items && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{timeline.title}</h2>
            <div className="space-y-4">
              {timeline.items.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{item.phase}</div>
                    <div className="text-xs text-primary font-medium">{item.date}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
