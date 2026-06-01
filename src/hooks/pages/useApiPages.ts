import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { SITE_PAGES } from '@/data/pageSchemas';

export interface ApiPage {
  id: string;
  pageKey: string;
  pageUrl: string;
  status: string;
  seo: { pt: string; en: string };
  content: { pt: string; en: string };
  attachments: { attachment: string; order: number }[];
}

// Excepções onde o url do frontend diverge do pageUrl do backend
const BACKEND_URL_OVERRIDES: Record<string, string> = {
  home: '/homepage', // frontend '/' → backend '/homepage'
  footer: '/footer', // footer é global, não tem rota própria no frontend
};

// Resolve o pageUrl do backend a partir do pageKey do frontend
export function getBackendUrl(pageKey: string): string | undefined {
  if (BACKEND_URL_OVERRIDES[pageKey]) return BACKEND_URL_OVERRIDES[pageKey];
  const page = SITE_PAGES.find(p => p.pageKey === pageKey);
  return page?.url;
}

async function fetchAllPages(): Promise<ApiPage[]> {
  const pageSize = 100;
  const res = await api.get('/pages', { params: { page: 1, pageSize } });
  const data = res.data;
  const items: ApiPage[] = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
  const total: number = data?.pagination?.total ?? data?.total ?? items.length;

  if (total <= pageSize) return items;

  const remaining = Math.ceil((total - pageSize) / pageSize);
  const pages = await Promise.all(
    Array.from({ length: remaining }, (_, i) =>
      api.get('/pages', { params: { page: i + 2, pageSize } })
        .then(r => {
          const d = r.data;
          return Array.isArray(d) ? d : (d?.items ?? d?.data ?? []) as ApiPage[];
        })
    )
  );
  return [...items, ...pages.flat()];
}

// Cache de todas as páginas do backend (busca todas as páginas, independente da paginação)
export function useAllApiPages() {
  return useQuery<ApiPage[]>({
    queryKey: ['all-api-pages'],
    queryFn: fetchAllPages,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

// Encontra a página do backend correspondente ao pageKey do frontend.
// Tenta primeiro por pageUrl; se não encontrar, usa pageKey como fallback.
export function findApiPage(allPages: ApiPage[], pageKey: string, backendUrl?: string): ApiPage | null {
  if (!allPages) return null;
  if (backendUrl && !backendUrl.includes(':')) {
    const byUrl = allPages.find(p => p.pageUrl === backendUrl);
    if (byUrl) return byUrl;
  }
  return allPages.find(p => p.pageKey === pageKey) ?? null;
}

export function useApiPageByKey(pageKey: string): ApiPage | null {
  const { data: allPages } = useAllApiPages();
  const backendUrl = getBackendUrl(pageKey);
  if (!allPages) return null;
  return findApiPage(allPages, pageKey, backendUrl);
}
