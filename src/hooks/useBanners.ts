// src/hooks/useBanners.ts
import api, { getFullImageUrl } from "@/service/api";
import { useQuery } from "@tanstack/react-query";

// Tipos da API
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

export interface FormattedBanner {
  id: string;
  pageKey: string;
  titlePt: string;
  subtitlePt: string;
  titleEn: string;
  subtitleEn: string;
  imageUrl: string | null;
  overlayOpacity: number;
  isActive: boolean;
}

// Função para obter conteúdo do banner por idioma
const getBannerContent = (banner: Banner, lang: number): { title: string; subtitle: string } => {
  const content = banner.contents?.find(c => c.lang === lang);
  return {
    title: content?.title || '',
    subtitle: content?.subtitle || ''
  };
};

export function useBanners(pageKey: string) {
  return useQuery({
    queryKey: ["banners", pageKey],
    queryFn: async () => {
      const response = await api.get<BannersResponse>('/cms/banners', {
        params: { Page: 1, PageSize: 100 }
      });

      const banners = response.data.items;

      return banners
        .filter((banner: Banner) => 
          banner.pageKey?.toLowerCase() === pageKey.toLowerCase() && 
          banner.isActive === true
        )
        .map((banner: Banner): FormattedBanner => {
          const ptContent = getBannerContent(banner, 1);
          const enContent = getBannerContent(banner, 2);
          
          return {
            id: banner.id,
            pageKey: banner.pageKey.toLowerCase(),
            titlePt: ptContent.title,
            subtitlePt: ptContent.subtitle,
            titleEn: enContent.title,
            subtitleEn: enContent.subtitle,
            imageUrl: banner.imageUrl ? getFullImageUrl(banner.imageUrl) : null,
            overlayOpacity: banner.overlayOpacity,
            isActive: banner.isActive,
          };
        });
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!pageKey,
  });
}