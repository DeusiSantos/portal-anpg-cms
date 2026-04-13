import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Newspaper, 
  Calendar, 
  ExternalLink, 
  FileText, 
  Video, 
  Scissors, 
  CalendarDays,
  Filter,
  ChevronRight,
  Play,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useNewsArticles, useMediaItems } from "@/hooks/useCMSData";
import { newsItems as fallbackNews, getCategoryLabel, getCategoryColor } from "@/data/newsData";

const NEWS_PER_PAGE = 6;

// Fallback data kept for offline resilience
const defaultPublications: Publication[] = [
  { id: "1", title: "Boletim N.º 44", image: "https://anpg.co.ao/wp-content/uploads/2025/08/44-741x1024.jpg", pdfUrl: "https://anpg.co.ao/wp-content/uploads/2025/08/0.ANPG_Newsletter_Primeiro_Oleo_Edicao44.pdf" },
  { id: "2", title: "Boletim N.º 43", image: "https://anpg.co.ao/wp-content/uploads/2025/08/43-741x1024.jpg", pdfUrl: "https://anpg.co.ao/wp-content/uploads/2025/08/0.ANPG_Newsletter_Primeiro_Oleo_Edicao43.pdf" },
  { id: "3", title: "Boletim N.º 42", image: "https://anpg.co.ao/wp-content/uploads/2025/08/42-741x1024.jpg", pdfUrl: "https://anpg.co.ao/wp-content/uploads/2025/08/0.ANPG_Newsletter_Primeiro_Oleo_Edicao_42.pdf" },
  { id: "4", title: "Boletim N.º 41", image: "https://anpg.co.ao/wp-content/uploads/2025/06/NL_41_cover_846x1169px-741x1024.jpg", pdfUrl: "https://anpg.co.ao/wp-content/uploads/2025/06/0.ANPG_Newsletter_Primeiro_Oleo_Edicao_41_Web.pdf" },
  { id: "5", title: "Boletim N.º 40", image: "https://anpg.co.ao/wp-content/uploads/2025/06/NL_40_cover_846x1169px-741x1024.jpg", pdfUrl: "https://anpg.co.ao/wp-content/uploads/2025/06/0.ANPG_Newsletter_Primeiro_Oleo_Edicao_40_Web.pdf" },
  { id: "6", title: "Boletim N.º 39", image: "https://anpg.co.ao/wp-content/uploads/2025/06/NL_39_cover_846x1169px-741x1024.jpg", pdfUrl: "https://anpg.co.ao/wp-content/uploads/2025/06/0.ANPG_Newsletter_Primeiro_Oleo_Edicao_39_web.pdf" },
];

const defaultPressClippings: PressClipping[] = [
  { id: "1", title: "Angola busca novos investidores para sector petrolífero", source: "Jornal de Angola", date: "20 de Janeiro, 2026", url: "#" },
  { id: "2", title: "ANPG lança concurso para novos blocos offshore", source: "Correio Kianda", date: "18 de Janeiro, 2026", url: "#" },
  { id: "3", title: "Produção de petróleo atinge novo recorde mensal", source: "Expansão", date: "15 de Janeiro, 2026", url: "#" },
  { id: "4", title: "Biocombustíveis: Angola prepara legislação pioneira", source: "Novo Jornal", date: "10 de Janeiro, 2026", url: "#" },
];

const defaultEvents: Event[] = [
  { id: "1", title: "1.ª MISSÃO EMPRESARIAL ANGOLA – CANADÁ", date: "Novembro, 2025", image: "", url: "#" },
  { id: "2", title: "CONFERÊNCIA DE DADOS E&P 2023", date: "Outubro, 2023", image: "", url: "/ep-data/conference-2023" },
  { id: "3", title: "ANGOLA OIL & GAS 2025", date: "Junho, 2025", image: "", url: "#" },
];

interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
}

const defaultVideos: VideoItem[] = [
  { id: "1", title: "Angola Oil & Gas 2024: Opening Remarks", description: "Cerimónia de abertura e discurso especial", youtubeUrl: "https://www.youtube.com/embed/6cs4tVX9siI" },
  { id: "2", title: "Angola Oil & Gas 2023 Highlights", description: "Destaques e vozes-chave do evento", youtubeUrl: "https://www.youtube.com/embed/izPuSt7wzJg" },
  { id: "3", title: "Conferência Angola Oil & Gas", description: "Cobertura do evento", youtubeUrl: "https://www.youtube.com/embed/LeSAb7xaT4U" },
  { id: "4", title: "Entrevistas Angola Oil & Gas", description: "Entrevistas com representantes do sector", youtubeUrl: "https://www.youtube.com/embed/m1rhQ6Xiwz4" },
];
const parsePortugueseDate = (dateStr: string): Date | null => {
  const months: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  };
  
  // Format: "26 de Janeiro, 2026" or "31 de Dezembro, 2025"
  const match = dateStr.toLowerCase().match(/(\d+)\s+de\s+(\w+),?\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const month = months[match[2]];
    const year = parseInt(match[3]);
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }
  return null;
};

const isWithinDateRange = (dateStr: string, filter: string): boolean => {
  if (filter === "all") return true;
  
  const newsDate = parsePortugueseDate(dateStr);
  if (!newsDate) return true; // If can't parse, include it
  
  const now = new Date();
  const diffMs = now.getTime() - newsDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  switch (filter) {
    case "week": return diffDays <= 7;
    case "month": return diffDays <= 30;
    case "quarter": return diffDays <= 90;
    case "year": return diffDays <= 365;
    default: return true;
  }
};

interface Publication {
  id: string;
  title: string;
  image: string;
  pdfUrl: string;
}

interface PressClipping {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  image: string;
  url: string;
}

// Old hardcoded arrays removed - data now comes from CMS

export default function MediaPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // CMS data
  const { data: cmsNews } = useNewsArticles();
  const { data: cmsPublications } = useMediaItems("publication");
  const { data: cmsPressClippings } = useMediaItems("press_clipping");
  const { data: cmsEvents } = useMediaItems("event");
  const { data: cmsVideos } = useMediaItems("video");

  const newsSource = cmsNews?.length ? cmsNews : fallbackNews;

  // Map CMS data to component format with fallbacks
  const publications: Publication[] = cmsPublications?.length
    ? cmsPublications.map(p => ({ id: p.id, title: p.title, image: p.image_url || "", pdfUrl: p.file_url || "" }))
    : defaultPublications;

  const pressClippings: PressClipping[] = cmsPressClippings?.length
    ? cmsPressClippings.map(c => ({ id: c.id, title: c.title, source: c.source || "", date: c.event_date || "", url: c.external_url || "#" }))
    : defaultPressClippings;

  const events: Event[] = cmsEvents?.length
    ? cmsEvents.map(e => ({ id: e.id, title: e.title, date: e.event_date || "", image: e.image_url || "", url: e.external_url || "#" }))
    : defaultEvents;

  const videos: VideoItem[] = cmsVideos?.length
    ? cmsVideos.map(v => ({ id: v.id, title: v.title, description: v.description || "", youtubeUrl: v.youtube_url || "" }))
    : defaultVideos;

  // Dynamic filter/sort options from i18n
  const dateFilters = [
    { key: "all", label: t("pages.media.dateFilters.all") },
    { key: "week", label: t("pages.media.dateFilters.week") },
    { key: "month", label: t("pages.media.dateFilters.month") },
    { key: "quarter", label: t("pages.media.dateFilters.quarter") },
    { key: "year", label: t("pages.media.dateFilters.year") },
  ];

  const sortOptions = [
    { key: "newest", label: t("pages.media.sort.newest"), icon: ArrowDown },
    { key: "oldest", label: t("pages.media.sort.oldest"), icon: ArrowUp },
  ];

  const newsCategories = [
    { key: "all", label: t("pages.media.categories.all") },
    { key: "press", label: t("pages.media.categories.press") },
    { key: "tender", label: t("pages.media.categories.tender") },
    { key: "highlight", label: t("pages.media.categories.highlight") },
    { key: "production", label: t("pages.media.categories.production") },
  ];

  const filteredNews = useMemo(() => {
    let results = [...newsSource];
    
    if (selectedCategory !== "all") {
      results = results.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    if (dateFilter !== "all") {
      results = results.filter(item => isWithinDateRange(item.date, dateFilter));
    }
    
    results.sort((a, b) => {
      const dateA = parsePortugueseDate(a.date);
      const dateB = parsePortugueseDate(b.date);
      if (!dateA || !dateB) return 0;
      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    
    return results;
  }, [selectedCategory, searchQuery, dateFilter, sortOrder, newsSource]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value as "newest" | "oldest");
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setDateFilter("all");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || dateFilter !== "all" || sortOrder !== "newest";

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil((filteredNews.length - 1) / NEWS_PER_PAGE)); // -1 for featured
  const featuredNews = filteredNews[0];
  const remainingNews = filteredNews.slice(1);
  const paginatedNews = remainingNews.slice(
    (currentPage - 1) * NEWS_PER_PAGE,
    currentPage * NEWS_PER_PAGE
  );

  // Generate page numbers to display
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

  return (
    <PageLayout
      pageKey="media"
      titleKey="pages.media.title"
      subtitleKey="pages.media.subtitle"
      descriptionKey="pages.media.description"
      
      icon={<Newspaper className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.media", href: "/media" },
        { label: "Imprensa" },
      ]}
    >
      <Tabs defaultValue="news" className="w-full">
        <SectionTransition>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0 mb-8">
            <TabsTrigger 
              value="news" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3"
            >
              <Newspaper className="w-4 h-4 mr-2" />
              {t("pages.media.tabs.news")}
            </TabsTrigger>
            <TabsTrigger 
              value="publications"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t("pages.media.tabs.publications")}
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3"
            >
              <Video className="w-4 h-4 mr-2" />
              {t("pages.media.tabs.videos")}
            </TabsTrigger>
            <TabsTrigger 
              value="press"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3"
            >
              <Scissors className="w-4 h-4 mr-2" />
              {t("pages.media.tabs.press")}
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50 border border-border rounded-lg py-3"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              {t("pages.media.tabs.events")}
            </TabsTrigger>
          </TabsList>
        </SectionTransition>

        {/* News Tab */}
        <TabsContent value="news">
          <SectionTransition delay={0.1}>
            {/* Search and Filters */}
            <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("pages.media.search")}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                
                {/* Date Filter */}
                <div className="w-full lg:w-56">
                  <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger className="bg-background">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Filtrar por data" />
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
                
                {/* Sort Order */}
                <div className="w-full lg:w-48">
                  <Select value={sortOrder} onValueChange={handleSortChange}>
                    <SelectTrigger className="bg-background">
                      <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          <span className="flex items-center gap-2">
                            <option.icon className="w-3 h-3" />
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t("pages.media.clear")}
                  </Button>
                )}
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {newsCategories.map((category) => (
                  <Button
                    key={category.key}
                    variant={selectedCategory === category.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category.key)}
                    className={cn(
                      "rounded-full",
                      selectedCategory === category.key && "bg-primary text-primary-foreground"
                    )}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Results count */}
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground mb-6">
                {filteredNews.length === 0 
                  ? t("pages.media.noResults")
                  : t("pages.media.resultsCount", { count: filteredNews.length })
                }
              </p>
            )}

            {/* Featured News */}
            {featuredNews && currentPage === 1 && (
              <div className="mb-8">
                <Link 
                  to={`/news/${featuredNews.id}`}
                  className="group block"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="aspect-video md:aspect-auto md:h-full">
                        <img
                          src={featuredNews.image}
                          alt={featuredNews.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 md:p-8 flex flex-col justify-center">
                        <Badge className={cn("w-fit mb-4", getCategoryColor(featuredNews.category))}>
                          {getCategoryLabel(featuredNews.category)}
                        </Badge>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-3">
                          {featuredNews.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {featuredNews.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {featuredNews.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* News Grid */}
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedNews.map((news) => (
                <StaggerItem key={news.id}>
                  <Link 
                    to={`/news/${news.id}`}
                    className="group block h-full"
                  >
                    <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={news.image}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <Badge className={cn("w-fit mb-3", getCategoryColor(news.category))}>
                          {getCategoryLabel(news.category)}
                        </Badge>
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                          {news.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto pt-3 border-t border-border">
                          <Calendar className="w-4 h-4" />
                          {news.date}
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={cn(
                          "cursor-pointer",
                          currentPage === 1 && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={cn(
                          "cursor-pointer",
                          currentPage === totalPages && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {t("pages.media.pageInfo", { current: currentPage, total: totalPages, count: filteredNews.length })}
                </p>
              </div>
            )}
          </SectionTransition>
        </TabsContent>

        {/* Publications Tab */}
        <TabsContent value="publications">
          <SectionTransition delay={0.1}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("pages.media.publicationsTitle")}</h2>
              <p className="text-muted-foreground">
                {t("pages.media.publicationsDescription")}
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {publications.map((pub) => (
                <StaggerItem key={pub.id}>
                  <a
                    href={pub.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={pub.image}
                          alt={pub.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {pub.title}
                        </h3>
                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <FileText className="w-3 h-3" />
                          PDF
                        </span>
                      </div>
                    </div>
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                {t("pages.media.viewAllPublications")}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </SectionTransition>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos">
          <SectionTransition delay={0.1}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("pages.media.videosTitle")}</h2>
              <p className="text-muted-foreground">
                {t("pages.media.videosDescription")}
              </p>
            </div>

            <StaggerContainer className="grid md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <StaggerItem key={video.id}>
                  <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                    <div className="aspect-video">
                      <iframe
                        src={video.youtubeUrl}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className="mt-8 text-center">
              <a
                href="https://www.youtube.com/results?search_query=Angola+Oil+Gas+ANPG"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg">
                  {t("pages.media.viewMoreVideos")}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </SectionTransition>
        </TabsContent>

        {/* Press Clippings Tab */}
        <TabsContent value="press">
          <SectionTransition delay={0.1}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("pages.media.pressTitle")}</h2>
              <p className="text-muted-foreground">
                {t("pages.media.pressDescription")}
              </p>
            </div>

            <div className="space-y-4">
              {pressClippings.map((clipping) => (
                <a
                  key={clipping.id}
                  href={clipping.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="bg-secondary/50 border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {clipping.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">{clipping.source}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {clipping.date}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                {t("pages.media.viewMorePress")}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </SectionTransition>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <SectionTransition delay={0.1}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("pages.media.eventsTitle")}</h2>
              <p className="text-muted-foreground">
                {t("pages.media.eventsDescription")}
              </p>
            </div>

            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {events.map((event) => (
                <StaggerItem key={event.id}>
                  <a href={event.url} className="group block h-full">
                    <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full">
                      <div className="aspect-video overflow-hidden bg-muted flex items-center justify-center">
                        <CalendarDays className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                      </div>
                    </div>
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                {t("pages.media.viewAllEvents")}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </SectionTransition>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
