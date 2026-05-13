// hooks/useCMSData.ts (versão completa e atualizada)
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api, { getFullImageUrl } from "@/service/api";

// ─── Types for API Response ───
//Banner Types
interface BannerContent {
  lang: number;
  title: string;
  subtitle: string;
}

interface Banner {
  id: string;
  pageKey: string;
  imageUrl: string | null;
  imagePath: string | null;
  overlayOpacity: number;
  contents: BannerContent[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface BannersResponse {
  items: Banner[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
interface MenuDto {
  id: string;
  group: string | null;
  url: string | null;
  icon: string | null;
  parentId: string | null;
  displayOrder: number;
  openInNewTab: boolean;
  isActive: boolean;
  contents: { lang: number; label: string | null }[] | null;
}

interface MenuDtoPaged {
  items: MenuDto[];
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

const getBannerContent = (banner: Banner, lang: number): { title: string; subtitle: string } => {
  const content = banner.contents?.find(c => c.lang === lang);
  return {
    title: content?.title || '',
    subtitle: content?.subtitle || ''
  };
}

// Hook para buscar todos os banners (com cache)
export function useAllBanners() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["all_banners_api", isEn],
    queryFn: async () => {
      const response = await api.get<BannersResponse>('/cms/banners', {
        params: { Page: 1, PageSize: 100 }
      });
      
      const banners: Banner[] = response.data.items || [];
      
      // Filtrar apenas banners ativos
      const activeBanners = banners.filter(b => b.isActive === true);
      
      const bannerMap = new Map<string, CMSPageBanner>();
      
      activeBanners.forEach(banner => {
        const ptContent = getBannerContent(banner, 1);
        const enContent = getBannerContent(banner, 2);
        
        bannerMap.set(banner.pageKey, {
          id: banner.id,
          page_key: banner.pageKey,
          title: isEn ? (enContent.title || ptContent.title) : ptContent.title,
          subtitle: isEn ? (enContent.subtitle || ptContent.subtitle) : ptContent.subtitle,
          image_url: banner.imageUrl ? getFullImageUrl(banner.imageUrl) : null,
          overlay_opacity: banner.overlayOpacity,
          is_active: banner.isActive,
        });
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

export function useMenuItems(group: string = "main") {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["menu_items_api", group, isEn],
    queryFn: async () => {
      try {
        const response = await api.get<MenuDtoPaged>("/cms/menus", {
          params: { Page: 1, PageSize: 200, IsActive: true },
        });
        const raw = response.data.items ?? [];

        const allowedGroups =
          group === "main" ? ["main", "footer"] : [group];

        const filteredItems = raw.filter((item) => {
          const g = (item.group ?? "main").toLowerCase();
          return allowedGroups.includes(g) && item.isActive;
        });

        const items: CMSMenuItem[] = filteredItems.map((item) => {
          const pt = item.contents?.find((c) => c.lang === 1)?.label?.trim() ?? "";
          const en = item.contents?.find((c) => c.lang === 2)?.label?.trim() ?? "";
          return {
            id: item.id,
            label: isEn ? en || pt : pt,
            description: null,
            url: item.url || null,
            icon: item.icon || null,
            sort_order: item.displayOrder,
            parent_id: item.parentId,
            newTab: item.openInNewTab,
            children: [],
          };
        });

        const validItems = items.filter(
          (item) => item.label && item.label !== "TESTE" && item.label !== "string"
        );
        validItems.sort((a, b) => a.sort_order - b.sort_order);

        const topLevel = validItems.filter((item) => !item.parent_id);
        topLevel.forEach((parent) => {
          parent.children = validItems
            .filter((item) => item.parent_id === parent.id)
            .sort((a, b) => a.sort_order - b.sort_order);
        });

        return topLevel.sort((a, b) => a.sort_order - b.sort_order);
      } catch (error) {
        console.error("Erro ao carregar menus da API:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── FAQ Items ───
interface FaqContentDto {
  lang: number;
  question: string | null;
  answer: string | null;
}

interface FaqCategoryDtoLite {
  id: string;
  contents?: { lang: number; name: string | null }[];
}

interface FaqDtoLite {
  faqCategoryId: string | null;
  faqCategory?: FaqCategoryDtoLite;
  contents: FaqContentDto[] | null;
}

interface FaqListResponse {
  items: FaqDtoLite[];
}

export function useFAQItems() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["faq_items", isEn],
    queryFn: async () => {
      const response = await api.get<FaqListResponse>("/faqs", {
        params: { Page: 1, PageSize: 500, IsActive: true },
      });
      const items = response.data.items ?? [];

      const catName = (faq: FaqDtoLite): string => {
        const c = faq.faqCategory?.contents?.find((x) => x.lang === 1)?.name?.trim();
        return c || "Geral";
      };

      return items.map((faq) => {
        const pt = faq.contents?.find((c) => c.lang === 1);
        const en = faq.contents?.find((c) => c.lang === 2);
        return {
          category: catName(faq),
          question_pt: pt?.question ?? "",
          answer_pt: pt?.answer ?? "",
          question_en: en?.question ?? "",
          answer_en: en?.answer ?? "",
        };
      });
    },
    select: (data) => {
      const grouped = data.reduce(
        (acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push({
            question: isEn ? item.question_en || item.question_pt : item.question_pt,
            answer: isEn ? item.answer_en || item.answer_pt : item.answer_pt,
          });
          return acc;
        },
        {} as Record<string, { question: string; answer: string }[]>
      );
      return grouped;
    },
  });
}

// ─── History Events ───
interface TimelineContentDto {
  lang: number;
  title: string | null;
  description: string | null;
}

interface TimelineDtoLite {
  id: string;
  year: number;
  displayOrder: number;
  imageUrl: string | null;
  contents: TimelineContentDto[] | null;
}

interface TimelineListResponse {
  items: TimelineDtoLite[];
}

export function useHistoryEvents() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["history_events", isEn],
    queryFn: async () => {
      const response = await api.get<TimelineListResponse>("/timelines", {
        params: { Page: 1, PageSize: 200, IsActive: true },
      });
      return response.data.items ?? [];
    },
    select: (data) =>
      data
        .slice()
        .sort((a, b) => a.year - b.year || a.displayOrder - b.displayOrder)
        .map((e) => {
          const pt = e.contents?.find((c) => c.lang === 1);
          const en = e.contents?.find((c) => c.lang === 2);
          return {
            id: e.id,
            year: String(e.year),
            title: isEn ? en?.title || pt?.title || "" : pt?.title || "",
            description: isEn
              ? en?.description || pt?.description || ""
              : pt?.description || "",
            image: e.imageUrl ? getFullImageUrl(e.imageUrl) : undefined,
          };
        }),
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

interface CouncilMemberContentDto {
  lang: number;
  title: string | null;
  pelouro: string | null;
  biography: string | null;
  institutionalMessage: string | null;
}

interface CouncilGroupDtoLite {
  id: string;
  contents?: { lang: number; name: string | null }[];
}

interface CouncilMemberDtoLite {
  id: string;
  slug: string | null;
  displayOrder: number;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  officeLocation: string | null;
  fullName: string | null;
  isActive: boolean;
  contents: CouncilMemberContentDto[] | null;
  group?: CouncilGroupDtoLite;
}

interface CouncilMemberListResponse {
  items: CouncilMemberDtoLite[];
}

function groupKeyFromMember(m: CouncilMemberDtoLite): string {
  const pt =
    m.group?.contents?.find((c) => c.lang === 1)?.name?.trim().toLowerCase() ||
    "conselho";
  return pt.replace(/\s+/g, "-");
}

export function useBoardMembers() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["board_members", isEn],
    queryFn: async () => {
      const response = await api.get<CouncilMemberListResponse>(
        "/administrative-council/members",
        { params: { Page: 1, PageSize: 500, IsActive: true } }
      );
      return response.data.items ?? [];
    },
    select: (data) =>
      data
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((m) => {
          const pt = m.contents?.find((c) => c.lang === 1);
          const en = m.contents?.find((c) => c.lang === 2);
          return {
            id: m.id,
            slug: m.slug || m.id,
            full_name: m.fullName || "",
            title: isEn ? en?.title || pt?.title || "" : pt?.title || "",
            role: isEn ? en?.pelouro || pt?.pelouro || "" : pt?.pelouro || "",
            bio: isEn ? en?.biography || pt?.biography || "" : pt?.biography || "",
            message: isEn
              ? en?.institutionalMessage || pt?.institutionalMessage || ""
              : pt?.institutionalMessage || "",
            photo_url: m.photoUrl ? getFullImageUrl(m.photoUrl) : null,
            email: m.email,
            phone: m.phone,
            office_location: m.officeLocation,
            group_key: groupKeyFromMember(m),
            sort_order: m.displayOrder,
            is_active: m.isActive,
          } as CMSBoardMember;
        }),
  });
}

export function useBoardMemberBySlug(slug: string | undefined) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["board_member", slug, isEn],
    queryFn: async () => {
      if (!slug) return null;
      const response = await api.get<CouncilMemberListResponse>(
        "/administrative-council/members",
        { params: { Page: 1, PageSize: 200, Search: slug, IsActive: true } }
      );
      const found =
        response.data.items?.find(
          (m) => (m.slug || "").toLowerCase() === slug.toLowerCase()
        ) || null;
      return found;
    },
    enabled: !!slug,
    select: (m) => {
      if (!m) return null;
      const pt = m.contents?.find((c) => c.lang === 1);
      const en = m.contents?.find((c) => c.lang === 2);
      return {
        id: m.id,
        slug: m.slug || m.id,
        full_name: m.fullName || "",
        title: isEn ? en?.title || pt?.title || "" : pt?.title || "",
        role: isEn ? en?.pelouro || pt?.pelouro || "" : pt?.pelouro || "",
        bio: isEn ? en?.biography || pt?.biography || "" : pt?.biography || "",
        message: isEn
          ? en?.institutionalMessage || pt?.institutionalMessage || ""
          : pt?.institutionalMessage || "",
        photo_url: m.photoUrl ? getFullImageUrl(m.photoUrl) : null,
        email: m.email,
        phone: m.phone,
        office_location: m.officeLocation,
        group_key: groupKeyFromMember(m),
        sort_order: m.displayOrder,
        is_active: m.isActive,
      } as CMSBoardMember;
    },
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

interface ContentBlockContentDto {
  lang: number;
  contentJson: string | null;
}

interface ContentBlockDto {
  id: string;
  pageKey: string | null;
  sectionKey: string | null;
  order: number;
  isActive: boolean;
  contents: ContentBlockContentDto[] | null;
}

interface ContentBlockListResponse {
  items: ContentBlockDto[];
  totalCount?: number;
}

function parseBlockJson(json: string | null): Record<string, unknown> {
  if (!json || !json.trim()) return {};
  try {
    const v = JSON.parse(json) as unknown;
    return typeof v === "object" && v !== null && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : { value: v };
  } catch {
    return { html: json };
  }
}

export function useContentBlock(pageKey: string, sectionKey: string) {
  const { i18n } = useTranslation();
  const langNum = i18n.language === "en" ? 2 : 1;

  return useQuery({
    queryKey: ["content_block", pageKey, sectionKey, langNum],
    queryFn: async () => {
      const response = await api.get<ContentBlockListResponse>("/content-blocks", {
        params: {
          Page: 1,
          PageSize: 50,
          PageKeyFilter: pageKey,
          SectionKeyFilter: sectionKey,
          IsActive: true,
        },
      });
      const items = response.data.items ?? [];
      const block =
        items.slice().sort((a, b) => a.order - b.order)[0] ?? null;
      if (!block) return null;
      const entry =
        block.contents?.find((c) => c.lang === langNum) ?? block.contents?.[0];
      const content = parseBlockJson(entry?.contentJson ?? null);
      return {
        id: block.id,
        page_key: block.pageKey ?? pageKey,
        section_key: block.sectionKey ?? sectionKey,
        content,
        sort_order: block.order,
        is_active: block.isActive,
      } as CMSContentBlock;
    },
  });
}

export function useContentBlocks(pageKey: string) {
  const { i18n } = useTranslation();
  const langNum = i18n.language === "en" ? 2 : 1;

  return useQuery({
    queryKey: ["content_blocks", pageKey, langNum],
    queryFn: async () => {
      const response = await api.get<ContentBlockListResponse>("/content-blocks", {
        params: {
          Page: 1,
          PageSize: 100,
          PageKeyFilter: pageKey,
          IsActive: true,
        },
      });
      const items = response.data.items ?? [];
      return items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const entry =
            block.contents?.find((c) => c.lang === langNum) ??
            block.contents?.[0];
          const content = parseBlockJson(entry?.contentJson ?? null);
          return {
            id: block.id,
            page_key: block.pageKey ?? pageKey,
            section_key: block.sectionKey ?? "",
            content,
            sort_order: block.order,
            is_active: block.isActive,
          } as CMSContentBlock;
        });
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

interface NewsContentDto {
  lang: number;
  title: string | null;
  excerpt: string | null;
  content: string | null;
}

interface NewsDtoLite {
  id: string;
  slug: string | null;
  newsCategoryId: string;
  destaqueImageUrl: string | null;
  createdAt: string;
  contents: NewsContentDto[] | null;
}

interface NewsPagedResponse {
  items: NewsDtoLite[];
  totalCount?: number;
}

const NEWS_CATEGORY_SLUG: Record<string, string> = {
  "07fb6a37-c9ed-4f59-91c4-4b9a20894a02": "geral",
};

function mapNewsCategoryId(categoryId: string): string {
  return NEWS_CATEGORY_SLUG[categoryId] || "geral";
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
      const response = await api.get<NewsPagedResponse>("/news", {
        params: {
          Page: 1,
          PageSize: options?.limit ?? 50,
          State: 2,
        },
      });
      let items = response.data.items ?? [];
      if (options?.category && options.category !== "all") {
        items = items.filter(
          (n) => mapNewsCategoryId(n.newsCategoryId) === options.category
        );
      }
      return items;
    },
    select: (data) =>
      data.map((item) => {
        const pt = item.contents?.find((c) => c.lang === 1);
        const en = item.contents?.find((c) => c.lang === 2);
        const title = isEn ? en?.title || pt?.title || "" : pt?.title || "";
        const excerpt = isEn ? en?.excerpt || pt?.excerpt || "" : pt?.excerpt || "";
        const content = isEn ? en?.content || pt?.content || "" : pt?.content || "";
        return {
          id: item.slug || item.id,
          slug: item.slug || item.id,
          title,
          date: formatPortugueseDate(item.createdAt),
          category: mapNewsCategoryId(item.newsCategoryId),
          image: item.destaqueImageUrl
            ? getFullImageUrl(item.destaqueImageUrl)
            : "/placeholder.svg",
          excerpt,
          content,
          published_at: item.createdAt,
        } as CMSNewsArticle;
      }),
  });
}

export function useNewsArticleBySlug(slug: string | undefined) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["news_article", slug, isEn],
    queryFn: async () => {
      if (!slug) return null;
      const bySlug = await api.get<NewsPagedResponse>("/news", {
        params: { Page: 1, PageSize: 5, Slug: slug, State: 2 },
      });
      let item = bySlug.data.items?.[0];
      if (!item && /^[0-9a-fA-F-]{36}$/.test(slug)) {
        const response = await api.get<NewsDtoLite>(`/news/${slug}`);
        item = response.data;
      }
      return item ?? null;
    },
    enabled: !!slug,
    select: (item) => {
      if (!item) return null;
      const pt = item.contents?.find((c) => c.lang === 1);
      const en = item.contents?.find((c) => c.lang === 2);
      return {
        id: item.slug || item.id,
        slug: item.slug || item.id,
        title: isEn ? en?.title || pt?.title || "" : pt?.title || "",
        date: formatPortugueseDate(item.createdAt),
        category: mapNewsCategoryId(item.newsCategoryId),
        image: item.destaqueImageUrl
          ? getFullImageUrl(item.destaqueImageUrl)
          : "/placeholder.svg",
        excerpt: isEn ? en?.excerpt || pt?.excerpt || "" : pt?.excerpt || "",
        content: isEn ? en?.content || pt?.content || "" : pt?.content || "",
        published_at: item.createdAt,
      } as CMSNewsArticle;
    },
  });
}

// ─── Dashboard Stats ───
export function useDashboardCounts() {
  return useQuery({
    queryKey: ["dashboard_counts"],
    queryFn: async () => {
      const [newsRes, blocksRes, oilRes] = await Promise.all([
        api.get<NewsPagedResponse>("/news", {
          params: { Page: 1, PageSize: 1 },
        }),
        api.get<ContentBlockListResponse>("/content-blocks", {
          params: { Page: 1, PageSize: 1 },
        }),
        api.get<{ items: unknown[] }>("/operations/oil-blocks", {
          params: { Page: 1, PageSize: 1 },
        }),
      ]);
      return {
        newsCount: newsRes.data.totalCount ?? newsRes.data.items?.length ?? 0,
        blocksCount:
          blocksRes.data.totalCount ?? blocksRes.data.items?.length ?? 0,
        eoisCount: 0,
        docsCount: oilRes.data.totalCount ?? oilRes.data.items?.length ?? 0,
      };
    },
  });
}

// ─── Pending Counts for Sidebar Badges ───
export function usePendingCounts() {
  return useQuery({
    queryKey: ["pending_counts"],
    queryFn: async () => {
      const drafts = await api.get<NewsPagedResponse>("/news", {
        params: { Page: 1, PageSize: 1, State: 1 },
      });
      return {
        draftNews: drafts.data.totalCount ?? 0,
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

interface InvestorDocumentContentDto {
  lang: number;
  title: string | null;
  description: string | null;
}

interface InvestorDocumentDto {
  id: string;
  category: string | null;
  fileUrl: string | null;
  contents: InvestorDocumentContentDto[] | null;
  publishedAt: string | null;
}

interface InvestorDocPaged {
  items: InvestorDocumentDto[];
}

export function useInvestorDocuments(category?: string) {
  return useQuery({
    queryKey: ["investor_documents", category],
    queryFn: async () => {
      const response = await api.get<InvestorDocPaged>("/investor-documents", {
        params: { Page: 1, PageSize: 200, IsActive: true },
      });
      let items = response.data.items ?? [];
      if (category) {
        items = items.filter(
          (d) => (d.category || "").toLowerCase() === category.toLowerCase()
        );
      }
      return items.map((d) => {
        const pt = d.contents?.find((c) => c.lang === 1);
        return {
          id: d.id,
          document_name: pt?.title || "",
          description: pt?.description || null,
          category: d.category || "geral",
          file_url: d.fileUrl ? getFullImageUrl(d.fileUrl) : "",
          file_size_bytes: null as number | null,
          is_public: true,
          created_at: d.publishedAt || "",
        } as CMSInvestorDocument;
      });
    },
  });
}

interface EventContentDto {
  lang: number;
  title: string | null;
  description: string | null;
}

interface EventDtoLite {
  id: string;
  slug: string | null;
  startAt: string;
  location: string | null;
  registrationUrl: string | null;
  featuredImageUrl: string | null;
  contents: EventContentDto[] | null;
}

interface EventPaged {
  items: EventDtoLite[];
}

interface PublicationDtoLite {
  id: string;
  slug: string | null;
  year: number;
  publishedAt: string | null;
  fileUrl: string | null;
  coverImageUrl: string | null;
  contents: { lang: number; title: string | null; description: string | null; summary: string | null }[] | null;
}

interface PublicationPaged {
  items: PublicationDtoLite[];
}

interface VideoDtoLite {
  id: string;
  slug: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  contents: { lang: number; title: string | null; description: string | null }[] | null;
}

interface VideoPaged {
  items: VideoDtoLite[];
}

interface PressClippingDtoLite {
  id: string;
  slug: string | null;
  source: string | null;
  externalUrl: string | null;
  publishedAt: string;
  thumbnailUrl: string | null;
  contents: { lang: number; title: string | null; summary: string | null }[] | null;
}

interface PressPaged {
  items: PressClippingDtoLite[];
}

/** Item genérico para separadores Media (Imprensa). */
export interface MediaCardItem {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  image_url: string | null;
  external_url: string;
  event_date?: string;
  source?: string;
}

// ─── Media Items ───
export function useMediaItems(mediaType: string) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["media_items", mediaType, isEn],
    queryFn: async (): Promise<MediaCardItem[]> => {
      const baseParams = { Page: 1, PageSize: 100, IsActive: true };

      if (mediaType === "event") {
        const response = await api.get<EventPaged>("/events", {
          params: baseParams,
        });
        return (response.data.items ?? []).map((e) => {
          const pt = e.contents?.find((c) => c.lang === 1);
          const en = e.contents?.find((c) => c.lang === 2);
          const titlePt = pt?.title || "";
          const titleEn = en?.title || "";
          const descPt = pt?.description || "";
          const descEn = en?.description || "";
          const date = new Date(e.startAt).toLocaleDateString(
            isEn ? "en-GB" : "pt-PT"
          );
          return {
            id: e.id,
            title: titlePt,
            title_en: titleEn,
            description: descPt,
            description_en: descEn,
            event_date: date,
            image_url: e.featuredImageUrl
              ? getFullImageUrl(e.featuredImageUrl)
              : null,
            external_url:
              e.registrationUrl ||
              (e.slug ? `/media/events/${e.slug}` : "#"),
          };
        });
      }

      if (mediaType === "publication") {
        const response = await api.get<PublicationPaged>("/publications", {
          params: baseParams,
        });
        return (response.data.items ?? []).map((p) => {
          const pt = p.contents?.find((c) => c.lang === 1);
          const en = p.contents?.find((c) => c.lang === 2);
          const titlePt = pt?.title || `Publicação ${p.year}`;
          const titleEn = en?.title || titlePt;
          const descPt = pt?.description || pt?.summary || "";
          const descEn = en?.description || en?.summary || descPt;
          const dateStr = p.publishedAt
            ? new Date(p.publishedAt).toLocaleDateString(isEn ? "en-GB" : "pt-PT")
            : String(p.year);
          const file = p.fileUrl ? getFullImageUrl(p.fileUrl) : "#";
          return {
            id: p.id,
            title: titlePt,
            title_en: titleEn,
            description: descPt,
            description_en: descEn,
            image_url: p.coverImageUrl ? getFullImageUrl(p.coverImageUrl) : null,
            external_url: p.fileUrl ? getFullImageUrl(p.fileUrl) : file,
            event_date: dateStr,
          };
        });
      }

      if (mediaType === "video") {
        const response = await api.get<VideoPaged>("/videos", {
          params: baseParams,
        });
        return (response.data.items ?? []).map((v) => {
          const pt = v.contents?.find((c) => c.lang === 1);
          const en = v.contents?.find((c) => c.lang === 2);
          const titlePt = pt?.title || "Vídeo";
          const titleEn = en?.title || titlePt;
          const descPt = pt?.description || "";
          const descEn = en?.description || descPt;
          const dateStr = v.publishedAt
            ? new Date(v.publishedAt).toLocaleDateString(isEn ? "en-GB" : "pt-PT")
            : "";
          return {
            id: v.id,
            title: titlePt,
            title_en: titleEn,
            description: descPt,
            description_en: descEn,
            image_url: v.thumbnailUrl ? getFullImageUrl(v.thumbnailUrl) : null,
            external_url: v.embedUrl || "#",
            event_date: dateStr,
          };
        });
      }

      if (mediaType === "press") {
        const response = await api.get<PressPaged>("/press-clippings", {
          params: baseParams,
        });
        return (response.data.items ?? []).map((c) => {
          const pt = c.contents?.find((x) => x.lang === 1);
          const en = c.contents?.find((x) => x.lang === 2);
          const titlePt = pt?.title || "Recorte";
          const titleEn = en?.title || titlePt;
          const descPt = pt?.summary || "";
          const descEn = en?.summary || descPt;
          const dateStr = new Date(c.publishedAt).toLocaleDateString(
            isEn ? "en-GB" : "pt-PT"
          );
          return {
            id: c.id,
            title: titlePt,
            title_en: titleEn,
            description: descPt,
            description_en: descEn,
            image_url: c.thumbnailUrl ? getFullImageUrl(c.thumbnailUrl) : null,
            external_url: c.externalUrl || "#",
            event_date: dateStr,
            source: c.source || undefined,
          };
        });
      }

      return [];
    },
    select: (data) =>
      data.map((item) => ({
        ...item,
        title: isEn ? item.title_en || item.title : item.title,
        description: isEn
          ? item.description_en || item.description
          : item.description,
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
      // A API expõe grupos/membros do conselho, não uma árvore “departamentos”.
      // Quando existir endpoint dedicado, mapear aqui para CMSBoardDepartment.
      void isEn;
      return [] as CMSBoardDepartment[];
    },
    enabled: !!memberId && memberId !== "",
  });
}

export function useBoardDepartmentsBySlug(slug?: string) {
  const { data: member } = useBoardMemberBySlug(slug);
  return useBoardDepartments(member?.id);
}