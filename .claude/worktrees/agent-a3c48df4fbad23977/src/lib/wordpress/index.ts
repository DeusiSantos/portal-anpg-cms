/**
 * WordPress Headless CMS Integration
 * Exporta todos os módulos necessários para integração
 */

// Types
export * from './types';

// Configuration
export * from './config';

// Client & API functions
export {
  // Posts
  fetchPosts,
  fetchPostBySlug,
  fetchPostById,
  // Pages
  fetchPages,
  fetchPageBySlug,
  // Categories & Tags
  fetchCategories,
  fetchTags,
  // Media
  fetchMediaById,
  // Mappers
  mapPostToNewsItem,
  mapPageToInternal,
  // Utilities
  clearCache,
  clearCacheByPattern,
  checkWordPressConnection,
} from './client';
