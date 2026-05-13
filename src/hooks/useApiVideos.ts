// hooks/useApiVideos.ts
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api, { getFullImageUrl } from "@/service/api";

export interface VideoContent {
  lang: number;
  title: string;
  description: string;
  body: string;
}

export interface ApiVideo {
  id: string;
  slug: string;
  providerType: number;
  externalId: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  durationSeconds: number;
  publishedAt: string;
  categoryId: string;
  status: number;
  contents: VideoContent[];
  isActive: boolean;
  createdAt: string;
}

export interface FormattedVideo {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  embedUrl: string;
  thumbnail: string;
  durationSeconds: number;
  publishedAt: string;
  formattedDate: string;
  providerType: number;
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

const getLocalizedContent = (contents: VideoContent[], isEn: boolean) => {
  const pt = contents.find(c => c.lang === 1);
  const en = contents.find(c => c.lang === 2);
  const selected = isEn && en ? en : pt;
  return {
    title: selected?.title || '',
    description: selected?.description || '',
    body: selected?.body || '',
  };
};

export const useApiVideos = (status: number = 2) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery<FormattedVideo[]>({
    queryKey: ['api-videos', status, isEn],
    queryFn: async () => {
      const response = await api.get('/videos', {
        params: { page: 1, pageSize: 100, Status: status, IsActive: true }
      });
      const items = response.data.items || [];
      
      return items.map((item: ApiVideo) => {
        const { title, description, body } = getLocalizedContent(item.contents, isEn);
        return {
          id: item.id,
          slug: item.slug || item.id,
          title,
          description,
          body,
          embedUrl: item.embedUrl || '',
          thumbnail: item.thumbnailUrl ? getFullImageUrl(item.thumbnailUrl) : '/placeholder-video.jpg',
          durationSeconds: item.durationSeconds || 0,
          publishedAt: item.publishedAt,
          formattedDate: formatDate(item.publishedAt),
          providerType: item.providerType || 1,
          status: item.status,
          isActive: item.isActive,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useApiVideoById = (id: string | undefined) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ['api-video', id, isEn],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<ApiVideo>(`/videos/${id}`);
      const item = response.data;
      const { title, description, body } = getLocalizedContent(item.contents, isEn);
      return {
        id: item.id,
        slug: item.slug || item.id,
        title,
        description,
        body,
        embedUrl: item.embedUrl || '',
        thumbnail: item.thumbnailUrl ? getFullImageUrl(item.thumbnailUrl) : '/placeholder-video.jpg',
        durationSeconds: item.durationSeconds || 0,
        publishedAt: item.publishedAt,
        formattedDate: formatDate(item.publishedAt),
        providerType: item.providerType || 1,
        status: item.status,
        isActive: item.isActive,
      } as FormattedVideo;
    },
    enabled: !!id,
  });
};