// hooks/useCMSData.ts (versão completa e atualizada)
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "@/service/api";

// ─── Types for API Response ───
interface Attachment {
  id: string;
  fileName: string;
  storedFileName: string;
  contentType: string;
  size: number;
}

interface PageBannerAPI {
  id: string;
  pageKey: string;
  titlePt: string | null;
  subtitlePt: string | null;
  titleEn: string | null;
  subtitleEn: string | null;
  publicationStatus: 'Draft' | 'Published';
  status: 'Active' | 'Inactive';
  bannerCode: string;
  attachments: Attachment[];
}

export interface CMSPageBanner {
  id: string;
  page_key: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  overlay_opacity: number;
  is_active: boolean;
}

// ─── Types for Menu API Response ───
export interface APIMenuItem {
  id: string;
  labelPt: string;
  labelEn: string;
  url: string;
  icon: string;
  group: string;
  father: string | null;
  order: number;
  visibleStatus: 'Yes' | 'No';
  newTabStatus: 'Active' | 'Inactive';
}

export interface CMSMenuItem {
  id: string;
  label: string;
  description: string | null;
  url: string | null;
  icon: string | null;
  sort_order: number;
  parent_id: string | null;
  newTab?: boolean;
  children: CMSMenuItem[];
}

// Cache para URLs de imagens blob
const imageUrlCache = new Map<string, string>();

// Função para buscar imagem do attachment via API REST
async function fetchAttachmentImage(bannerId: string, attachmentId: string): Promise<string | null> {
  const cacheKey = `${bannerId}/${attachmentId}`;
  
  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey)!;
  }
  
  try {
    const response = await api.get(`/banner/${bannerId}/attachments/${attachmentId}`, {
      responseType: 'blob'
    });
    const url = URL.createObjectURL(response.data);
    imageUrlCache.set(cacheKey, url);
    return url;
  } catch (error) {
    console.error('Erro ao carregar imagem do banner:', error);
    return null;
  }
}

// Hook para buscar todos os banners (com cache)
export function useAllBanners() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["all_banners_api", isEn],
    queryFn: async () => {
      const response = await api.get('/banner');
      const banners: PageBannerAPI[] = response.data?.news?.data || [];
      
      const activeBanners = banners.filter(b => b.status === 'Active');
      
      const bannersWithData = await Promise.all(
        activeBanners.map(async (banner) => {
          let imageUrl = null;
          
          if (banner.attachments && banner.attachments.length > 0) {
            imageUrl = await fetchAttachmentImage(banner.id, banner.attachments[0].id);
          }
          
          return {
            id: banner.id,
            page_key: banner.pageKey,
            title: isEn ? (banner.titleEn || banner.titlePt) : banner.titlePt,
            subtitle: isEn ? (banner.subtitleEn || banner.subtitlePt) : banner.subtitlePt,
            image_url: imageUrl,
            overlay_opacity: 0.6,
            is_active: banner.status === 'Active',
          } as CMSPageBanner;
        })
      );
      
      const bannerMap = new Map<string, CMSPageBanner>();
      bannersWithData.forEach(banner => {
        bannerMap.set(banner.page_key, banner);
      });
      
      return bannerMap;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Page Banners ───
export function usePageBanner(pageKey: string | undefined) {
  const { data: allBanners, isLoading } = useAllBanners();
  
  if (!pageKey || !allBanners) {
    return { data: null, isLoading };
  }
  
  return {
    data: allBanners.get(pageKey) || null,
    isLoading
  };
}

// Função para limpar cache de imagens
export function cleanupBannerImages() {
  imageUrlCache.forEach((url, key) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
  imageUrlCache.clear();
}

export function useMenuItems(group: string = "main") {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["menu_items_api", group, isEn],
    queryFn: async () => {
      try {
        const response = await api.get('/menus?PageIndex=0&PageSize=10');
        const menuItems: APIMenuItem[] = response.data?.news?.data || [];
        
        console.log('📦 Menu items from API:', menuItems);
        
        // Para o menu principal, aceitamos grupos "main" E "footer"
        // Isso resolve o problema do seu dado "Institucional" estar com group "footer"
        const allowedGroups = group === "main" ? ["main", "footer"] : [group];
        
        const filteredItems = menuItems.filter(
          item => allowedGroups.includes(item.group) && item.visibleStatus === 'Yes'
        );
        
        console.log('🔍 Filtered items (allowed groups:', allowedGroups, '):', filteredItems);
        
        if (filteredItems.length === 0) {
          console.warn('No menu items found for groups:', allowedGroups);
          return [];
        }
        
        // Transformar para o formato esperado
        const items: CMSMenuItem[] = filteredItems.map((item) => ({
          id: item.id,
          label: isEn ? (item.labelEn || item.labelPt) : item.labelPt,
          description: null,
          url: item.url || null,
          icon: item.icon || null,
          sort_order: item.order,
          // Tratar father vazio ou inválido
          parent_id: item.father && item.father !== "" && item.father !== "string" && item.father !== "TESTE" ? item.father : null,
          newTab: item.newTabStatus === 'Active',
          children: [],
        }));
        
        // Remover itens duplicados ou inválidos
        const validItems = items.filter(item => 
          item.label && item.label !== "TESTE" && item.label !== "Teste1" && item.label !== "string"
        );
        
        // Ordenar por order
        validItems.sort((a, b) => a.sort_order - b.sort_order);
        
        // Construir árvore de menus
        const topLevel = validItems.filter((item) => !item.parent_id);
        
        topLevel.forEach((parent) => {
          parent.children = validItems
            .filter((item) => item.parent_id === parent.id)
            .sort((a, b) => a.sort_order - b.sort_order);
        });
        
        const result = topLevel.sort((a, b) => a.sort_order - b.sort_order);
        console.log('✅ Final menu tree:', result);
        
        return result;
      } catch (error) {
        console.error('❌ Erro ao carregar menus da API:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── FAQ Items ───
export function useFAQItems() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["faq_items", isEn],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
    select: (data) => {
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({
          question: isEn ? (item.question_en || item.question_pt) : item.question_pt,
          answer: isEn ? (item.answer_en || item.answer_pt) : item.answer_pt,
        });
        return acc;
      }, {} as Record<string, { question: string; answer: string }[]>);
      return grouped;
    },
  });
}

// ─── History Events ───
export function useHistoryEvents() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["history_events", isEn],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
    select: (data) =>
      data.map((e) => ({
        id: e.id,
        year: e.year.toString(),
        title: isEn ? (e.title_en || e.title_pt) : e.title_pt,
        description: isEn ? (e.description_en || e.description_pt || "") : (e.description_pt || ""),
        image: e.image_url || undefined,
      })),
  });
}

// ─── Board Members ───
export interface CMSBoardMember {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  role: string | null;
  bio: string | null;
  message: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  office_location: string | null;
  group_key: string;
  sort_order: number;
  is_active: boolean;
}

export function useBoardMembers() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["board_members", isEn],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
    select: (data) =>
      data.map((m) => ({
        id: m.id,
        slug: m.slug,
        full_name: m.full_name,
        title: isEn ? (m.title_en || m.title_pt) : m.title_pt,
        role: isEn ? (m.role_en || m.role_pt) : m.role_pt,
        bio: isEn ? (m.bio_en || m.bio_pt) : m.bio_pt,
        message: isEn ? (m.message_en || m.message_pt) : m.message_pt,
        photo_url: m.photo_url,
        email: m.email,
        phone: m.phone,
        office_location: m.office_location,
        group_key: m.group_key,
        sort_order: m.sort_order,
        is_active: m.is_active,
      } as CMSBoardMember)),
  });
}

export function useBoardMemberBySlug(slug: string | undefined) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["board_member", slug, isEn],
    queryFn: async () => {
      if (!slug) return null;
      // TODO: Migrar para API quando disponível
      return null;
    },
    enabled: !!slug,
  });
}

// ─── Content Blocks ───
export interface CMSContentBlock {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, any>;
  sort_order: number;
  is_active: boolean;
}

export function useContentBlock(pageKey: string, sectionKey: string) {
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "pt";

  return useQuery({
    queryKey: ["content_block", pageKey, sectionKey, lang],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return null;
    },
  });
}

export function useContentBlocks(pageKey: string) {
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "pt";

  return useQuery({
    queryKey: ["content_blocks", pageKey, lang],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
  });
}

// ─── News Articles ───
function formatPortugueseDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

export interface CMSNewsArticle {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  author?: string;
  tags?: string[];
  published_at: string | null;
}

export function useNewsArticles(options?: {
  category?: string;
  limit?: number;
}) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["news_articles", options?.category, options?.limit, isEn],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
    select: (data) =>
      data.map((a) => ({
        id: a.slug,
        slug: a.slug,
        title: isEn ? ((a as any).title_en || a.title) : a.title,
        date: formatPortugueseDate(a.published_at),
        category: a.category || "geral",
        image: a.featured_image || "/placeholder.svg",
        excerpt: isEn ? ((a as any).excerpt_en || a.excerpt || "") : (a.excerpt || ""),
        content: isEn ? ((a as any).content_en || a.content || "") : (a.content || ""),
        published_at: a.published_at,
      } as CMSNewsArticle)),
  });
}

export function useNewsArticleBySlug(slug: string | undefined) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["news_article", slug, isEn],
    queryFn: async () => {
      if (!slug) return null;
      // TODO: Migrar para API quando disponível
      return null;
    },
    enabled: !!slug,
  });
}

// ─── Dashboard Stats ───
export function useDashboardCounts() {
  return useQuery({
    queryKey: ["dashboard_counts"],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return {
        newsCount: 0,
        blocksCount: 0,
        eoisCount: 0,
        docsCount: 0,
      };
    },
  });
}

// ─── Pending Counts for Sidebar Badges ───
export function usePendingCounts() {
  return useQuery({
    queryKey: ["pending_counts"],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return {
        draftNews: 0,
        pendingInvestors: 0,
        pendingEois: 0,
      };
    },
    refetchInterval: 30000,
  });
}

// ─── Investor Documents ───
export interface CMSInvestorDocument {
  id: string;
  document_name: string;
  description: string | null;
  category: string;
  file_url: string;
  file_size_bytes: number | null;
  is_public: boolean;
  created_at: string;
}

export function useInvestorDocuments(category?: string) {
  return useQuery({
    queryKey: ["investor_documents", category],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
  });
}

// ─── Media Items ───
export function useMediaItems(mediaType: string) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["media_items", mediaType, isEn],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
    select: (data) =>
      data.map((item) => ({
        ...item,
        title: isEn ? ((item as any).title_en || item.title) : item.title,
        description: isEn ? ((item as any).description_en || item.description) : item.description,
      })),
  });
}

// ─── Board Departments ───
export interface CMSBoardDepartment {
  id: string;
  member_id: string;
  name_pt: string;
  name_en: string | null;
  acronym: string;
  sort_order: number;
  is_active: boolean;
  sub_departments: CMSBoardSubDepartment[];
}

export interface CMSBoardSubDepartment {
  id: string;
  department_id: string;
  name_pt: string;
  name_en: string | null;
  sort_order: number;
}

export function useBoardDepartments(memberId?: string) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["board_departments", memberId, isEn],
    queryFn: async () => {
      // TODO: Migrar para API quando disponível
      return [];
    },
    enabled: memberId !== "",
  });
}

export function useBoardDepartmentsBySlug(slug?: string) {
  const { data: member } = useBoardMemberBySlug(slug);
  return useBoardDepartments(member?.id);
}