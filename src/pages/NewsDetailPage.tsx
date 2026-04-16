import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  ChevronRight,
  Newspaper,
  Loader2
} from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { WPContent } from "@/components/wordpress/WPContent";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import api from "@/service/api";

// Interfaces baseadas na resposta da API
interface Attachment {
  id: string;
  fileName: string;
  storedFileName: string;
  contentType: string;
  size: number;
}

interface NewsDocument {
  id: string;
  titlePt: string;
  slugOrURL: string | null;
  excerptPt: string;
  contentPt: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  publicationDate: string;
  category: string;
  contentCode: string;
  status: string;
  attachments: Attachment[];
}

interface ApiNewsResponse {
  news: NewsDocument;
}

// Interface para o formato que o componente espera
interface FormattedNews {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
  slug: string;
  author?: string;
  tags?: string[];
  attachmentId?: string;
}

// Funções auxiliares para categorias
const getCategoryLabel = (category: string): string => {
  const categories: Record<string, string> = {
    geral: "Geral",
    producao: "Produção",
    exploracao: "Exploração",
    licitacao: "Licitação",
    institucional: "Institucional",
    sustentabilidade: "Sustentabilidade",
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

// Função para formatar a data
const formatDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  return date.toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Função para obter a URL da imagem
const getImageUrl = (newsId: string, attachment: Attachment | undefined): string => {
  if (attachment && attachment.id) {
    return `https://mwangobrainsa-001-site6.mtempurl.com/api/news/${newsId}/attachments/${attachment.id}`;
  }
  return '/placeholder-image.jpg';
};

// Hook para buscar uma notícia específica
function useNewsArticle(newsId: string | undefined) {
  return useQuery({
    queryKey: ['news-article', newsId],
    queryFn: async () => {
      if (!newsId) throw new Error('News ID is required');
      
      const response = await api.get<ApiNewsResponse>(`/news/${newsId}`);
      const document = response.data.news;
      
      // Encontrar o primeiro attachment de imagem
      const imageAttachment = document.attachments.find(att => 
        att.contentType?.startsWith('image/')
      );
      
      // Formatar os dados para o formato esperado pelo componente
      const formattedNews: FormattedNews = {
        id: document.id,
        title: document.titlePt,
        excerpt: document.excerptPt,
        content: document.contentPt,
        date: formatDate(document.publicationDate),
        image: getImageUrl(document.id, imageAttachment),
        category: document.category,
        slug: document.slugOrURL || document.id,
        attachmentId: imageAttachment?.id,
        author: undefined, // A API não retorna autor no momento
        tags: [], // A API não retorna tags no momento
      };
      
      return formattedNews;
    },
    enabled: !!newsId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar notícias relacionadas
function useRelatedNews(currentNewsId: string, category: string, limit: number = 3) {
  return useQuery({
    queryKey: ['related-news', currentNewsId, category, limit],
    queryFn: async () => {
      // Buscar todas as notícias e filtrar as relacionadas
      const response = await api.get<{ news: { data: NewsDocument[] } }>('/news/published', {
        params: {
          PageIndex: 0,
          PageSize: 50, // Buscar um número razoável para filtrar
        },
      });
      
      const allNews = response.data.news.data;
      
      // Filtrar notícias da mesma categoria, excluindo a atual
      const related = allNews
        .filter(item => item.id !== currentNewsId && item.category === category)
        .slice(0, limit);
      
      // Se não houver notícias da mesma categoria, pegar as mais recentes
      const fallbackNews = related.length === 0
        ? allNews.filter(item => item.id !== currentNewsId).slice(0, limit)
        : related;
      
      // Formatar as notícias relacionadas
      return fallbackNews.map(item => {
        const imageAttachment = item.attachments.find(att => 
          att.contentType?.startsWith('image/')
        );
        
        return {
          id: item.id,
          title: item.titlePt,
          excerpt: item.excerptPt,
          date: formatDate(item.publicationDate),
          image: getImageUrl(item.id, imageAttachment),
          category: item.category,
          slug: item.slugOrURL || item.id,
        };
      });
    },
    enabled: !!currentNewsId && !!category,
    staleTime: 5 * 60 * 1000,
  });
}

export default function NewsDetailPage() {
  const { newsId } = useParams<{ newsId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Buscar a notícia atual
  const { data: news, isLoading, isError, error } = useNewsArticle(newsId);
  
  // Buscar notícias relacionadas
  const { data: relatedNews = [] } = useRelatedNews(newsId || '', news?.category || '', 3);

  // Estado de loading
  if (isLoading) {
    return (
      <PageLayout
        title="A carregar..."
        subtitle="Media"
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

  // Estado de erro
  if (isError || !news) {
    return (
      <PageLayout
        title="Notícia não encontrada"
        subtitle="Media"
        icon={<Newspaper className="w-8 h-8 text-primary" />}
        breadcrumbs={[
          { labelKey: "nav.media", href: "/media" },
          { label: "Notícia não encontrada" },
        ]}
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            A notícia que procura não foi encontrada
          </h2>
          <p className="text-muted-foreground mb-8">
            Verifique o endereço ou navegue pelas nossas notícias recentes.
          </p>
          <Button onClick={() => navigate("/media")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar às Notícias
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Funções de compartilhamento
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
      subtitle={getCategoryLabel(news.category)}
      backgroundImage={news.image}
      icon={<Newspaper className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.media", href: "/media" },
        { label: news.title },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <SectionTransition>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/media")}
            className="mb-8 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar às Notícias
          </Button>
        </SectionTransition>

        {/* Article Header */}
        <SectionTransition delay={0.1}>
          <div className="mb-8">
            <Badge className={cn("mb-4", getCategoryColor(news.category))}>
              {getCategoryLabel(news.category)}
            </Badge>
            
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

        {/* Featured Image */}
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

        {/* Article Content */}
        <SectionTransition delay={0.3}>
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-li:text-muted-foreground">
            <div className="text-lg text-foreground font-medium mb-6 leading-relaxed">
              {news.excerpt}
            </div>
            
            <div className="article-content">
              {news.content.includes('<') ? (
                <WPContent html={news.content} maxWidth="none" />
              ) : (
                news.content.split('\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">{trimmed.replace('## ', '')}</h2>;
                  }
                  if (trimmed.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">{trimmed.replace('### ', '')}</h3>;
                  }
                  if (trimmed.startsWith('> ')) {
                    return <blockquote key={index} className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground bg-secondary/30 py-4 pr-4 rounded-r-lg">{trimmed.replace('> ', '')}</blockquote>;
                  }
                  if (trimmed.startsWith('- ')) {
                    return <li key={index} className="text-muted-foreground ml-4 mb-2">{trimmed.replace('- ', '')}</li>;
                  }
                  if (/^\d+\.\s/.test(trimmed)) {
                    return <li key={index} className="text-muted-foreground ml-4 mb-2 list-decimal">{trimmed.replace(/^\d+\.\s/, '')}</li>;
                  }
                  if (trimmed.startsWith('|')) return null;
                  
                  return <p key={index} className="text-muted-foreground mb-4 leading-relaxed">{trimmed}</p>;
                })
              )}
            </div>
          </article>
        </SectionTransition>

        {/* Share Section */}
        <SectionTransition delay={0.5}>
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Partilhar:</span>
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

      {/* Related News */}
      {relatedNews.length > 0 && (
        <SectionTransition delay={0.6}>
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-8">Notícias Relacionadas</h2>
            
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
                        <Badge className={cn("w-fit mb-3", getCategoryColor(item.category))}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
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
                Ver Todas as Notícias
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </SectionTransition>
      )}
    </PageLayout>
  );
}