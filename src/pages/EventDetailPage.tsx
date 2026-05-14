import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageData } from "@/hooks/pages/usePageData";
import { 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  ChevronRight,
  CalendarDays,
  MapPin,
  ExternalLink
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import api, { getFullImageUrl } from "@/service/api";

// Tipos da API Events
interface EventContent {
  lang: number;
  title: string | null;
  description: string | null;
  body: string | null;
}

interface EventItem {
  slug: string;
  startAt: string;
  endAt: string;
  location: string;
  mapUrl: string | null;
  registrationUrl: string | null;
  featuredImageUrl: string;
  featuredImagePath: string;
  categoryId: string;
  status: number;
  contents: EventContent[];
  id: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface EventsApiResponse {
  items: EventItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FormattedEvent {
  id: string;
  title: string;
  description: string;
  body: string;
  startAt: string;
  endAt: string;
  formattedStartDate: string;
  formattedEndDate: string;
  location: string;
  mapUrl: string | null;
  registrationUrl: string | null;
  image: string;
  status: number;
  isActive: boolean;
  rawStartDate: string;
  rawEndDate: string;
  categoryName: string;
}

// Função para formatar a data
const formatDate = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Data não disponível';
  }
};

// Função para obter o status do evento
const getEventStatus = (
  startAt: string,
  endAt: string,
  labels?: { upcoming?: string; ongoing?: string; finished?: string }
): { label: string; color: string } => {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now < start) {
    return { label: labels?.upcoming || "Em breve", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
  } else if (now >= start && now <= end) {
    return { label: labels?.ongoing || "A decorrer", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
  } else {
    return { label: labels?.finished || "Finalizado", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
  }
};

// Hook para buscar categorias de eventos
const useEventCategories = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ['event-categories-detail', isEn],
    queryFn: async () => {
      const response = await api.get<{ items: Array<{ id: string; contents: Array<{ lang: number; name: string }> }> }>('/event-categories', {
        params: { Page: 1, PageSize: 100, IsActive: true }
      });
      
      const categories = response.data.items || [];
      const categoryMap = new Map<string, string>();
      
      categories.forEach(cat => {
        const ptContent = cat.contents?.find(c => c.lang === 1);
        const enContent = cat.contents?.find(c => c.lang === 2);
        const name = isEn && enContent?.name ? enContent.name : (ptContent?.name || "Sem categoria");
        categoryMap.set(cat.id, name);
      });
      
      return categoryMap;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para buscar um evento específico por ID
function useEventById(eventId: string | undefined) {
  const { data: categoryMap } = useEventCategories();
  
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID is required');
      
      const response = await api.get<EventItem>(`/events/${eventId}`);
      const event = response.data;
      
      // Encontrar conteúdo em português (lang=1) ou inglês (lang=2)
      const portugueseContent = event.contents?.find(c => c.lang === 1);
      const englishContent = event.contents?.find(c => c.lang === 2);
      const content = portugueseContent || englishContent || event.contents?.[0];
      
      const categoryName = categoryMap?.get(event.categoryId) || "Sem categoria";
      
      const formattedEvent: FormattedEvent = {
        id: event.id,
        title: content?.title || 'Sem título',
        description: content?.description || '',
        body: content?.body || '',
        startAt: event.startAt,
        endAt: event.endAt,
        formattedStartDate: formatDate(event.startAt),
        formattedEndDate: formatDate(event.endAt),
        location: event.location || 'Local a definir',
        mapUrl: event.mapUrl,
        registrationUrl: event.registrationUrl,
        image: event.featuredImageUrl ? getFullImageUrl(event.featuredImageUrl) : '/placeholder-event.jpg',
        status: event.status,
        isActive: event.isActive,
        rawStartDate: event.startAt,
        rawEndDate: event.endAt,
        categoryName: categoryName,
      };
      
      return formattedEvent;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar eventos relacionados
function useRelatedEvents(currentEventId: string, limit: number = 3) {
  return useQuery({
    queryKey: ['related-events', currentEventId, limit],
    queryFn: async () => {
      const response = await api.get<EventsApiResponse>('/events', {
        params: {
          page: 1,
          pageSize: 100,
          status: 1,
          isActive: true,
        },
      });
      
      const allEvents = response.data.items || [];
      
      const related = allEvents
        .filter(item => item.id !== currentEventId && item.isActive === true)
        .slice(0, limit);
      
      return related.map(item => {
        const portugueseContent = item.contents?.find(c => c.lang === 1);
        const englishContent = item.contents?.find(c => c.lang === 2);
        const content = portugueseContent || englishContent || item.contents?.[0];
        const eventStatus = getEventStatus(item.startAt, item.endAt, undefined);
        
        return {
          id: item.id,
          title: content?.title || 'Sem título',
          description: content?.description || '',
          formattedStartDate: formatDate(item.startAt),
          formattedEndDate: formatDate(item.endAt),
          location: item.location || 'Local a definir',
          image: item.featuredImageUrl ? getFullImageUrl(item.featuredImageUrl) : '/placeholder-event.jpg',
          status: eventStatus,
          rawStartDate: item.startAt,
        };
      });
    },
    enabled: !!currentEventId,
    staleTime: 5 * 60 * 1000,
  });
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pageData } = usePageData("eventDetail");

  const { data: event, isLoading, isError } = useEventById(id);
  const { data: relatedEvents = [] } = useRelatedEvents(id || '', 3);

  if (isLoading) {
    return (
      <PageLayout
        title={pageData?.loadingTitle || "A carregar..."}
        subtitle={pageData?.subtitle || "Eventos"}
        icon={<CalendarDays className="w-8 h-8 text-primary" />}
        breadcrumbs={[{ labelKey: "nav.media", href: "/media" }, { label: pageData?.subtitle || "Eventos", href: "/media" }, { label: "..." }]}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </PageLayout>
    );
  }

  if (isError || !event || !event.isActive) {
    return (
      <PageLayout
        title={pageData?.notFoundTitle || "Evento não encontrado"}
        subtitle={pageData?.subtitle || "Eventos"}
        icon={<CalendarDays className="w-8 h-8 text-primary" />}
        breadcrumbs={[
          { labelKey: "nav.media", href: "/media" },
          { label: pageData?.subtitle || "Eventos", href: "/media" },
          { label: pageData?.notFoundTitle || "Evento não encontrado" },
        ]}
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {pageData?.notFoundHeading || "O evento que procura não foi encontrado"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {pageData?.notFoundMessage || "Verifique o endereço ou navegue pelos nossos eventos."}
          </p>
          <Button onClick={() => navigate("/media")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {pageData?.backButton || "Voltar aos Eventos"}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const statusLabels = {
    upcoming: pageData?.statusUpcoming,
    ongoing: pageData?.statusOngoing,
    finished: pageData?.statusFinished,
  };
  const eventStatus = getEventStatus(event.rawStartDate, event.rawEndDate, statusLabels);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = event.title;

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <PageLayout
      title={event.title}
      subtitle={pageData?.subtitle || "Eventos"}
      backgroundImage={event.image}
      icon={<CalendarDays className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.media", href: "/media" },
        { label: pageData?.subtitle || "Eventos", href: "/media" },
        { label: event.title },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <SectionTransition>
          <Button
            variant="ghost"
            onClick={() => navigate("/media")}
            className="mb-8 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {pageData?.backButton || "Voltar aos Eventos"}
          </Button>
        </SectionTransition>

        <SectionTransition delay={0.1}>
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {event.categoryName !== "Sem categoria" && (
                <Badge variant="secondary">
                  {event.categoryName}
                </Badge>
              )}
              <Badge className={cn(eventStatus.color)}>
                {eventStatus.label}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {event.formattedStartDate}
                {event.formattedStartDate !== event.formattedEndDate && (
                  <> até {event.formattedEndDate}</>
                )}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            </div>
          </div>
        </SectionTransition>

        <SectionTransition delay={0.2}>
          <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-auto object-cover"
              onError={(e) => { e.currentTarget.src = '/placeholder-event.jpg'; }}
            />
          </div>
        </SectionTransition>

        <SectionTransition delay={0.3}>
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-li:text-muted-foreground">
            {event.description && (
              <div className="text-lg text-foreground font-medium mb-6 leading-relaxed">
                {event.description}
              </div>
            )}
            
            <div className="article-content" dangerouslySetInnerHTML={{ __html: event.body }} />
          </article>
        </SectionTransition>

        {(event.registrationUrl || event.mapUrl) && (
          <SectionTransition delay={0.4}>
            <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-border">
              {event.registrationUrl && (
                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    {pageData?.registerButton || "Registar-se"} <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
              {event.mapUrl && (
                <a href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    {pageData?.mapButton || "Ver no mapa"} <MapPin className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </SectionTransition>
        )}

        <SectionTransition delay={0.5}>
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{pageData?.shareLabel || "Partilhar:"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleShare('facebook')} className="rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleShare('twitter')} className="rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')} className="rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </SectionTransition>
      </div>

      {relatedEvents.length > 0 && (
        <SectionTransition delay={0.6}>
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.relatedTitle || "Eventos Relacionados"}</h2>
            
            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {relatedEvents.map((item) => (
                <StaggerItem key={item.id}>
                  <Link to={`/events/${item.id}`} className="group block h-full">
                    <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                      <div className="aspect-video overflow-hidden relative">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.src = '/placeholder-event.jpg'; }}
                        />
                        <Badge className={cn("absolute top-3 right-3", item.status.color)}>
                          {item.status.label}
                        </Badge>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="space-y-2 mt-auto pt-3 border-t border-border">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {item.formattedStartDate}
                              {item.formattedStartDate !== item.formattedEndDate && ` - ${item.formattedEndDate}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{item.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
            
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg" onClick={() => navigate("/media")}>
                {pageData?.viewAllButton || "Ver Todos os Eventos"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </SectionTransition>
      )}
    </PageLayout>
  );
}