import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

// ─── FAQ Items ───
export function useFAQItems() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["faq_items", isEn],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("sort_order");

      if (error) throw error;
      return data;
    },
    select: (data) => {
      // Group by category
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
      const { data, error } = await supabase
        .from("history_events")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("board_members")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("board_members")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        slug: data.slug,
        full_name: data.full_name,
        title: isEn ? (data.title_en || data.title_pt) : data.title_pt,
        role: isEn ? (data.role_en || data.role_pt) : data.role_pt,
        bio: isEn ? (data.bio_en || data.bio_pt) : data.bio_pt,
        message: isEn ? (data.message_en || data.message_pt) : data.message_pt,
        photo_url: data.photo_url,
        email: data.email,
        phone: data.phone,
        office_location: data.office_location,
        group_key: data.group_key,
        sort_order: data.sort_order,
        is_active: data.is_active,
      } as CMSBoardMember;
    },
    enabled: !!slug,
  });
}

// ─── Page Banners ───
export interface CMSPageBanner {
  id: string;
  page_key: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  overlay_opacity: number | null;
  is_active: boolean;
}

export function usePageBanner(pageKey: string | undefined) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["page_banner", pageKey, isEn],
    queryFn: async () => {
      if (!pageKey) return null;
      const { data, error } = await supabase
        .from("page_banners")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        page_key: data.page_key,
        title: isEn ? (data.title_en || data.title_pt) : data.title_pt,
        subtitle: isEn ? (data.subtitle_en || data.subtitle_pt) : data.subtitle_pt,
        image_url: data.image_url,
        overlay_opacity: data.overlay_opacity,
        is_active: data.is_active,
      } as CMSPageBanner;
    },
    enabled: !!pageKey,
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
      const { data, error } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("page_key", pageKey)
        .eq("section_key", sectionKey)
        .eq("language", lang)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        page_key: data.page_key,
        section_key: data.section_key,
        content: data.content as Record<string, any>,
        sort_order: data.sort_order,
        is_active: data.is_active,
      } as CMSContentBlock;
    },
  });
}

export function useContentBlocks(pageKey: string) {
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "pt";

  return useQuery({
    queryKey: ["content_blocks", pageKey, lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("page_key", pageKey)
        .eq("language", lang)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data.map((d) => ({
        id: d.id,
        page_key: d.page_key,
        section_key: d.section_key,
        content: d.content as Record<string, any>,
        sort_order: d.sort_order,
        is_active: d.is_active,
      })) as CMSContentBlock[];
    },
  });
}

// ─── Menu Items ───
export interface CMSMenuItem {
  id: string;
  label: string;
  description: string | null;
  url: string | null;
  icon: string | null;
  sort_order: number;
  parent_id: string | null;
  children: CMSMenuItem[];
}

export function useMenuItems(group: string = "main") {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["menu_items", isEn, group],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_visible", true)
        .eq("menu_group", group)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
    select: (data) => {
      const items = data.map((item) => ({
        id: item.id,
        label: isEn ? (item.label_en || item.label_pt) : item.label_pt,
        description: isEn ? ((item as any).description_en || (item as any).description_pt || null) : ((item as any).description_pt || null),
        url: item.url,
        icon: item.icon,
        sort_order: item.sort_order,
        parent_id: item.parent_id,
        children: [] as CMSMenuItem[],
      }));

      // Build tree
      const topLevel = items.filter((i) => !i.parent_id);
      topLevel.forEach((parent) => {
        parent.children = items
          .filter((i) => i.parent_id === parent.id)
          .sort((a, b) => a.sort_order - b.sort_order);
      });

      return topLevel.sort((a, b) => a.sort_order - b.sort_order);
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
      let query = supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });

      if (options?.category && options.category !== "all") {
        query = query.eq("category", options.category);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.slug,
        slug: data.slug,
        title: isEn ? ((data as any).title_en || data.title) : data.title,
        date: formatPortugueseDate(data.published_at),
        category: data.category || "geral",
        image: data.featured_image || "/placeholder.svg",
        excerpt: isEn ? ((data as any).excerpt_en || data.excerpt || "") : (data.excerpt || ""),
        content: isEn ? ((data as any).content_en || data.content || "") : (data.content || ""),
        published_at: data.published_at,
      } as CMSNewsArticle;
    },
    enabled: !!slug,
  });
}

// ─── Dashboard Stats ───
export function useDashboardCounts() {
  return useQuery({
    queryKey: ["dashboard_counts"],
    queryFn: async () => {
      const [news, blocks, eois, docs] = await Promise.all([
        supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("petroleum_blocks").select("id", { count: "exact", head: true }),
        supabase.from("expressions_of_interest").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("investor_documents").select("id", { count: "exact", head: true }),
      ]);
      return {
        newsCount: news.count ?? 0,
        blocksCount: blocks.count ?? 0,
        eoisCount: eois.count ?? 0,
        docsCount: docs.count ?? 0,
      };
    },
  });
}

// ─── Pending Counts for Sidebar Badges ───
export function usePendingCounts() {
  return useQuery({
    queryKey: ["pending_counts"],
    queryFn: async () => {
      const [draftNews, pendingInvestors, pendingEois] = await Promise.all([
        supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("investor_registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("expressions_of_interest").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return {
        draftNews: draftNews.count ?? 0,
        pendingInvestors: pendingInvestors.count ?? 0,
        pendingEois: pendingEois.count ?? 0,
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
      let query = supabase
        .from("investor_documents")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CMSInvestorDocument[];
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
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("media_type", mediaType)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data;
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
      let query = supabase
        .from("board_departments")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (memberId) {
        query = query.eq("member_id", memberId);
      }

      const { data: depts, error } = await query;
      if (error) throw error;

      // Fetch all sub-departments for these departments
      const deptIds = depts.map(d => d.id);
      let subDepts: any[] = [];
      if (deptIds.length > 0) {
        const { data, error: subError } = await supabase
          .from("board_sub_departments")
          .select("*")
          .in("department_id", deptIds)
          .order("sort_order");
        if (subError) throw subError;
        subDepts = data || [];
      }

      return depts.map(d => ({
        ...d,
        sub_departments: subDepts.filter(s => s.department_id === d.id),
      })) as CMSBoardDepartment[];
    },
    enabled: memberId !== "",
  });
}

export function useBoardDepartmentsBySlug(slug?: string) {
  const { data: member } = useBoardMemberBySlug(slug);
  return useBoardDepartments(member?.id);
}
