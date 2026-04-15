// src/hooks/useApiNews.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';

// Interface para o attachment retornado pela API
interface ApiAttachment {
  id: string;
  fileName: string;
  storedFileName: string;
  contentType: string;
  size: number;
}

// Interface para a notícia retornada pela API - CORRIGIDA
interface ApiNewsItem {
  id: string;
  titlePt: string;
  slugOrURL: string | null;  // ← CORRIGIDO: era slugURL, agora é slugOrURL
  excerptPt: string;
  contentPt: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  publicationDate: string;
  category: string;
  contentCode: string;
  status: string;
  attachments?: ApiAttachment[]; // Attachments podem não vir no published
}

// Interface para a resposta da API
interface ApiNewsResponse {
  news: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: ApiNewsItem[];
  };
}

// Interface para o formato de notícia que o componente MediaPage espera
export interface FormattedNewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
  slug: string;
  raw: ApiNewsItem;
}

// Função para formatar a data ISO 8601 para um formato mais amigável
const formatDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  return date.toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Função para obter a URL da imagem (placeholder já que attachments não vêm no published)
const getImageUrl = (newsId: string, attachment: ApiAttachment | undefined): string => {
  if (attachment && attachment.id) {
    return `https://mwangobrainsa-001-site6.mtempurl.com/api/news/${newsId}/attachments/${attachment.id}`;
  }
  return '/placeholder-image.jpg';
};

export function useApiNews(pageIndex: number = 0, pageSize: number = 10) {
  return useQuery({
    queryKey: ['api-news-published', pageIndex, pageSize],
    queryFn: async () => {
      const response = await api.get<ApiNewsResponse>('/news/published', {
        params: {
          PageIndex: pageIndex,
          PageSize: pageSize,
        },
      });

      const apiNewsData = response.data.news.data;
      
      console.log('Notícias publicadas carregadas:', apiNewsData);
      
      // Formatar os dados para o formato esperado pelo componente
      const formattedNews: FormattedNewsItem[] = apiNewsData.map(item => ({
        id: item.id,
        title: item.titlePt,
        excerpt: item.excerptPt,
        content: item.contentPt,
        date: formatDate(item.publicationDate),
        image: getImageUrl(item.id, item.attachments?.[0]), // Usando placeholder
        category: item.category,
        slug: item.slugOrURL || item.id, 
        raw: item,
      }));

      return {
        news: formattedNews,
        totalCount: response.data.news.count,
        pageIndex: response.data.news.pageIndex,
        pageSize: response.data.news.pageSize,
      };
    },
  });
}