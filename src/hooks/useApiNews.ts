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

export function useApiNews(page: number = 1, pageSize: number = 100, state: NewsState = 2, langCode: 1 | 2 = 1) {
  return useQuery({
    queryKey: ['api-news', page, pageSize, state, langCode],
    queryFn: async () => {
      const response = await api.get('/news', {
        params: { State: state, Page: page, PageSize: pageSize },
      });

      // A API pode devolver array directo ou objeto paginado { items: [] }
      const raw = response.data;
      const items: ApiNewsItem[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
            ? raw.data
            : [];

      const formattedNews: FormattedNewsItem[] = items.map((item) => {
        const preferred = item.contents?.find(c => c.lang === langCode);
        const fallback  = item.contents?.find(c => c.lang === (langCode === 1 ? 2 : 1));
        const content   = preferred || fallback || item.contents?.[0];

        return {
          id: item.id,
          slug: item.slug,
          title:   content?.title   || 'Sem título',
          excerpt: content?.excerpt || '',
          content: content?.content || '',
          image:   getFullImageUrl(item.destaqueImageUrl),
          category: getCategoryFromId(item.newsCategoryId),
          date:    formatDate(item.createdAt),
          rawDate: item.createdAt,
          raw: item,
        };
      });

      return {
        news: formattedNews,
        totalCount:  raw?.totalCount  ?? formattedNews.length,
        totalPages:  raw?.totalPages  ?? 1,
        currentPage: raw?.page        ?? page,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}