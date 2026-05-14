import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Search, 
  X, 
  Filter,
  ChevronRight,
  Tag,
  Clock,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  SlidersHorizontal,
  Archive
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useApiNews } from "@/hooks/useApiNews";
import { usePageData } from "@/hooks/pages/usePageData";
import { newsItems as fallbackNews, getCategoryLabel, getCategoryColor } from "@/data/newsData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 10;

const categories = [
  { key: "all", label: "Todas as categorias" },
  { key: "press", label: "Comunicados" },
  { key: "highlight", label: "Destaques" },
  { key: "tender", label: "Licitações" },
  { key: "production", label: "Produção" },
];

const dateFilters = [
  { key: "all", label: "Qualquer data" },
  { key: "week", label: "Última semana" },
  { key: "month", label: "Último mês" },
  { key: "quarter", label: "Últimos 3 meses" },
  { key: "year", label: "Último ano" },
];

const sortOptions = [
  { key: "newest", label: "Mais recentes", icon: ArrowDown },
  { key: "oldest", label: "Mais antigas", icon: ArrowUp },
  { key: "title", label: "Título (A-Z)", icon: ArrowUpDown },
];

// Get all unique tags from news items (computed from current source)
const allTags: string[] = [];

const parsePortugueseDate = (dateStr: string): Date | null => {
  const months: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  };
  
  const match = dateStr.match(/(\d+)\s+de\s+(\w+),?\s+(\d{4})/i);
  if (!match) return null;
  
  const day = parseInt(match[1]);
  const month = months[match[2].toLowerCase()];
  const year = parseInt(match[3]);
  
  if (month === undefined) return null;
  return new Date(year, month, day);
};

const isWithinDateRange = (dateStr: string, range: string): boolean => {
  if (range === "all") return true;
  
  const date = parsePortugueseDate(dateStr);
  if (!date) return true;
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  switch (range) {
    case "week": return diffDays <= 7;
    case "month": return diffDays <= 30;
    case "quarter": return diffDays <= 90;
    case "year": return diffDays <= 365;
    default: return true;
  }
};

export default function NewsArchivePage() {
  const { data: pageData } = usePageData("newsArchive");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title">("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "compact">("compact");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data: apiNews } = useApiNews();
  const newsItems = apiNews?.length ? apiNews : fallbackNews;

  const filteredNews = useMemo(() => {
    let results = [...newsItems];
    
    // Filter by category
    if (selectedCategory !== "all") {
      results = results.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by date range
    if (dateFilter !== "all") {
      results = results.filter(item => isWithinDateRange(item.date, dateFilter));
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      results = results.filter(item => 
        selectedTags.some(tag => item.tags?.includes(tag))
      );
    }
    
    // Sort
    results.sort((a, b) => {
      if (sortOrder === "title") {
        return a.title.localeCompare(b.title);
      }
      
      const dateA = parsePortugueseDate(a.date);
      const dateB = parsePortugueseDate(b.date);
      
      if (!dateA || !dateB) return 0;
      
      return sortOrder === "newest" 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    
    return results;
  }, [newsItems, selectedCategory, searchQuery, dateFilter, sortOrder, selectedTags]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setDateFilter("all");
    setSortOrder("newest");
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || dateFilter !== "all" || sortOrder !== "newest" || selectedTags.length > 0;

  const activeFilterCount = [
    searchQuery ? 1 : 0,
    selectedCategory !== "all" ? 1 : 0,
    dateFilter !== "all" ? 1 : 0,
    selectedTags.length,
  ].reduce((a, b) => a + b, 0);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "Media", href: "/media" },
    { label: "Arquivo" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <PageHero
        title={pageData?.title || "Arquivo de Notícias"}
        subtitle={pageData?.subtitle || "Pesquise e explore o arquivo completo de notícias e comunicados da ANPG"}
        icon={<Archive className="w-8 h-8" />}
      />

      <PageBreadcrumb items={breadcrumbs} />

      <main className="flex-1 bg-background">
        <SectionTransition>
          <section className="py-16">
            <div className="container mx-auto px-4">
          {/* Filters Header */}
          <div className="bg-card rounded-xl border shadow-sm mb-8">
            <div className="p-4 lg:p-6">
              {/* Main Filter Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={pageData?.searchPlaceholder || "Pesquisar no arquivo..."}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 bg-background h-11"
                  />
                </div>
                
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-3">
                  <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[180px] bg-background">
                      <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.key} value={cat.key}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[160px] bg-background">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Data" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFilters.map((df) => (
                        <SelectItem key={df.key} value={df.key}>
                          {df.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as typeof sortOrder); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[160px] bg-background">
                      <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          <span className="flex items-center gap-2">
                            <opt.icon className="w-3 h-3" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* View Toggle & Advanced */}
                <div className="flex gap-2">
                  <div className="flex border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "compact" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("compact")}
                      className="rounded-none"
                    >
                      <LayoutList className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-none"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {pageData?.filterLabel || "Filtros"}
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <CollapsibleContent>
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{pageData?.tagFilterLabel || "Filtrar por etiquetas:"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105",
                            selectedTags.includes(tag) && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Results Summary & Clear */}
            <div className="px-4 lg:px-6 py-3 bg-muted/50 border-t flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>
                  <strong className="text-foreground">{filteredNews.length}</strong>
                  {filteredNews.length === 1 ? ` ${pageData?.articleFound || "artigo encontrado"}` : ` ${pageData?.articlesFound || "artigos encontrados"}`}
                </span>
              </div>
              
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                  <X className="w-3 h-3" />
                  {pageData?.clearFilters || "Limpar filtros"}
                </Button>
              )}
            </div>
          </div>

          {/* News List */}
          {filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{pageData?.noResults || "Nenhum resultado encontrado"}</h3>
              <p className="text-muted-foreground mb-4">
                {pageData?.noResultsDesc || "Tente ajustar os filtros ou termos de pesquisa"}
              </p>
              <Button variant="outline" onClick={clearFilters}>
                {pageData?.clearFilters || "Limpar filtros"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    to={`/news/${news.id}`}
                    className={cn(
                      "group block bg-card border rounded-lg transition-all hover:shadow-md hover:border-primary/30",
                      viewMode === "compact" ? "p-4" : "p-5"
                    )}
                  >
                    <div className={cn(
                      "flex gap-4",
                      viewMode === "list" && "flex-col sm:flex-row"
                    )}>
                      {/* Thumbnail for list view */}
                      {viewMode === "list" && (
                        <div className="sm:w-32 sm:h-20 w-full h-40 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Category & Date */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getCategoryColor(news.category))}
                              >
                                {getCategoryLabel(news.category)}
                              </Badge>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {news.date}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className={cn(
                              "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2",
                              viewMode === "compact" ? "text-sm" : "text-base"
                            )}>
                              {news.title}
                            </h3>

                            {/* Excerpt for list view */}
                            {viewMode === "list" && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {news.excerpt}
                              </p>
                            )}

                            {/* Tags */}
                            {news.tags && news.tags.length > 0 && viewMode === "list" && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {news.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {news.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0">
                                    +{news.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
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
                  
                  {getPageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === "..." ? (
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
              
              <p className="text-center text-sm text-muted-foreground mt-3">
                {(pageData?.pageInfo || "Página {page} de {total} • {count} artigos")
                  .replace("{page}", String(currentPage))
                  .replace("{total}", String(totalPages))
                  .replace("{count}", String(filteredNews.length))}
              </p>
            </div>
          )}

          {/* Back to Media */}
          <div className="mt-12 text-center">
            <Link to="/media">
              <Button variant="outline" className="gap-2">
                {pageData?.backToMedia || "Voltar à página de Media"}
              </Button>
            </Link>
          </div>
            </div>
          </section>
        </SectionTransition>
      </main>

      <Footer />
    </div>
  );
}
