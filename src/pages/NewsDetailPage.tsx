import { useParams, Link, useNavigate } from "react-router-dom";
import { usePageData } from "@/hooks/pages/usePageData";
import { 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  ChevronRight,
  Newspaper
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import api from "@/service/api";

// Tipos da nova API
type NewsState = 1 | 2 | 3;

interface NewsContent {
  lang: number;
  title: string;
  excerpt: string;
  content: string;
}

interface NewsItem {
  id: string;
  slug: string;
  state: NewsState;
  newsCategoryId: string;
  destaqueImageUrl: string | null;
  destaqueImagePath: string | null;
  contents: NewsContent[];
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  isActive: boolean;
}

interface NewsApiResponse {
  items: NewsItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FormattedNews {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  rawDate: string;
  image: string;
  categoryId: string;
  slug: string;
  isActive: boolean;
}

// Mapeamento de categorias (a ser preenchido dinamicamente)
const categoryNameMap: Record<string, string> = {
  // Adicione os mapeamentos conforme necessário
};

const getCategoryLabel = (categoryId: string): string => {
  return categoryNameMap[categoryId] || "Geral";
};

const getCategoryColor = (categoryId: string): string => {
  const colors: Record<string, string> = {
    // Adicione cores por categoria se necessário
  };
  return colors[categoryId] || "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
};

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

// Função para obter a URL completa da imagem
const getFullImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '/placeholder-image.jpg';
  if (imageUrl.startsWith('http')) return imageUrl;
  
  const baseURL = api.defaults.baseURL?.replace('/api/', '') || '';
  return `${baseURL}${imageUrl}`;
};

// Hook para buscar uma notícia específica
function useNewsArticle(newsId: string | undefined) {
  return useQuery({
    queryKey: ['news-article', newsId],
    queryFn: async () => {
      if (!newsId) throw new Error('News ID is required');
      
      const response = await api.get<NewsItem>(`/news/${newsId}`);
      const article = response.data;
      
      // Encontrar conteúdo em português (lang=1)
      const portugueseContent = article.contents?.find(c => c.lang === 1);
      const content = portugueseContent || article.contents?.[0];
      
      const formattedNews: FormattedNews = {
        id: article.id,
        title: content?.title || 'Sem título',
        excerpt: content?.excerpt || '',
        content: content?.content || '',
        date: formatDate(article.createdAt),
        rawDate: article.createdAt,
        image: getFullImageUrl(article.destaqueImageUrl),
        categoryId: article.newsCategoryId,
        slug: article.slug,
        isActive: article.isActive,
      };
      
      return formattedNews;
    },
    enabled: !!newsId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar notícias relacionadas
function useRelatedNews(currentNewsId: string, currentCategoryId: string, limit: number = 3) {
  return useQuery({
    queryKey: ['related-news', currentNewsId, currentCategoryId, limit],
    queryFn: async () => {
      // Buscar notícias da mesma categoria
      const response = await api.get<NewsApiResponse>('/news', {
        params: {
          page: 1,
          pageSize: 100,
          state: 2, // Apenas publicadas
        },
      });
      
      const allNews = response.data.items;
      
      // Filtrar notícias da mesma categoria, excluindo a atual
      const related = allNews
        .filter(item => 
          item.id !== currentNewsId && 
          item.newsCategoryId === currentCategoryId &&
          item.isActive === true
        )
        .slice(0, limit);
      
      // Se não houver notícias da mesma categoria, pegar as mais recentes
      const fallbackNews = related.length === 0
        ? allNews.filter(item => item.id !== currentNewsId && item.isActive === true).slice(0, limit)
        : related;
      
      // Formatar as notícias relacionadas
      return fallbackNews.map(item => {
        const portugueseContent = item.contents?.find(c => c.lang === 1);
        const content = portugueseContent || item.contents?.[0];
        
        return {
          id: item.id,
          title: content?.title || 'Sem título',
          excerpt: content?.excerpt || '',
          date: formatDate(item.createdAt),
          image: getFullImageUrl(item.destaqueImageUrl),
          categoryId: item.newsCategoryId,
          slug: item.slug,
        };
      });
    },
    enabled: !!currentNewsId && !!currentCategoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export default function NewsDetailPage() {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();
  const { data: pageData } = usePageData("newsDetail");

  // Buscar a notícia atual
  const { data: news, isLoading, isError } = useNewsArticle(newsId);
  
  // Buscar notícias relacionadas
  const { data: relatedNews = [] } = useRelatedNews(newsId || '', news?.categoryId || '', 3);

  if (isLoading) {
    return (
      <PageLayout
        title={pageData?.loadingTitle || "A carregar..."}
        subtitle={pageData?.subtitle || "Media"}
        icon={<Newspaper className="w-8 h-8 text-primary" />}
        breadcrumbs={[{ labelKey: "nav.media", href: "/media" }, { label: "..." }]}
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

  if (isError || !news || !news.isActive) {
    return (
      <PageLayout
        title={pageData?.notFoundTitle || "Notícia não encontrada"}
        subtitle={pageData?.subtitle || "Media"}
        icon={<Newspaper className="w-8 h-8 text-primary" />}
        breadcrumbs={[
          { labelKey: "nav.media", href: "/media" },
          { label: pageData?.notFoundTitle || "Notícia não encontrada" },
        ]}
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {pageData?.notFoundHeading || "A notícia que procura não foi encontrada"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {pageData?.notFoundMessage || "Verifique o endereço ou navegue pelas nossas notícias recentes."}
          </p>
          <Button onClick={() => navigate("/media")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {pageData?.backButton || "Voltar às Notícias"}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = news.title;

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
      title={news.title}
      subtitle={pageData?.subtitle || "Media"}
      backgroundImage={news.image}
      icon={<Newspaper className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.media", href: "/media" },
        { label: news.title },
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
            {pageData?.backButton || "Voltar às Notícias"}
          </Button>
        </SectionTransition>

        <SectionTransition delay={0.1}>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {news.date}
              </span>
            </div>
          </div>
        </SectionTransition>

        <SectionTransition delay={0.2}>
          <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-auto object-cover"
              onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
            />
          </div>
        </SectionTransition>

        <SectionTransition delay={0.3}>
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-li:text-muted-foreground">
            {news.excerpt && (
              <div className="text-lg text-foreground font-medium mb-6 leading-relaxed">
                {news.excerpt}
              </div>
            )}
            
            <div className="article-content" dangerouslySetInnerHTML={{ __html: news.content }} />
          </article>
        </SectionTransition>

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

      {relatedNews.length > 0 && (
        <SectionTransition delay={0.6}>
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.relatedTitle || "Notícias Relacionadas"}</h2>
            
            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <StaggerItem key={item.id}>
                  <Link to={`/news/${item.slug}`} className="group block h-full">
                    <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto pt-3 border-t border-border">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
            
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg" onClick={() => navigate("/media")}>
                {pageData?.viewAllButton || "Ver Todas as Notícias"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </SectionTransition>
      )}
    </PageLayout>
  );
}