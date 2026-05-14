import { History, Calendar, Droplets, Factory, Ship, Building2, Award, TrendingUp, Flame, Landmark, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageData } from "@/hooks/pages/usePageData";
import api, { getFullImageUrl } from "@/service/api";

interface TimelineContent {
  lang: number;
  title: string;
  description: string;
}

interface TimelineItem {
  id: string;
  year: number;
  displayOrder: number;
  imageUrl: string | null;
  imagePath: string | null;
  contents: TimelineContent[];
  isActive: boolean;
}

interface TimelineResponse {
  items: TimelineItem[];
}

const getContent = (item: TimelineItem, lang: number): TimelineContent | undefined =>
  item.contents?.find(c => c.lang === lang);

const fetchTimelineEvents = async (): Promise<TimelineItem[]> => {
  const response = await api.get<TimelineResponse>('/timelines', {
    params: { Page: 1, PageSize: 100 },
  });
  return (response.data.items || [])
    .filter(e => e.isActive)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.displayOrder - b.displayOrder);
};

const iconPool = [
  <Droplets className="w-5 h-5" />,
  <Factory className="w-5 h-5" />,
  <TrendingUp className="w-5 h-5" />,
  <Ship className="w-5 h-5" />,
  <Building2 className="w-5 h-5" />,
  <Award className="w-5 h-5" />,
  <Flame className="w-5 h-5" />,
  <Landmark className="w-5 h-5" />,
];

export default function HistoryPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const { data: pageData, isLoading: pageLoading } = usePageData("history");

  const { data: apiEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["timeline-events-public"],
    queryFn: fetchTimelineEvents,
    staleTime: 5 * 60 * 1000,
  });

  const eras: Array<{ name: string; years: string; color: string }> = pageData?.eras || [];
  const stats: Array<{ value: string; label: string }> = pageData?.stats || [];
  const highlightYears: number[] = pageData?.highlightYears || [1968, 1976, 1999, 2007, 2008, 2013, 2019];
  const highlightSet = new Set(highlightYears);

  // API events take priority; fall back to static JSON timeline
  const staticTimeline: Array<{ year: number; title: string; description: string }> = pageData?.timeline || [];
  const hasApiEvents = apiEvents && apiEvents.length > 0;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageLayout
      pageKey="history"
      title={pageData?.title || "A Nossa História"}
      subtitle={pageData?.subtitle || "Desde 1910"}
      description={pageData?.description || ""}
      icon={<History className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: pageData?.breadcrumbAbout || "Sobre Nós", href: "/about" },
        { label: pageData?.title || "A Nossa História" },
      ]}
    >
      {/* Introduction */}
      <SectionTransition>
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {pageData?.intro || ""}
            </p>
          </div>
        </section>
      </SectionTransition>

      {/* Era Legend */}
      <SectionTransition delay={0.1}>
        <section className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {eras.map((era, index) => (
              <motion.div
                key={era.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`px-4 py-2 rounded-full bg-gradient-to-r ${era.color} border border-border/50`}
              >
                <span className="text-sm font-medium text-foreground">{era.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{era.years}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </SectionTransition>

      {/* Creative Timeline */}
      <SectionTransition delay={0.2}>
        <section>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {pageData?.timelineTitle || "Linha do Tempo"}
            </h2>
          </div>

          {eventsLoading ? (
            <div className="space-y-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : hasApiEvents ? (
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -translate-x-1/2 rounded-full" />
              <div className="md:hidden absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 rounded-full" />

              <div className="space-y-8 md:space-y-0">
                {apiEvents.map((event, index) => {
                  const isLeft = index % 2 === 0;
                  const ptContent = getContent(event, 1);
                  const enContent = getContent(event, 2);
                  const title = isEn && enContent?.title ? enContent.title : ptContent?.title || "";
                  const description = isEn && enContent?.description ? enContent.description : ptContent?.description || "";
                  const hasImage = !!event.imageUrl;
                  const imageUrl = event.imageUrl ? getFullImageUrl(event.imageUrl) : null;
                  const isHighlight = highlightSet.has(event.year);
                  const icon = iconPool[index % iconPool.length];

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`relative flex items-start ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} md:py-8`}
                    >
                      <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 z-10 ${
                        isHighlight ? "w-12 h-12 bg-primary shadow-lg shadow-primary/30" : "w-10 h-10 bg-secondary border-2 border-primary/30"
                      } rounded-full flex items-center justify-center`}>
                        <span className={isHighlight ? "text-primary-foreground" : "text-primary"}>{icon}</span>
                      </div>

                      <div className={`flex-1 ml-20 md:ml-0 ${isLeft ? "md:pr-20 md:mr-8" : "md:pl-20 md:ml-8"}`}>
                        <div className={`group relative overflow-hidden rounded-2xl ${
                          hasImage ? "bg-foreground text-pearl" : "bg-secondary/50 border border-border/50"
                        } ${isHighlight ? "ring-2 ring-primary/30 shadow-lg" : ""} hover:shadow-xl transition-all duration-500`}>
                          {hasImage && imageUrl && (
                            <div className="absolute inset-0">
                              <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                                onError={e => { e.currentTarget.style.display = "none"; }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-foreground/40" />
                            </div>
                          )}
                          <div className="relative p-6 md:p-8">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 ${
                              hasImage ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                            }`}>
                              <span className="font-bold text-lg">{event.year}</span>
                            </div>
                            <h3 className={`text-xl md:text-2xl font-bold mb-3 ${hasImage ? "text-pearl" : "text-foreground"}`}>
                              {title}
                            </h3>
                            <p className={`leading-relaxed ${hasImage ? "text-pearl/80" : "text-muted-foreground"}`}>
                              {description}
                            </p>
                            {isHighlight && !hasImage && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block flex-1" />
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex justify-center pt-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-primary-foreground font-bold text-sm">{pageData?.today || "Hoje"}</span>
                </div>
              </motion.div>
            </div>
          ) : staticTimeline.length > 0 ? (
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -translate-x-1/2 rounded-full" />
              <div className="md:hidden absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 rounded-full" />

              <div className="space-y-8 md:space-y-0">
                {staticTimeline.map((event, index) => {
                  const isLeft = index % 2 === 0;
                  const isHighlight = highlightSet.has(event.year);
                  const icon = iconPool[index % iconPool.length];

                  return (
                    <motion.div
                      key={event.year}
                      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`relative flex items-start ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} md:py-8`}
                    >
                      <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 z-10 ${
                        isHighlight ? "w-12 h-12 bg-primary shadow-lg shadow-primary/30" : "w-10 h-10 bg-secondary border-2 border-primary/30"
                      } rounded-full flex items-center justify-center`}>
                        <span className={isHighlight ? "text-primary-foreground" : "text-primary"}>{icon}</span>
                      </div>

                      <div className={`flex-1 ml-20 md:ml-0 ${isLeft ? "md:pr-20 md:mr-8" : "md:pl-20 md:ml-8"}`}>
                        <div className={`group relative overflow-hidden rounded-2xl bg-secondary/50 border border-border/50 ${
                          isHighlight ? "ring-2 ring-primary/30 shadow-lg" : ""
                        } hover:shadow-xl transition-all duration-500`}>
                          <div className="relative p-6 md:p-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-primary/10 text-primary">
                              <span className="font-bold text-lg">{event.year}</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">{event.title}</h3>
                            <p className="leading-relaxed text-muted-foreground">{event.description}</p>
                            {isHighlight && <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />}
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block flex-1" />
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex justify-center pt-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-primary-foreground font-bold text-sm">{pageData?.today || "Hoje"}</span>
                </div>
              </motion.div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {pageData?.noEventsText || "Sem eventos históricos disponíveis."}
            </p>
          )}
        </section>
      </SectionTransition>

      {/* Statistics Summary */}
      <SectionTransition delay={0.3}>
        <section className="mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-secondary/50 border border-border/50"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
