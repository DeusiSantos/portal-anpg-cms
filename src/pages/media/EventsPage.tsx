import { Link } from "react-router-dom";
import { Calendar, MapPin, ChevronRight, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Badge } from "@/components/ui/badge";
import { useMediaItems } from "@/hooks/useCMSData";

const defaultEvents = [
  {
    id: "conference-2023",
    title: "Conferência de Dados E&P 2023",
    title_en: "E&P Data Conference 2023",
    date: "Outubro 2023",
    date_en: "October 2023",
    location: "Luanda, Angola",
    description: "Segunda edição da conferência dedicada à gestão e valorização dos dados de exploração e produção.",
    description_en: "Second edition of the conference dedicated to E&P data management and valorization.",
    image: null as string | null,
    href: "/ep-data/conference-2023",
    status: "past" as const,
  },
  {
    id: "conference-2021",
    title: "Conferência de Dados E&P 2021",
    title_en: "E&P Data Conference 2021",
    date: "Novembro 2021",
    date_en: "November 2021",
    location: "Luanda, Angola",
    description: "Primeira edição da conferência de dados de exploração e produção organizada pela ANPG.",
    description_en: "First edition of the E&P data conference organized by ANPG.",
    image: null as string | null,
    href: "/ep-data/conference-2021",
    status: "past" as const,
  },
];

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { data: cmsEvents } = useMediaItems("event");

  // Merge CMS events with hardcoded conference events
  const cmsEventsMapped = cmsEvents?.map((e) => ({
    id: e.id,
    title: isEn ? (e.title_en || e.title) : e.title,
    date: e.event_date || "",
    location: "",
    description: isEn ? (e.description_en || e.description || "") : (e.description || ""),
    image: e.image_url,
    href: e.external_url || "#",
    status: "past" as const,
  })) || [];

  const conferenceEvents = defaultEvents.map((e) => ({
    id: e.id,
    title: isEn ? e.title_en : e.title,
    date: isEn ? e.date_en : e.date,
    location: e.location,
    description: isEn ? e.description_en : e.description,
    image: e.image,
    href: e.href,
    status: e.status,
  }));

  const allEvents = [...cmsEventsMapped, ...conferenceEvents];

  return (
    <PageLayout
      pageKey="media-events"
      titleKey="pages.events.title"
      subtitleKey="pages.events.subtitle"
      descriptionKey="pages.events.description"
      
      icon={<CalendarDays className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.media", href: "/media" },
        { label: isEn ? "Events" : "Eventos" },
      ]}
    >
      <SectionTransition>
        <StaggerContainer className="grid gap-6">
          {allEvents.map((event) => (
            <StaggerItem key={event.id}>
              <Link
                to={event.href}
                className="group block bg-secondary/30 border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {event.image && (
                    <div className="md:w-72 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {event.date}
                      </Badge>
                      {event.location && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {event.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      {isEn ? "View details" : "Ver detalhes"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionTransition>
    </PageLayout>
  );
}
