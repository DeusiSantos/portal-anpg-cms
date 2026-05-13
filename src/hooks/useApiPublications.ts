// hooks/useApiPublications.ts
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api, { getFullImageUrl } from "@/service/api";

export interface PublicationContent {
  lang: number;
  title: string;
  description: string;
  summary: string;
}

export interface ApiPublication {
  id: string;
  slug: string;
  year: number;
  publishedAt: string;
  fileUrl: string | null;
  filePath: string | null;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  author: string;
  categoryId: string;
  status: number;
  contents: PublicationContent[];
  isActive: boolean;
  createdAt: string;
}

export interface FormattedPublication {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary: string;
  year: number;
  publishedAt: string;
  formattedDate: string;
  author: string;
  fileUrl: string | null;
  coverImage: string;
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

const getLocalizedContent = (contents: PublicationContent[], isEn: boolean) => {
  const pt = contents.find(c => c.lang === 1);
  const en = contents.find(c => c.lang === 2);
  const selected = isEn && en ? en : pt;
  return {
    title: selected?.title || '',
    description: selected?.description || '',
    summary: selected?.summary || '',
  };
};

export const useApiPublications = (status: number = 2) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery<FormattedPublication[]>({
    queryKey: ['api-publications', status, isEn],
    queryFn: async () => {
      const response = await api.get('/publications', {
        params: { page: 1, pageSize: 100, Status: status, IsActive: true }
      });
      const items = response.data.items || [];
      
      return items.map((item: ApiPublication) => {
        const { title, description, summary } = getLocalizedContent(item.contents, isEn);
        return {
          id: item.id,
          slug: item.slug || item.id,
          title,
          description,
          summary,
          year: item.year,
          publishedAt: item.publishedAt,
          formattedDate: formatDate(item.publishedAt),
          author: item.author || '',
          fileUrl: item.fileUrl ? getFullImageUrl(item.fileUrl) : null,
          coverImage: item.coverImageUrl ? getFullImageUrl(item.coverImageUrl) : '/placeholder-publication.jpg',
          status: item.status,
          isActive: item.isActive,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useApiPublicationById = (id: string | undefined) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ['api-publication', id, isEn],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<ApiPublication>(`/publications/${id}`);
      const item = response.data;
      const { title, description, summary } = getLocalizedContent(item.contents, isEn);
      return {
        id: item.id,
        slug: item.slug || item.id,
        title,
        description,
        summary,
        year: item.year,
        publishedAt: item.publishedAt,
        formattedDate: formatDate(item.publishedAt),
        author: item.author || '',
        fileUrl: item.fileUrl ? getFullImageUrl(item.fileUrl) : null,
        coverImage: item.coverImageUrl ? getFullImageUrl(item.coverImageUrl) : '/placeholder-publication.jpg',
        status: item.status,
        isActive: item.isActive,
      } as FormattedPublication;
    },
    enabled: !!id,
  });
};