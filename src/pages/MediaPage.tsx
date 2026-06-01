import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper, Calendar, ExternalLink, FileText, Video, Scissors,
  CalendarDays, Filter, Search, X, ArrowUpDown, ArrowUp, ArrowDown,
  Loader2, MapPin, Clock, Download, Youtube, Film
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePageData } from "@/hooks/pages/usePageData";
import { useApiNews, FormattedNewsItem } from "@/hooks/useApiNews";
import { useApiEvents, useEventCategories, FormattedEvent } from "@/hooks/useApiEvents";
import { useApiPublications, FormattedPublication } from "@/hooks/useApiPublications";
import { useApiPress, FormattedPress } from "@/hooks/useApiPress";
import { FormattedVideo, useApiVideos } from "@/hooks/useApiVideos";

const getCategoryLabel = (category: string): string => {
  const categories: Record<string, string> = {
    geral: "Geral", producao: "Produção", exploracao: "Exploração",
    licitacao: "Licitação", institucional: "Institucional", sustentabilidade: "Sustentabilidade",
  };
  return categories[category] || category;
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    geral: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    producao: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    exploracao: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    licitacao: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    institucional: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    sustentabilidade: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  };
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

const getEventStatus = (startAt: string, endAt: string): { label: string; color: string } => {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (now < start) return { label: "Em breve", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
  if (now >= start && now <= end) return { label: "A decorrer", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
  return { label: "Finalizado", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
};

const NEWS_PER_PAGE = 6;
const EVENTS_PER_PAGE = 6;
const PUBLICATIONS_PER_PAGE = 6;
const VIDEOS_PER_PAGE = 6;
const PRESS_PER_PAGE = 6;

const isWithinDateRange = (dateString: string, filter: string): boolean => {
  if (filter === "all") return true;
  const diffDays = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24);
  switch (filter) {
    case "week": return diffDays <= 7;
    case "month": return diffDays <= 30;
    case "quarter": return diffDays <= 90;
    case "year": return diffDays <= 365;
    default: return true;
  }
};

const filterEventsByDate = (events: FormattedEvent[], filter: string): FormattedEvent[] => {
  if (filter === "all") return events;
  const now = new Date();
  if (filter === "upcoming") return events.filter(e => new Date(e.rawEndDate) >= now);
  if (filter === "past") return events.filter(e => new Date(e.rawEndDate) < now);
  return events;
};

const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return url;
};

const getPageNumbers = (totalPages: number, currentPage: number): (number | 'ellipsis')[] => {
  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
  }
  return pages;
};

export default function MediaPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { data: pageData, isLoading: pageLoading } = usePageData("media");

  // Estados News
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Estados Events
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventDateFilter, setEventDateFilter] = useState("all");
  const [eventSortOrder, setEventSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedEventCategory, setSelectedEventCategory] = useState("all");

  // Estados Publications
  const [pubCurrentPage, setPubCurrentPage] = useState(1);
  const [pubSearchQuery, setPubSearchQuery] = useState("");
  const [pubYearFilter, setPubYearFilter] = useState("all");
  const [pubSortOrder, setPubSortOrder] = useState<"newest" | "oldest">("newest");

  // Estados Videos
  const [vidCurrentPage, setVidCurrentPage] = useState(1);
  const [vidSearchQuery, setVidSearchQuery] = useState("");
  const [vidSortOrder, setVidSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedVideo, setSelectedVideo] = useState<FormattedVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Estados Press
  const [pressCurrentPage, setPressCurrentPage] = useState(1);
  const [pressSearchQuery, setPressSearchQuery] = useState("");
  const [pressSortOrder, setPressSortOrder] = useState<"newest" | "oldest">("newest");

  // API
  const { data: apiNewsData, isLoading: isLoadingNews } = useApiNews(1, 100, 2);
  const { data: apiEvents, isLoading: isLoadingEvents } = useApiEvents(1, 100, 2);
  const { data: eventCategories, isLoading: isLoadingCategories } = useEventCategories();
  const { data: publications, isLoading: isLoadingPubs } = useApiPublications(2);
  const { data: videos, isLoading: isLoadingVids } = useApiVideos(isEn);
  const { data: pressItems, isLoading: isLoadingPress } = useApiPress(2);

  const newsSource: FormattedNewsItem[] = useMemo(() => apiNewsData?.news || [], [apiNewsData]);
  const events: FormattedEvent[] = useMemo(() => apiEvents || [], [apiEvents]);

  // Handlers vídeo modal
  const handleVideoClick = (video: FormattedVideo) => { setSelectedVideo(video); setIsVideoModalOpen(true); };
  const handleCloseModal = () => { setIsVideoModalOpen(false); setSelectedVideo(null); };

  // Filtros
  const filteredNews = useMemo(() => {
    let results = [...newsSource];
    if (selectedCategory !== "all") results = results.filter(i => i.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(i => i.title.toLowerCase().includes(q) || i.excerpt.toLowerCase().includes(q));
    }
    if (dateFilter !== "all") results = results.filter(i => isWithinDateRange(i.rawDate, dateFilter));
    results.sort((a, b) => {
      const diff = new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
    return results;
  }, [newsSource, selectedCategory, searchQuery, dateFilter, sortOrder]);

  const filteredEvents = useMemo(() => {
    let results = [...events];
    if (selectedEventCategory !== "all") results = results.filter(i => i.categoryId === selectedEventCategory);
    if (eventSearchQuery.trim()) {
      const q = eventSearchQuery.toLowerCase();
      results = results.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
    }
    results = filterEventsByDate(results, eventDateFilter);
    results.sort((a, b) => {
      const diff = new Date(b.rawStartDate).getTime() - new Date(a.rawStartDate).getTime();
      return eventSortOrder === "newest" ? diff : -diff;
    });
    return results;
  }, [events, selectedEventCategory, eventSearchQuery, eventDateFilter, eventSortOrder]);

  const filteredPublications = useMemo(() => {
    if (!publications) return [];
    let results = [...publications];
    if (pubSearchQuery.trim()) {
      const q = pubSearchQuery.toLowerCase();
      results = results.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.author.toLowerCase().includes(q));
    }
    if (pubYearFilter !== "all") results = results.filter(i => String(i.year) === pubYearFilter);
    results.sort((a, b) => pubSortOrder === "newest" ? b.year - a.year : a.year - b.year);
    return results;
  }, [publications, pubSearchQuery, pubYearFilter, pubSortOrder]);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    let results = [...videos];
    if (vidSearchQuery.trim()) {
      const q = vidSearchQuery.toLowerCase();
      results = results.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    results.sort((a, b) => {
      const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return vidSortOrder === "newest" ? diff : -diff;
    });
    return results;
  }, [videos, vidSearchQuery, vidSortOrder]);

  const filteredPress = useMemo(() => {
    if (!pressItems) return [];
    let results = [...pressItems];
    if (pressSearchQuery.trim()) {
      const q = pressSearchQuery.toLowerCase();
      results = results.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q) || i.source.toLowerCase().includes(q));
    }
    results.sort((a, b) => {
      const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return pressSortOrder === "newest" ? diff : -diff;
    });
    return results;
  }, [pressItems, pressSearchQuery, pressSortOrder]);

  // Paginação
  const totalNewsPages = Math.max(1, Math.ceil(filteredNews.length / NEWS_PER_PAGE));
  const paginatedNews = filteredNews.slice((currentPage - 1) * NEWS_PER_PAGE, currentPage * NEWS_PER_PAGE);

  const totalEventPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const paginatedEvents = filteredEvents.slice((eventCurrentPage - 1) * EVENTS_PER_PAGE, eventCurrentPage * EVENTS_PER_PAGE);

  const totalPubPages = Math.max(1, Math.ceil(filteredPublications.length / PUBLICATIONS_PER_PAGE));
  const paginatedPublications = filteredPublications.slice((pubCurrentPage - 1) * PUBLICATIONS_PER_PAGE, pubCurrentPage * PUBLICATIONS_PER_PAGE);

  const totalVidPages = Math.max(1, Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE));
  const paginatedVideos = filteredVideos.slice((vidCurrentPage - 1) * VIDEOS_PER_PAGE, vidCurrentPage * VIDEOS_PER_PAGE);

  const totalPressPages = Math.max(1, Math.ceil(filteredPress.length / PRESS_PER_PAGE));
  const paginatedPress = filteredPress.slice((pressCurrentPage - 1) * PRESS_PER_PAGE, pressCurrentPage * PRESS_PER_PAGE);

  // Handlers News
  const handleCategoryChange = (v: string) => { setSelectedCategory(v); setCurrentPage(1); };
  const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
  const handleDateFilterChange = (v: string) => { setDateFilter(v); setCurrentPage(1); };
  const handleSortChange = (v: string) => { setSortOrder(v as "newest" | "oldest"); setCurrentPage(1); };
  const clearFilters = () => { setSearchQuery(""); setSelectedCategory("all"); setDateFilter("all"); setSortOrder("newest"); setCurrentPage(1); };

  // Handlers Events
  const handleEventCategoryChange = (v: string) => { setSelectedEventCategory(v); setEventCurrentPage(1); };
  const handleEventSearchChange = (v: string) => { setEventSearchQuery(v); setEventCurrentPage(1); };
  const handleEventDateFilterChange = (v: string) => { setEventDateFilter(v); setEventCurrentPage(1); };
  const handleEventSortChange = (v: string) => { setEventSortOrder(v as "newest" | "oldest"); setEventCurrentPage(1); };
  const clearEventFilters = () => { setEventSearchQuery(""); setSelectedEventCategory("all"); setEventDateFilter("all"); setEventSortOrder("newest"); setEventCurrentPage(1); };

  // Handlers Publications
  const handlePubSearchChange = (v: string) => { setPubSearchQuery(v); setPubCurrentPage(1); };
  const handlePubYearFilterChange = (v: string) => { setPubYearFilter(v); setPubCurrentPage(1); };
  const handlePubSortChange = (v: string) => { setPubSortOrder(v as "newest" | "oldest"); setPubCurrentPage(1); };
  const clearPubFilters = () => { setPubSearchQuery(""); setPubYearFilter("all"); setPubSortOrder("newest"); setPubCurrentPage(1); };

  // Handlers Videos
  const handleVidSearchChange = (v: string) => { setVidSearchQuery(v); setVidCurrentPage(1); };
  const handleVidSortChange = (v: string) => { setVidSortOrder(v as "newest" | "oldest"); setVidCurrentPage(1); };
  const clearVidFilters = () => { setVidSearchQuery(""); setVidSortOrder("newest"); setVidCurrentPage(1); };

  // Handlers Press
  const handlePressSearchChange = (v: string) => { setPressSearchQuery(v); setPressCurrentPage(1); };
  const handlePressSortChange = (v: string) => { setPressSortOrder(v as "newest" | "oldest"); setPressCurrentPage(1); };
  const clearPressFilters = () => { setPressSearchQuery(""); setPressSortOrder("newest"); setPressCurrentPage(1); };

  const availableYears = useMemo(() => {
    if (!publications) return [];
    return [...new Set(publications.map(p => p.year))].sort((a, b) => b - a);
  }, [publications]);

  const eventCategoryOptions = useMemo(() => {
    const options = [{ key: "all", label: isEn ? "All categories" : (pageData?.allEventCategories || "Todas as categorias") }];
    if (eventCategories) eventCategories.forEach(cat => options.push({ key: cat.id, label: cat.name }));
    return options;
  }, [eventCategories, isEn, pageData]);

  const dateFilters = [
    { key: "all", label: pageData?.dateFilters?.all || "Todas as datas" },
    { key: "week", label: pageData?.dateFilters?.week || "Última semana" },
    { key: "month", label: pageData?.dateFilters?.month || "Último mês" },
    { key: "quarter", label: pageData?.dateFilters?.quarter || "Últimos 3 meses" },
    { key: "year", label: pageData?.dateFilters?.year || "Último ano" },
  ];

  const sortOptions = [
    { key: "newest", label: pageData?.sort?.newest || "Mais recentes", icon: ArrowDown },
    { key: "oldest", label: pageData?.sort?.oldest || "Mais antigas", icon: ArrowUp },
  ];

  const newsCategories = [
    { key: "all", label: pageData?.categories?.all || "Todas" },
    { key: "geral", label: "Geral" },
    { key: "producao", label: "Produção" },
    { key: "exploracao", label: "Exploração" },
    { key: "licitacao", label: "Licitação" },
    { key: "institucional", label: "Institucional" },
    { key: "sustentabilidade", label: "Sustentabilidade" },
  ];

  const yearOptions = useMemo(() => {
    const options = [{ key: "all", label: pageData?.allYears || "Todos os anos" }];
    availableYears.forEach(y => options.push({ key: String(y), label: String(y) }));
    return options;
  }, [availableYears, pageData]);

  const isLoading = pageLoading || isLoadingNews || isLoadingEvents || isLoadingCategories || isLoadingPubs || isLoadingVids || isLoadingPress;

  if (isLoading) {
    return (
      <PageLayout
        pageKey="media"
        title={pageData?.title}
        subtitle={pageData?.subtitle}
        description={pageData?.description}
        icon={<Newspaper className="w-8 h-8 text-primary" />}
        breadcrumbs={[{ labelKey: "nav.media", href: "/media" }, { label: "Imprensa" }]}
      >
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      pageKey="media"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Newspaper className="w-8 h-8 text-primary" />}
      breadcrumbs={[{ labelKey: "nav.media", href: "/media" }, { label: "Imprensa" }]}
    >
      <Tabs defaultValue="news" className="w-full">
        <SectionTransition>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0 mb-8">
            <TabsTrigger value="news" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3">
              <Newspaper className="w-4 h-4 mr-2" />{pageData?.tabs?.news || "Notícias"}
            </TabsTrigger>
            <TabsTrigger value="publications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3">
              <FileText className="w-4 h-4 mr-2" />{pageData?.tabs?.publications || "Publicações"}
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3">
              <Video className="w-4 h-4 mr-2" />{pageData?.tabs?.videos || "Vídeos"}
            </TabsTrigger>
            <TabsTrigger value="press" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3">
              <Scissors className="w-4 h-4 mr-2" />{pageData?.tabs?.press || "Recortes"}
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3">
              <CalendarDays className="w-4 h-4 mr-2" />{pageData?.tabs?.events || "Eventos"}
            </TabsTrigger>
          </TabsList>
        </SectionTransition>

        {/* ── NEWS ── */}
        <TabsContent value="news">
          <SectionTransition delay={0.1}>
            <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={pageData?.search || "Pesquisar notícias..."} value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="pl-10 bg-background" />
                </div>
                <div className="w-full lg:w-56">
                  <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger className="bg-background"><Calendar className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{dateFilters.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="w-full lg:w-48">
                  <Select value={sortOrder} onValueChange={handleSortChange}>
                    <SelectTrigger className="bg-background"><ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{sortOptions.map(o => <SelectItem key={o.key} value={o.key}><span className="flex items-center gap-2"><o.icon className="w-3 h-3" />{o.label}</span></SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(searchQuery || selectedCategory !== "all" || dateFilter !== "all" || sortOrder !== "newest") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-4 h-4 mr-1" />{pageData?.clear || "Limpar"}</Button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {newsCategories.map(c => (
                  <Button key={c.key} variant={selectedCategory === c.key ? "default" : "outline"} size="sm" onClick={() => handleCategoryChange(c.key)} className={cn("rounded-full", selectedCategory === c.key && "bg-primary text-primary-foreground")}>{c.label}</Button>
                ))}
              </div>
            </div>
            {paginatedNews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{pageData?.noResults || "Nenhuma notícia encontrada"}</div>
            ) : (
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedNews.map(news => (
                  <StaggerItem key={news.id}>
                    <Link to={`/news/${news.id}`} className="group block h-full">
                      <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                        <div className="aspect-video overflow-hidden">
                          <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }} />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <Badge className={cn("w-fit mb-3", getCategoryColor(news.category))}>{getCategoryLabel(news.category)}</Badge>
                          <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{news.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{news.excerpt}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto pt-3 border-t border-border"><Calendar className="w-4 h-4" />{news.date}</div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
            {totalNewsPages > 1 && (
              <div className="mt-8">
                <Pagination><PaginationContent>
                  <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={cn(currentPage === 1 && "pointer-events-none opacity-50")} /></PaginationItem>
                  {getPageNumbers(totalNewsPages, currentPage).map((page, i) => (
                    <PaginationItem key={i}>{page === 'ellipsis' ? <PaginationEllipsis /> : <PaginationLink onClick={() => setCurrentPage(page as number)} isActive={currentPage === page}>{page}</PaginationLink>}</PaginationItem>
                  ))}
                  <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalNewsPages, p + 1))} className={cn(currentPage === totalNewsPages && "pointer-events-none opacity-50")} /></PaginationItem>
                </PaginationContent></Pagination>
              </div>
            )}
          </SectionTransition>
        </TabsContent>

        {/* ── PUBLICATIONS ── */}
        <TabsContent value="publications">
          <SectionTransition delay={0.1}>
            <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={pageData?.searchPublications || "Pesquisar publicações..."} value={pubSearchQuery} onChange={(e) => handlePubSearchChange(e.target.value)} className="pl-10 bg-background" />
                </div>
                <div className="w-full lg:w-48">
                  <Select value={pubYearFilter} onValueChange={handlePubYearFilterChange}>
                    <SelectTrigger className="bg-background"><Calendar className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{yearOptions.map(o => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="w-full lg:w-48">
                  <Select value={pubSortOrder} onValueChange={handlePubSortChange}>
                    <SelectTrigger className="bg-background"><ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{sortOptions.map(o => <SelectItem key={o.key} value={o.key}><span className="flex items-center gap-2"><o.icon className="w-3 h-3" />{o.label}</span></SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(pubSearchQuery || pubYearFilter !== "all" || pubSortOrder !== "newest") && (
                  <Button variant="ghost" size="sm" onClick={clearPubFilters}><X className="w-4 h-4 mr-1" />{pageData?.clearFilters || "Limpar filtros"}</Button>
                )}
              </div>
            </div>
            {paginatedPublications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{pageData?.empty?.publications || "Nenhuma publicação disponível."}</div>
            ) : (
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPublications.map(pub => (
                  <StaggerItem key={pub.id}>
                    <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img src={pub.coverImage} alt={pub.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-publication.jpg'; }} />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <Badge className="w-fit mb-2 bg-primary/10 text-primary">{pub.year}</Badge>
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2">{pub.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{pub.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">{pub.author && `${pageData?.byAuthor || "Por "}${pub.author}`}</span>
                          {pub.fileUrl
                            ? <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm"><Download className="w-4 h-4" />{pageData?.downloadLabel || "Download"}</a>
                            : <span className="text-xs text-muted-foreground">{pageData?.noPdf || "Sem PDF"}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
            {totalPubPages > 1 && (
              <div className="mt-8">
                <Pagination><PaginationContent>
                  <PaginationItem><PaginationPrevious onClick={() => setPubCurrentPage(p => Math.max(1, p - 1))} className={cn(pubCurrentPage === 1 && "pointer-events-none opacity-50")} /></PaginationItem>
                  {getPageNumbers(totalPubPages, pubCurrentPage).map((page, i) => (
                    <PaginationItem key={i}>{page === 'ellipsis' ? <PaginationEllipsis /> : <PaginationLink onClick={() => setPubCurrentPage(page as number)} isActive={pubCurrentPage === page}>{page}</PaginationLink>}</PaginationItem>
                  ))}
                  <PaginationItem><PaginationNext onClick={() => setPubCurrentPage(p => Math.min(totalPubPages, p + 1))} className={cn(pubCurrentPage === totalPubPages && "pointer-events-none opacity-50")} /></PaginationItem>
                </PaginationContent></Pagination>
              </div>
            )}
          </SectionTransition>
        </TabsContent>

        {/* ── VIDEOS ── */}
        <TabsContent value="videos">
          <SectionTransition delay={0.1}>
            <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={pageData?.searchVideos || "Pesquisar vídeos..."} value={vidSearchQuery} onChange={(e) => handleVidSearchChange(e.target.value)} className="pl-10 bg-background" />
                </div>
                <div className="w-full lg:w-48">
                  <Select value={vidSortOrder} onValueChange={handleVidSortChange}>
                    <SelectTrigger className="bg-background"><ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{sortOptions.map(o => <SelectItem key={o.key} value={o.key}><span className="flex items-center gap-2"><o.icon className="w-3 h-3" />{o.label}</span></SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(vidSearchQuery || vidSortOrder !== "newest") && (
                  <Button variant="ghost" size="sm" onClick={clearVidFilters}><X className="w-4 h-4 mr-1" />{pageData?.clearFilters || "Limpar filtros"}</Button>
                )}
              </div>
            </div>
            {paginatedVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{pageData?.empty?.videos || "Nenhum vídeo disponível."}</div>
            ) : (
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedVideos.map(video => (
                  <StaggerItem key={video.id}>
                    <div onClick={() => handleVideoClick(video)} className="group cursor-pointer bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                      <div className="aspect-video overflow-hidden relative bg-black/5">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = '/placeholder-video.jpg'; }} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-primary/90 backdrop-blur rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform">
                            <Youtube className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        {video.durationSeconds > 0 && (
                          <Badge className="absolute bottom-3 right-3 bg-black/70 text-white border-none flex items-center gap-1">
                            <Clock className="w-3 h-3" />{Math.floor(video.durationSeconds / 60)}:{String(video.durationSeconds % 60).padStart(2, '0')}
                          </Badge>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{video.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Film className="w-3 h-3" />{(video as any).providerType === 1 ? 'YouTube' : 'Vídeo'}
                          </span>
                          <span className="text-xs text-muted-foreground">{video.formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
            {totalVidPages > 1 && (
              <div className="mt-8">
                <Pagination><PaginationContent>
                  <PaginationItem><PaginationPrevious onClick={() => setVidCurrentPage(p => Math.max(1, p - 1))} className={cn(vidCurrentPage === 1 && "pointer-events-none opacity-50")} /></PaginationItem>
                  {getPageNumbers(totalVidPages, vidCurrentPage).map((page, i) => (
                    <PaginationItem key={i}>{page === 'ellipsis' ? <PaginationEllipsis /> : <PaginationLink onClick={() => setVidCurrentPage(page as number)} isActive={vidCurrentPage === page}>{page}</PaginationLink>}</PaginationItem>
                  ))}
                  <PaginationItem><PaginationNext onClick={() => setVidCurrentPage(p => Math.min(totalVidPages, p + 1))} className={cn(vidCurrentPage === totalVidPages && "pointer-events-none opacity-50")} /></PaginationItem>
                </PaginationContent></Pagination>
              </div>
            )}
          </SectionTransition>
        </TabsContent>

        {/* ── PRESS ── */}
        <TabsContent value="press">
          <SectionTransition delay={0.1}>
            <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={pageData?.searchPress || "Pesquisar recortes..."} value={pressSearchQuery} onChange={(e) => handlePressSearchChange(e.target.value)} className="pl-10 bg-background" />
                </div>
                <div className="w-full lg:w-48">
                  <Select value={pressSortOrder} onValueChange={handlePressSortChange}>
                    <SelectTrigger className="bg-background"><ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{sortOptions.map(o => <SelectItem key={o.key} value={o.key}><span className="flex items-center gap-2"><o.icon className="w-3 h-3" />{o.label}</span></SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(pressSearchQuery || pressSortOrder !== "newest") && (
                  <Button variant="ghost" size="sm" onClick={clearPressFilters}><X className="w-4 h-4 mr-1" />{pageData?.clearFilters || "Limpar filtros"}</Button>
                )}
              </div>
            </div>
            {paginatedPress.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{pageData?.empty?.press || "Nenhum recorte de imprensa disponível."}</div>
            ) : (
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPress.map(press => (
                  <StaggerItem key={press.id}>
                    <a href={press.externalUrl || press.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="group block h-full">
                      <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                        <div className="aspect-video overflow-hidden relative">
                          <img src={press.thumbnail} alt={press.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = '/placeholder-press.jpg'; }} />
                          <div className="absolute top-3 right-3"><Badge variant="secondary" className="bg-black/70 text-white border-none">{press.source}</Badge></div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{press.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{press.summary}</p>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="w-3 h-3" />{pageData?.externalSource || "Fonte externa"}</span>
                            <span className="text-xs text-muted-foreground">{press.formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
            {totalPressPages > 1 && (
              <div className="mt-8">
                <Pagination><PaginationContent>
                  <PaginationItem><PaginationPrevious onClick={() => setPressCurrentPage(p => Math.max(1, p - 1))} className={cn(pressCurrentPage === 1 && "pointer-events-none opacity-50")} /></PaginationItem>
                  {getPageNumbers(totalPressPages, pressCurrentPage).map((page, i) => (
                    <PaginationItem key={i}>{page === 'ellipsis' ? <PaginationEllipsis /> : <PaginationLink onClick={() => setPressCurrentPage(page as number)} isActive={pressCurrentPage === page}>{page}</PaginationLink>}</PaginationItem>
                  ))}
                  <PaginationItem><PaginationNext onClick={() => setPressCurrentPage(p => Math.min(totalPressPages, p + 1))} className={cn(pressCurrentPage === totalPressPages && "pointer-events-none opacity-50")} /></PaginationItem>
                </PaginationContent></Pagination>
              </div>
            )}
          </SectionTransition>
        </TabsContent>

        {/* ── EVENTS ── */}
        <TabsContent value="events">
          <SectionTransition delay={0.1}>
            <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={pageData?.searchEvents || "Pesquisar eventos..."} value={eventSearchQuery} onChange={(e) => handleEventSearchChange(e.target.value)} className="pl-10 bg-background" />
                </div>
                <div className="w-full lg:w-56">
                  <Select value={eventDateFilter} onValueChange={handleEventDateFilterChange}>
                    <SelectTrigger className="bg-background"><Calendar className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{pageData?.eventPeriod?.all || "Todos os eventos"}</SelectItem>
                      <SelectItem value="upcoming">{pageData?.eventPeriod?.upcoming || "Próximos eventos"}</SelectItem>
                      <SelectItem value="past">{pageData?.eventPeriod?.past || "Eventos passados"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full lg:w-48">
                  <Select value={eventSortOrder} onValueChange={handleEventSortChange}>
                    <SelectTrigger className="bg-background"><ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{sortOptions.map(o => <SelectItem key={o.key} value={o.key}><span className="flex items-center gap-2"><o.icon className="w-3 h-3" />{o.label}</span></SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(eventSearchQuery || selectedEventCategory !== "all" || eventDateFilter !== "all" || eventSortOrder !== "newest") && (
                  <Button variant="ghost" size="sm" onClick={clearEventFilters}><X className="w-4 h-4 mr-1" />{pageData?.clearFilters || "Limpar filtros"}</Button>
                )}
              </div>
              {eventCategories && eventCategories.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  {eventCategoryOptions.map(c => (
                    <Button key={c.key} variant={selectedEventCategory === c.key ? "default" : "outline"} size="sm" onClick={() => handleEventCategoryChange(c.key)} className={cn("rounded-full", selectedEventCategory === c.key && "bg-primary text-primary-foreground")}>{c.label}</Button>
                  ))}
                </div>
              )}
            </div>
            {paginatedEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{pageData?.empty?.events || "Nenhum evento disponível."}</div>
            ) : (
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEvents.map(event => {
                  const eventStatus = getEventStatus(event.rawStartDate, event.rawEndDate);
                  return (
                    <StaggerItem key={event.id}>
                      <Link to={`/events/${event.id}`} className="group block h-full">
                        <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                          <div className="aspect-video overflow-hidden relative">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = '/placeholder-event.jpg'; }} />
                            <Badge className={cn("absolute top-3 right-3", eventStatus.color)}>{eventStatus.label}</Badge>
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            {event.categoryName !== "Sem categoria" && <Badge variant="secondary" className="w-fit mb-2 text-xs">{event.categoryName}</Badge>}
                            <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{event.description}</p>
                            <div className="space-y-2 mt-auto pt-3 border-t border-border">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{event.formattedStartDate}{event.formattedStartDate !== event.formattedEndDate && ` - ${event.formattedEndDate}`}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 flex-shrink-0" /><span className="line-clamp-1">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
            {totalEventPages > 1 && (
              <div className="mt-8">
                <Pagination><PaginationContent>
                  <PaginationItem><PaginationPrevious onClick={() => setEventCurrentPage(p => Math.max(1, p - 1))} className={cn(eventCurrentPage === 1 && "pointer-events-none opacity-50")} /></PaginationItem>
                  {getPageNumbers(totalEventPages, eventCurrentPage).map((page, i) => (
                    <PaginationItem key={i}>{page === 'ellipsis' ? <PaginationEllipsis /> : <PaginationLink onClick={() => setEventCurrentPage(page as number)} isActive={eventCurrentPage === page}>{page}</PaginationLink>}</PaginationItem>
                  ))}
                  <PaginationItem><PaginationNext onClick={() => setEventCurrentPage(p => Math.min(totalEventPages, p + 1))} className={cn(eventCurrentPage === totalEventPages && "pointer-events-none opacity-50")} /></PaginationItem>
                </PaginationContent></Pagination>
              </div>
            )}
          </SectionTransition>
        </TabsContent>
      </Tabs>

      {/* ── VIDEO MODAL ── */}
      <Dialog open={isVideoModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden rounded-2xl bg-background">
          {selectedVideo && (
            <div className="relative">
              <DialogTitle className="sr-only">{selectedVideo.title}</DialogTitle>
              <DialogDescription className="sr-only">{selectedVideo.description}</DialogDescription>
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.embedUrl)}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{selectedVideo.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{selectedVideo.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{selectedVideo.formattedDate}</span>
                  {selectedVideo.durationSeconds > 0 && (
                    <span>Duração: {Math.floor(selectedVideo.durationSeconds / 60)}:{String(selectedVideo.durationSeconds % 60).padStart(2, '0')}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
