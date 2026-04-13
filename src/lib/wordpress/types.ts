/**
 * WordPress REST API Types
 * Interfaces para integração headless com WordPress (anpg.co.ao)
 */

// WordPress Post (Posts & Páginas)
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'pending' | 'private';
  type: 'post' | 'page';
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  categories?: number[];
  tags?: number[];
  // Campos customizados ACF (se disponíveis)
  acf?: Record<string, unknown>;
  // Embedded data (quando usando _embed)
  _embedded?: {
    author?: WPAuthor[];
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: WPTerm[][];
  };
}

// WordPress Media
export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  alt_text: string;
  caption: {
    rendered: string;
  };
  source_url: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes?: {
      thumbnail?: WPMediaSize;
      medium?: WPMediaSize;
      large?: WPMediaSize;
      full?: WPMediaSize;
      [key: string]: WPMediaSize | undefined;
    };
  };
}

export interface WPMediaSize {
  file: string;
  width: number;
  height: number;
  mime_type: string;
  source_url: string;
}

// WordPress Author
export interface WPAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  slug: string;
  avatar_urls: {
    '24': string;
    '48': string;
    '96': string;
  };
}

// WordPress Category/Tag (Terms)
export interface WPTerm {
  id: number;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'category' | 'post_tag';
  description: string;
  count: number;
  parent?: number;
}

// WordPress Menu
export interface WPMenuItem {
  id: number;
  title: string;
  url: string;
  target: string;
  attr_title: string;
  classes: string[];
  menu_order: number;
  parent: number;
  children?: WPMenuItem[];
}

// Parâmetros de Query para Posts
export interface WPPostsQuery {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  author?: number | number[];
  author_exclude?: number[];
  categories?: number | number[];
  categories_exclude?: number[];
  tags?: number | number[];
  tags_exclude?: number[];
  slug?: string | string[];
  status?: 'publish' | 'draft' | 'pending' | 'private' | 'any';
  orderby?: 'date' | 'id' | 'title' | 'slug' | 'relevance' | 'modified';
  order?: 'asc' | 'desc';
  _embed?: boolean;
  _fields?: string;
}

// Parâmetros de Query para Páginas
export interface WPPagesQuery {
  page?: number;
  per_page?: number;
  search?: string;
  slug?: string | string[];
  parent?: number | number[];
  orderby?: 'date' | 'id' | 'title' | 'slug' | 'menu_order';
  order?: 'asc' | 'desc';
  _embed?: boolean;
  _fields?: string;
}

// Response Headers (para paginação)
export interface WPPaginationHeaders {
  total: number;
  totalPages: number;
}

// Response completa
export interface WPResponse<T> {
  data: T;
  pagination: WPPaginationHeaders;
}

// Mapeamento para tipos internos da aplicação
export interface MappedNewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  url?: string;
  author?: string;
  tags?: string[];
}

export interface MappedPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  lastModified: string;
}

// Configuração do WordPress
export interface WordPressConfig {
  baseUrl: string;
  apiPath: string;
  timeout: number;
  cache: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
  };
}
