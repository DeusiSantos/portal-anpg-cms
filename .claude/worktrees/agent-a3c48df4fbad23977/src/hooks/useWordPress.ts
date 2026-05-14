/**
 * WordPress React Hooks
 * Hooks para consumo de conteúdo WordPress com React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPosts,
  fetchPostBySlug,
  fetchPages,
  fetchPageBySlug,
  fetchCategories,
  fetchTags,
  mapPostToNewsItem,
  mapPageToInternal,
  checkWordPressConnection,
  WPPostsQuery,
  WPPagesQuery,
  MappedNewsItem,
  MappedPage,
} from '@/lib/wordpress';

// Query keys factory
const wpKeys = {
  all: ['wordpress'] as const,
  posts: () => [...wpKeys.all, 'posts'] as const,
  postsList: (params: WPPostsQuery) => [...wpKeys.posts(), 'list', params] as const,
  postDetail: (slug: string) => [...wpKeys.posts(), 'detail', slug] as const,
  pages: () => [...wpKeys.all, 'pages'] as const,
  pagesList: (params: WPPagesQuery) => [...wpKeys.pages(), 'list', params] as const,
  pageDetail: (slug: string) => [...wpKeys.pages(), 'detail', slug] as const,
  categories: () => [...wpKeys.all, 'categories'] as const,
  tags: () => [...wpKeys.all, 'tags'] as const,
  connection: () => [...wpKeys.all, 'connection'] as const,
};

// ============================================
// CONNECTION HOOK
// ============================================

/**
 * Verifica conexão com WordPress
 */
export const useWordPressConnection = () => {
  return useQuery({
    queryKey: wpKeys.connection(),
    queryFn: checkWordPressConnection,
    staleTime: 60 * 1000, // 1 minuto
    retry: 2,
  });
};

// ============================================
// POSTS HOOKS
// ============================================

interface UseWPPostsOptions extends WPPostsQuery {
  enabled?: boolean;
}

/**
 * Hook para buscar lista de posts (notícias)
 */
export const useWPPosts = (options: UseWPPostsOptions = {}) => {
  const { enabled = true, ...queryParams } = options;
  
  return useQuery({
    queryKey: wpKeys.postsList(queryParams),
    queryFn: async () => {
      const response = await fetchPosts(queryParams);
      return {
        items: response.data.map(mapPostToNewsItem),
        pagination: response.pagination,
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para buscar um post por slug
 */
export const useWPPost = (slug: string, enabled = true) => {
  return useQuery({
    queryKey: wpKeys.postDetail(slug),
    queryFn: async (): Promise<MappedNewsItem | null> => {
      const post = await fetchPostBySlug(slug);
      return post ? mapPostToNewsItem(post) : null;
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para buscar posts por categoria
 */
export const useWPPostsByCategory = (
  categoryId: number,
  page = 1,
  perPage = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: wpKeys.postsList({ categories: categoryId, page, per_page: perPage }),
    queryFn: async () => {
      const response = await fetchPosts({
        categories: categoryId,
        page,
        per_page: perPage,
      });
      return {
        items: response.data.map(mapPostToNewsItem),
        pagination: response.pagination,
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para pesquisa de posts
 */
export const useWPPostsSearch = (
  searchTerm: string,
  page = 1,
  perPage = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: wpKeys.postsList({ search: searchTerm, page, per_page: perPage }),
    queryFn: async () => {
      const response = await fetchPosts({
        search: searchTerm,
        page,
        per_page: perPage,
      });
      return {
        items: response.data.map(mapPostToNewsItem),
        pagination: response.pagination,
      };
    },
    enabled: enabled && searchTerm.length >= 3,
    staleTime: 2 * 60 * 1000, // 2 minutos para pesquisas
  });
};

// ============================================
// PAGES HOOKS
// ============================================

interface UseWPPagesOptions extends WPPagesQuery {
  enabled?: boolean;
}

/**
 * Hook para buscar lista de páginas
 */
export const useWPPages = (options: UseWPPagesOptions = {}) => {
  const { enabled = true, ...queryParams } = options;
  
  return useQuery({
    queryKey: wpKeys.pagesList(queryParams),
    queryFn: async () => {
      const response = await fetchPages(queryParams);
      return {
        items: response.data.map(mapPageToInternal),
        pagination: response.pagination,
      };
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos para páginas
  });
};

/**
 * Hook para buscar uma página por slug
 */
export const useWPPage = (slug: string, enabled = true) => {
  return useQuery({
    queryKey: wpKeys.pageDetail(slug),
    queryFn: async (): Promise<MappedPage | null> => {
      const page = await fetchPageBySlug(slug);
      return page ? mapPageToInternal(page) : null;
    },
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000,
  });
};

// ============================================
// CATEGORIES & TAGS HOOKS
// ============================================

/**
 * Hook para buscar categorias
 */
export const useWPCategories = (enabled = true) => {
  return useQuery({
    queryKey: wpKeys.categories(),
    queryFn: fetchCategories,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

/**
 * Hook para buscar tags
 */
export const useWPTags = (enabled = true) => {
  return useQuery({
    queryKey: wpKeys.tags(),
    queryFn: fetchTags,
    enabled,
    staleTime: 30 * 60 * 1000,
  });
};

// ============================================
// PREFETCH FUNCTIONS
// ============================================

/**
 * Hook para prefetch de dados WordPress
 */
export const useWPPrefetch = () => {
  const queryClient = useQueryClient();
  
  const prefetchPosts = async (params: WPPostsQuery = {}) => {
    await queryClient.prefetchQuery({
      queryKey: wpKeys.postsList(params),
      queryFn: async () => {
        const response = await fetchPosts(params);
        return {
          items: response.data.map(mapPostToNewsItem),
          pagination: response.pagination,
        };
      },
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchPost = async (slug: string) => {
    await queryClient.prefetchQuery({
      queryKey: wpKeys.postDetail(slug),
      queryFn: async () => {
        const post = await fetchPostBySlug(slug);
        return post ? mapPostToNewsItem(post) : null;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchPage = async (slug: string) => {
    await queryClient.prefetchQuery({
      queryKey: wpKeys.pageDetail(slug),
      queryFn: async () => {
        const page = await fetchPageBySlug(slug);
        return page ? mapPageToInternal(page) : null;
      },
      staleTime: 10 * 60 * 1000,
    });
  };
  
  return { prefetchPosts, prefetchPost, prefetchPage };
};

// ============================================
// HYBRID MODE - Fallback para dados estáticos
// ============================================

/**
 * Hook híbrido que tenta WordPress primeiro, depois fallback estático
 */
export const useHybridNews = (
  staticData: MappedNewsItem[],
  wpParams: WPPostsQuery = {},
  preferWordPress = true
) => {
  const wpQuery = useWPPosts({ ...wpParams, enabled: preferWordPress });
  
  // Se WordPress falhar ou estiver desactivado, usa dados estáticos
  const items = wpQuery.isSuccess && wpQuery.data?.items.length
    ? wpQuery.data.items
    : staticData;
  
  return {
    items,
    isLoading: preferWordPress && wpQuery.isLoading,
    isFromWordPress: wpQuery.isSuccess && !!wpQuery.data?.items.length,
    error: wpQuery.error,
    refetch: wpQuery.refetch,
    pagination: wpQuery.data?.pagination,
  };
};
