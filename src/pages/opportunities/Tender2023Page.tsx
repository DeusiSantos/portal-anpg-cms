import { Archive } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";

export default function Tender2023Page() {
  const { data: pageData } = usePageData("tender2023");

  const results: Array<{ value: string; title: string; description: string }> = pageData?.results || [];
  const timeline: Array<{ phase: string; date: string; description: string }> = pageData?.timeline || [];

  return (
    <PageLayout
      pageKey="tender-2023"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Archive className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.opportunities", href: "/opportunities" },
        { labelKey: "nav.submenu.tender2023" },
      ]}
    >
      <div className="space-y-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">{pageData?.introTitle || ""}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-3">{pageData?.introDescription || ""}</p>
          {pageData?.introStatus && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent text-accent-foreground">
              {pageData.introStatus}
            </span>
          )}
        </div>

        {results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.resultsTitle || "Resultados do Concurso"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map((item, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-secondary/50 border border-border">
                  <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {timeline.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.timelineTitle || "Cronograma do Concurso"}</h2>
            <div className="space-y-4">
              {timeline.map((item, i) => (
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
