// hooks/useHeroSlides.ts
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api, { getFullImageUrl } from "@/service/api";

// Tipos da API
interface SlideContent {
  lang: number;
  title: string;
  subtitle: string;
}

interface Slide {
  id: string;
  imageUrl: string | null;
  imagePath: string | null;
  displayOrder: number;
  contents: SlideContent[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface SlidesResponse {
  items: Slide[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HeroSlideData {
  id: string;
  image: string;
  title_pt: string;
  title_en: string;
  subtitle_pt: string;
  subtitle_en: string;
  displayOrder: number;
  isActive: boolean;
}

// Função para obter conteúdo do slide por idioma
const getSlideContent = (slide: Slide, lang: number): { title: string; subtitle: string } => {
  const content = slide.contents?.find(c => c.lang === lang);
  return {
    title: content?.title || '',
    subtitle: content?.subtitle || ''
  };
};

export function useHeroSlides() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery({
    queryKey: ["hero-slides", isEn],
    queryFn: async () => {
      try {
        const response = await api.get<SlidesResponse>('/cms/slides', {
          params: { Page: 1, PageSize: 100 }
        });
        
        const slides: Slide[] = response.data.items || [];
        
        // Filtrar apenas slides ativos e ordenar por displayOrder
        const activeSlides = slides
          .filter(slide => slide.isActive === true)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        
        // Formatar slides para o formato esperado pelo componente
        const formattedSlides: HeroSlideData[] = activeSlides.map(slide => {
          const ptContent = getSlideContent(slide, 1);
          const enContent = getSlideContent(slide, 2);
          
          return {
            id: slide.id,
            image: slide.imageUrl ? getFullImageUrl(slide.imageUrl) : '',
            title_pt: ptContent.title,
            title_en: enContent.title,
            subtitle_pt: ptContent.subtitle,
            subtitle_en: enContent.subtitle,
            displayOrder: slide.displayOrder,
            isActive: slide.isActive,
          };
        });
        
        return formattedSlides;
      } catch (error) {
        console.error('Erro ao buscar slides:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}