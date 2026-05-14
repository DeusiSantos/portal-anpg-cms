import { Calendar, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { useContentBlocks } from "@/hooks/useCMSData";

export default function Conference2021Page() {
  const { t } = useTranslation();
  const { data: blocks } = useContentBlocks("conference-2021");

  const intro = blocks?.find((b) => b.section_key === "intro")?.content;
  const highlights = blocks?.find((b) => b.section_key === "highlights")?.content;
  const topics = blocks?.find((b) => b.section_key === "topics")?.content;

  return (
    <PageLayout
      pageKey="conference-2021"
      titleKey="pages.conference2021.title"
      subtitleKey="pages.conference2021.subtitle"
      descriptionKey="pages.conference2021.description"
      icon={<Calendar className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.media", href: "/media" },
        { label: "Eventos", href: "/media/events" },
        { labelKey: "nav.submenu.conference2021" },
      ]}
    >
      <div className="space-y-16">
        {intro && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-4">{intro.title}</h2>
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
              {intro.date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {intro.date}</span>}
              {intro.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {intro.location}</span>}
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">{intro.description}</p>
          </div>
        )}

        {highlights?.items && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{highlights.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.items.map((item: any, i: number) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-secondary/50 border border-border">
                  <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topics?.items && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">{topics.title}</h2>
            <ul className="space-y-3">
              {topics.items.map((topic: string, i: number) => (
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
