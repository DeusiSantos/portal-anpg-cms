// hooks/useApiNews.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// Tipos da API
type NewsState = 1 | 2 | 3;

interface NewsContent {
  lang: number; // 1 = Portuguese, 2 = English
  title: string;
  excerpt: string;
  content: string;
}

export interface ApiNewsItem {
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

export interface NewsApiResponse {
  items: ApiNewsItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FormattedNewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  rawDate: string;
  raw: ApiNewsItem;
}

// Mapeamento de categorias (você pode buscar da API ou usar um mapa fixo)
const categoryNameMap: Record<string, string> = {
  '07fb6a37-c9ed-4f59-91c4-4b9a20894a02': 'geral',
  // Adicione outros mapeamentos conforme necessário
};

const getCategoryFromId = (categoryId: string): string => {
  return categoryNameMap[categoryId] || 'geral';
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy", { locale: pt });
  } catch {
    return 'Data não disponível';
  }
};

// Função para construir URL completa da imagem
const getFullImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '/placeholder-image.jpg';
  
  // Se já for URL completa, retorna ela
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Se for URL relativa, constrói a URL completa
  const baseURL = api.defaults.baseURL?.replace('/api/', '') || '';
  return `${baseURL}${imageUrl}`;
};

export function useApiNews(page: number = 1, pageSize: number = 10, state: NewsState = 2) {
  return useQuery({
    queryKey: ['api-news', page, pageSize, state],
    queryFn: async () => {
      const response = await api.get<NewsApiResponse>('/news', {
        params: {
          Page: page,
          PageSize: pageSize,
          State: state,
        },
      });
      
      const formattedNews: FormattedNewsItem[] = response.data.items.map((item) => {
        // Encontrar conteúdo em português (lang=1) ou inglês
        const portugueseContent = item.contents.find(c => c.lang === 1);
        const content = portugueseContent || item.contents[0];
        
        return {
          id: item.id,
          slug: item.slug,
          title: content?.title || 'Sem título',
          excerpt: content?.excerpt || '',
          content: content?.content || '',
          image: getFullImageUrl(item.destaqueImageUrl),
          category: getCategoryFromId(item.newsCategoryId),
          date: formatDate(item.createdAt),
          rawDate: item.createdAt,
          raw: item,
        };
      });
      
      return {
        news: formattedNews,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        currentPage: response.data.page,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}