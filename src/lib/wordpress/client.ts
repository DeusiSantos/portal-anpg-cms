/**
 * WordPress REST API Client
 * Cliente HTTP para comunicação com WordPress headless
 */

import { wordpressConfig, getApiUrl, WP_ENDPOINTS, CATEGORY_MAPPING } from './config';
import {
  WPPost,
  WPMedia,
  WPTerm,
  WPPostsQuery,
  WPPagesQuery,
  WPResponse,
  WPPaginationHeaders,
  MappedNewsItem,
  MappedPage,
} from './types';

// Cache simples em memória
const cache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Limpa o HTML do WordPress para texto simples
 */
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

/**
 * Formata data do WordPress para formato legível
 */
const formatDate = (dateString: string, locale: string = 'pt-PT'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Constrói query string a partir de parâmetros
 */
const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else if (typeof value === 'boolean') {
        if (value) searchParams.append(key, '1');
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

/**
 * Obtém dados do cache ou faz request
 */
const getCachedOrFetch = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  if (wordpressConfig.cache.enabled) {
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < wordpressConfig.cache.ttl * 1000) {
      return cached.data as T;
    }
  }
  
  const data = await fetchFn();
  
  if (wordpressConfig.cache.enabled) {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }
  
  return data;
};

/**
 * Extrai headers de paginação
 */
const extractPaginationHeaders = (response: Response): WPPaginationHeaders => {
  return {
    total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
    totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '0', 10),
  };
};

/**
 * Request genérico ao WordPress API
 */
const wpFetch = async <T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<WPResponse<T>> => {
  const queryString = params ? `?${buildQueryString(params)}` : '';
  const url = `${getApiUrl(endpoint)}${queryString}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), wordpressConfig.timeout);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const pagination = extractPaginationHeaders(response);
    
    return { data, pagination };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('WordPress API request timeout');
    }
    
    throw error;
  }
};

// ============================================
// POSTS API
// ============================================

/**
 * Busca posts do WordPress
 */
export const fetchPosts = async (
  query: WPPostsQuery = {}
): Promise<WPResponse<WPPost[]>> => {
  const cacheKey = `posts:${JSON.stringify(query)}`;
  
  return getCachedOrFetch(cacheKey, () =>
    wpFetch<WPPost[]>(WP_ENDPOINTS.posts, {
      ...query,
      _embed: query._embed ?? true,
    })
  );
};

/**
 * Busca um post por slug
 */
export const fetchPostBySlug = async (slug: string): Promise<WPPost | null> => {
  const cacheKey = `post:${slug}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    const { data } = await wpFetch<WPPost[]>(WP_ENDPOINTS.posts, {
      slug,
      _embed: true,
    });
    return data.length > 0 ? data[0] : null;
  });
};

/**
 * Busca um post por ID
 */
export const fetchPostById = async (id: number): Promise<WPPost | null> => {
  const cacheKey = `post:id:${id}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const { data } = await wpFetch<WPPost>(`${WP_ENDPOINTS.posts}/${id}`, {
        _embed: true,
      });
      return data;
    } catch {
      return null;
    }
  });
};

// ============================================
// PAGES API
// ============================================

/**
 * Busca páginas do WordPress
 */
export const fetchPages = async (
  query: WPPagesQuery = {}
): Promise<WPResponse<WPPost[]>> => {
  const cacheKey = `pages:${JSON.stringify(query)}`;
  
  return getCachedOrFetch(cacheKey, () =>
    wpFetch<WPPost[]>(WP_ENDPOINTS.pages, {
      ...query,
      _embed: query._embed ?? true,
    })
  );
};

/**
 * Busca uma página por slug
 */
export const fetchPageBySlug = async (slug: string): Promise<WPPost | null> => {
  const cacheKey = `page:${slug}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    const { data } = await wpFetch<WPPost[]>(WP_ENDPOINTS.pages, {
      slug,
      _embed: true,
    });
    return data.length > 0 ? data[0] : null;
  });
};

// ============================================
// CATEGORIES & TAGS API
// ============================================

/**
 * Busca todas as categorias
 */
export const fetchCategories = async (): Promise<WPTerm[]> => {
  const cacheKey = 'categories:all';
  
  return getCachedOrFetch(cacheKey, async () => {
    const { data } = await wpFetch<WPTerm[]>(WP_ENDPOINTS.categories, {
      per_page: 100,
      orderby: 'count',
      order: 'desc',
    });
    return data;
  });
};

/**
 * Busca todas as tags
 */
export const fetchTags = async (): Promise<WPTerm[]> => {
  const cacheKey = 'tags:all';
  
  return getCachedOrFetch(cacheKey, async () => {
    const { data } = await wpFetch<WPTerm[]>(WP_ENDPOINTS.tags, {
      per_page: 100,
      orderby: 'count',
      order: 'desc',
    });
    return data;
  });
};

// ============================================
// MEDIA API
// ============================================

/**
 * Busca media por ID
 */
export const fetchMediaById = async (id: number): Promise<WPMedia | null> => {
  const cacheKey = `media:${id}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const { data } = await wpFetch<WPMedia>(`${WP_ENDPOINTS.media}/${id}`);
      return data;
    } catch {
      return null;
    }
  });
};

// ============================================
// MAPPERS - Converte tipos WP para tipos internos
// ============================================

/**
 * Mapeia WPPost para NewsItem interno
 */
export const mapPostToNewsItem = (post: WPPost): MappedNewsItem => {
  // Extrai categoria do embedded ou usa default
  const categories = post._embedded?.['wp:term']?.[0] || [];
  const primaryCategory = categories[0];
  const categorySlug = primaryCategory?.slug || 'news';
  const mappedCategory = CATEGORY_MAPPING[categorySlug] || categorySlug;
  
  // Extrai imagem destacada
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const imageUrl = featuredMedia?.source_url || 
    featuredMedia?.media_details?.sizes?.large?.source_url ||
    '/placeholder.svg';
  
  // Extrai autor
  const author = post._embedded?.author?.[0];
  const authorName = author?.name || 'ANPG';
  
  // Extrai tags
  const tags = post._embedded?.['wp:term']?.[1] || [];
  const tagNames = tags.map((tag) => tag.name);
  
  return {
    id: post.slug,
    title: stripHtml(post.title.rendered),
    date: formatDate(post.date),
    category: mappedCategory,
    image: imageUrl,
    excerpt: stripHtml(post.excerpt.rendered),
    content: post.content.rendered, // Mantém HTML para renderização
    url: post.link,
    author: authorName,
    tags: tagNames.length > 0 ? tagNames : undefined,
  };
};

/**
 * Mapeia WPPost (page) para MappedPage interno
 */
export const mapPageToInternal = (page: WPPost): MappedPage => {
  const featuredMedia = page._embedded?.['wp:featuredmedia']?.[0];
  
  return {
    id: String(page.id),
    slug: page.slug,
    title: stripHtml(page.title.rendered),
    content: page.content.rendered,
    excerpt: stripHtml(page.excerpt.rendered),
    featuredImage: featuredMedia?.source_url,
    lastModified: page.modified,
  };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Limpa todo o cache
 */
export const clearCache = (): void => {
  cache.clear();
};

/**
 * Limpa cache específico por pattern
 */
export const clearCacheByPattern = (pattern: string): void => {
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
};

/**
 * Verifica se o WordPress está acessível
 */
export const checkWordPressConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(getApiUrl(''), {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};
