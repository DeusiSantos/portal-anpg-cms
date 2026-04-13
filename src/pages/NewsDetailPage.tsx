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
  Newspaper
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { WPContent } from "@/components/wordpress/WPContent";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsArticleBySlug, useNewsArticles } from "@/hooks/useCMSData";
import { newsItems as fallbackNews, getCategoryLabel, getCategoryColor } from "@/data/newsData";
import { cn } from "@/lib/utils";

export default function NewsDetailPage() {
  const { newsId } = useParams<{ newsId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Try CMS first
  const { data: cmsArticle, isLoading } = useNewsArticleBySlug(newsId);
  const { data: cmsAllNews } = useNewsArticles({ limit: 20 });

  // Fallback to local data
  const fallbackArticle = fallbackNews.find((item) => item.id === newsId);
  const news = cmsArticle || fallbackArticle;

  // Related news
  const allNews = cmsAllNews?.length ? cmsAllNews : fallbackNews;
  const relatedNews = allNews
    .filter((item) => (item.slug || item.id) !== newsId && item.category === news?.category)
    .slice(0, 3);
  const displayRelated = relatedNews.length > 0 
    ? relatedNews 
    : allNews.filter((item) => (item.slug || item.id) !== newsId).slice(0, 3);

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

  if (!news) {
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
              {news.author && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {news.author}
                </span>
              )}
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

        {/* Tags */}
        {'tags' in news && news.tags && news.tags.length > 0 && (
          <SectionTransition delay={0.4}>
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {news.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </SectionTransition>
        )}

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
      <SectionTransition delay={0.6}>
        <div className="mt-16 pt-16 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-8">Notícias Relacionadas</h2>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {displayRelated.map((item) => (
              <StaggerItem key={item.id}>
                <Link to={`/news/${item.slug || item.id}`} className="group block h-full">
                  <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                    <div className="aspect-video overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
    </PageLayout>
  );
}