// hooks/useApiPress.ts
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api, { getFullImageUrl } from "@/service/api";

export interface PressContent {
  lang: number;
  title: string;
  summary: string;
  body: string;
}

export interface ApiPress {
  id: string;
  slug: string;
  source: string;
  sourceLogoUrl: string | null;
  externalUrl: string;
  publishedAt: string;
  clippingFileUrl: string | null;
  clippingFilePath: string | null;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  status: number;
  contents: PressContent[];
  isActive: boolean;
  createdAt: string;
}

export interface FormattedPress {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  source: string;
  externalUrl: string;
  publishedAt: string;
  formattedDate: string;
  fileUrl: string | null;
  thumbnail: string;
  status: number;
  isActive: boolean;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const getLocalizedContent = (contents: PressContent[], isEn: boolean) => {
  const pt = contents.find(c => c.lang === 1);
  const en = contents.find(c => c.lang === 2);
  const selected = isEn && en ? en : pt;
  return {
    title: selected?.title || '',
    summary: selected?.summary || '',
    body: selected?.body || '',
  };
};

export const useApiPress = (status: number = 2) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery<FormattedPress[]>({
    queryKey: ['api-press', status, isEn],
    queryFn: async () => {
      const response = await api.get('/press-clippings', {
        params: { page: 1, pageSize: 100, Status: status, IsActive: true }
      });
      const items = response.data.items || [];
      
      return items.map((item: ApiPress) => {
        const { title, summary, body } = getLocalizedContent(item.contents, isEn);
        return {
          id: item.id,
          slug: item.slug || item.id,
          title,
          summary,
          body,
          source: item.source || '',
          externalUrl: item.externalUrl || '',
          publishedAt: item.publishedAt,
          formattedDate: formatDate(item.publishedAt),
          fileUrl: item.clippingFileUrl ? getFullImageUrl(item.clippingFileUrl) : null,
          thumbnail: item.thumbnailUrl ? getFullImageUrl(item.thumbnailUrl) : '/placeholder-press.jpg',
          status: item.status,
          isActive: item.isActive,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useApiPressById = (id: string | undefined) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ['api-press', id, isEn],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<ApiPress>(`/press-clippings/${id}`);
      const item = response.data;
      const { title, summary, body } = getLocalizedContent(item.contents, isEn);
      return {
        id: item.id,
        slug: item.slug || item.id,
        title,
        summary,
        body,
        source: item.source || '',
        externalUrl: item.externalUrl || '',
        publishedAt: item.publishedAt,
        formattedDate: formatDate(item.publishedAt),
        fileUrl: item.clippingFileUrl ? getFullImageUrl(item.clippingFileUrl) : null,
        thumbnail: item.thumbnailUrl ? getFullImageUrl(item.thumbnailUrl) : '/placeholder-press.jpg',
        status: item.status,
        isActive: item.isActive,
      } as FormattedPress;
    },
    enabled: !!id,
  });
};