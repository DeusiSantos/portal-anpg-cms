import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ChevronRight, CalendarDays, Search, X, Filter, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import api from "@/service/api";
import { getFullImageUrl } from "@/service/api";

// Tipos da API
type EventStatus = 1 | 2 | 3;

interface EventCategoryContent {
  lang: number;
  name: string;
  description: string;
}

interface EventCategory {
  id: string;
  slug: string;
  displayOrder: number;
  contents: EventCategoryContent[];
  isActive: boolean;
}

interface EventContent {
  lang: number;
  title: string;
  description: string;
  body: string;
}

interface EventItem {
  id: string;
  slug: string;
  startAt: string;
  endAt: string;
  location: string;
  mapUrl: string;
  registrationUrl: string;
  featuredImageUrl: string | null;
  featuredImagePath: string | null;
  categoryId: string;
  status: EventStatus;
  contents: EventContent[];
  isActive: boolean;
  createdAt: string;
}

interface EventsResponse {
  items: EventItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Função para obter conteúdo por idioma
const getContentByLang = (contents: EventContent[], lang: number): EventContent | undefined => {
  return contents?.find(c => c.lang === lang);
};

// Função para verificar se a data está dentro do intervalo
const isWithinDateRange = (dateString: string, filter: string): boolean => {
  if (filter === "all") return true;
  
  const eventDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - eventDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  switch (filter) {
    case "week": return diffDays <= 7;
    case "month": return diffDays <= 30;
    case "quarter": return diffDays <= 90;
    case "year": return diffDays <= 365;
    default: return true;
  }
};

const EVENTS_PER_PAGE = 6;

// Opções de filtro
const dateFilters = [
  { key: "all", label: "Todos os períodos" },
  { key: "week", label: "Última semana" },
  { key: "month", label: "Último mês" },
  { key: "quarter", label: "Último trimestre" },
  { key: "year", label: "Último ano" },
];

const sortOptions = [
  { key: "newest", label: "Mais recentes primeiro" },
  { key: "oldest", label: "Mais antigos primeiro" },
];

const statusOptions = [
  { key: "all", label: "Todos os eventos" },
  { key: "upcoming", label: "Próximos eventos" },
  { key: "past", label: "Eventos passados" },
];

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const lang = isEn ? 2 : 1;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState("all");

  // Buscar eventos da API
  const { data: eventsData, isLoading, isError } = useQuery({
    queryKey: ['events-public', currentPage, searchQuery, dateFilter, sortOrder, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: currentPage,
        pageSize: EVENTS_PER_PAGE,
        status: 2, // Apenas publicados
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await api.get<EventsResponse>('/events', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const events = eventsData?.items || [];
  const totalCount = eventsData?.totalCount || 0;
  const totalPages = eventsData?.totalPages || 1;

  // Filtrar e ordenar eventos localmente
  const filteredEvents = useMemo(() => {
    let results = [...events];
    
    // Filtro por data
    if (dateFilter !== "all") {
      results = results.filter(event => isWithinDateRange(event.startAt, dateFilter));
    }
    
    // Filtro por status (próximos vs passados)
    if (statusFilter !== "all") {
      const now = new Date();
      results = results.filter(event => {
        const eventDate = new Date(event.startAt);
        if (statusFilter === "upcoming") {
          return eventDate >= now;
        } else if (statusFilter === "past") {
          return eventDate < now;
        }
        return true;
      });
    }
    
    // Ordenar
    results.sort((a, b) => {
      const dateA = new Date(a.startAt);
      const dateB = new Date(b.startAt);
      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    
    return results;
  }, [events, dateFilter, statusFilter, sortOrder]);

  // Paginação
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  const hasActiveFilters = searchQuery || dateFilter !== "all" || statusFilter !== "all" || sortOrder !== "newest";

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value as "newest" | "oldest");
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setStatusFilter("all");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const formatDateEn = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date not available';
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
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
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (isError) {
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
        <div className="text-center py-20 text-red-500">
          Erro ao carregar eventos. Tente novamente mais tarde.
        </div>
      </PageLayout>
    );
  }

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
        {/* Search and Filters */}
        <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={isEn ? "Search events..." : "Pesquisar eventos..."}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={isEn ? "Status" : "Estado"} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full lg:w-48">
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="bg-background">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={isEn ? "Date filter" : "Filtrar por data"} />
                </SelectTrigger>
                <SelectContent>
                  {dateFilters.map((filter) => (
                    <SelectItem key={filter.key} value={filter.key}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full lg:w-48">
              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={isEn ? "Sort by" : "Ordenar por"} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                {isEn ? "Clear" : "Limpar"}
              </Button>
            )}
          </div>
          
          {hasActiveFilters && (
            <p className="text-sm text-muted-foreground mt-4">
              {filteredEvents.length === 0 
                ? (isEn ? "No events found" : "Nenhum evento encontrado")
                : `${filteredEvents.length} ${filteredEvents.length === 1 
                    ? (isEn ? "event found" : "evento encontrado") 
                    : (isEn ? "events found" : "eventos encontrados")}`
              }
            </p>
          )}
        </div>

        {/* Events Grid */}
        {paginatedEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isEn ? "No events available at the moment." : "Sem eventos disponíveis no momento."}
          </div>
        ) : (
          <StaggerContainer className="grid gap-6">
            {paginatedEvents.map((event) => {
              const content = getContentByLang(event.contents, lang);
              const imageUrl = event.featuredImageUrl ? getFullImageUrl(event.featuredImageUrl) : null;
              const upcoming = isUpcoming(event.startAt);
              
              return (
                <StaggerItem key={event.id}>
                  <Link
                    to={`/events/${event.slug}`}
                    className="group block bg-secondary/30 border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      {imageUrl && (
                        <div className="md:w-72 h-48 md:h-auto flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={content?.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge variant={upcoming ? "default" : "secondary"} className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {isEn ? formatDateEn(event.startAt) : formatDate(event.startAt)}
                          </Badge>
                          {upcoming && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                              {isEn ? "Upcoming" : "Próximo"}
                            </Badge>
                          )}
                          {event.location && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                          {content?.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {content?.description}
                        </p>
                        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          {isEn ? "View details" : "Ver detalhes"}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page as number)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </SectionTransition>
    </PageLayout>
  );
}