/**
 * WordPress REST API Configuration
 * Configuração central para integração headless
 */

import { WordPressConfig } from './types';

// URL base do WordPress existente
const WP_BASE_URL = 'https://anpg.co.ao';

export const wordpressConfig: WordPressConfig = {
  baseUrl: WP_BASE_URL,
  apiPath: '/wp-json/wp/v2',
  timeout: 15000, // 15 segundos
  cache: {
    enabled: true,
    ttl: 300, // 5 minutos de cache
  },
};

// Endpoints específicos
export const WP_ENDPOINTS = {
  posts: '/posts',
  pages: '/pages',
  media: '/media',
  categories: '/categories',
  tags: '/tags',
  users: '/users',
  menus: '/menus', // Requer plugin WP REST API Menus
  search: '/search',
} as const;

// Categorias WordPress -> Categorias internas
export const CATEGORY_MAPPING: Record<string, string> = {
  'comunicados': 'press',
  'comunicado': 'press',
  'licitacoes': 'tender',
  'licitacao': 'tender',
  'destaques': 'highlight',
  'destaque': 'highlight',
  'producao': 'production',
  'production': 'production',
  'institucional': 'institutional',
  'noticias': 'news',
  // Adicionar mais conforme necessário
};

// Slugs de páginas conhecidas
export const KNOWN_PAGE_SLUGS = {
  about: 'quem-somos',
  history: 'nossa-historia-2',
  mission: 'missao-visao-valores',
  socialResponsibility: 'responsabilidade-social',
  contact: 'contactos',
  faq: 'faq',
  privacy: 'politica-privacidade',
  terms: 'termos-condicoes',
} as const;

// API URL completa
export const getApiUrl = (endpoint: string): string => {
  return `${wordpressConfig.baseUrl}${wordpressConfig.apiPath}${endpoint}`;
};
