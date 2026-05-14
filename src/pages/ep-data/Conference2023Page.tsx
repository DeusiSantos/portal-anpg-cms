import { Users, Calendar, MapPin } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";

export default function Conference2023Page() {
  const { data: pageData } = usePageData("conference2023");

  const highlights: Array<{ value: string; title: string; description: string }> = pageData?.highlights || [];
  const topics: string[] = pageData?.topics || [];

  return (
    <PageLayout
      pageKey="conference-2023"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Users className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.media", href: "/media" },
        { label: "Eventos", href: "/media/events" },
        { labelKey: "nav.submenu.dataConference2023" },
      ]}
    >
      <div className="space-y-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">{pageData?.introTitle || ""}</h2>
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
            {pageData?.introDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {pageData.introDate}</span>}
            {pageData?.introLocation && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {pageData.introLocation}</span>}
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">{pageData?.introDescription || ""}</p>
        </div>

        {highlights.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.highlightsTitle || "Destaques da Conferência"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.map((item, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-secondary/50 border border-border">
                  <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topics.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">{pageData?.topicsTitle || "Temas Abordados"}</h2>
            <ul className="space-y-3">
              {topics.map((topic, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                  <span className="text-muted-foreground">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
