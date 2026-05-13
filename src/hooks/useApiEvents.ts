// hooks/useApiEvents.ts (versão atualizada com categorias)
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api, { getFullImageUrl } from "@/service/api";

// ─── Types for API Response ───
export interface EventContent {
  lang: number;
  title: string | null;
  description: string | null;
  body: string | null;
}

export interface ApiEvent {
  slug: string;
  startAt: string;
  endAt: string;
  location: string;
  mapUrl: string | null;
  registrationUrl: string | null;
  featuredImageUrl: string;
  featuredImagePath: string;
  categoryId: string;
  status: number;
  contents: EventContent[];
  id: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface ApiEventsResponse {
  items: ApiEvent[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EventCategoryContent {
  lang: number;
  name: string | null;
  description: string | null;
}

export interface EventCategory {
  slug: string;
  displayOrder: number;
  contents: EventCategoryContent[];
  id: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface EventCategoriesResponse {
  items: EventCategory[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FormattedEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  startAt: string;
  endAt: string;
  formattedStartDate: string;
  formattedEndDate: string;
  location: string;
  mapUrl: string | null;
  registrationUrl: string | null;
  image: string;
  status: number;
  isActive: boolean;
  rawStartDate: string;
  rawEndDate: string;
  categoryId: string;
  categoryName: string;
}

export interface FormattedEventCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
}

// Função para formatar data em português
const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Função para obter o conteúdo baseado no idioma
const getLocalizedContent = (contents: EventContent[], isEn: boolean) => {
  const portugueseContent = contents.find(content => content.lang === 1);
  const englishContent = contents.find(content => content.lang === 2);
  
  const selectedContent = isEn && englishContent ? englishContent : portugueseContent;
  
  return {
    title: selectedContent?.title || "",
    description: selectedContent?.description || "",
    body: selectedContent?.body || ""
  };
};

const getLocalizedCategory = (contents: EventCategoryContent[], isEn: boolean) => {
  const portugueseContent = contents.find(content => content.lang === 1);
  const englishContent = contents.find(content => content.lang === 2);
  
  const selectedContent = isEn && englishContent ? englishContent : portugueseContent;
  
  return {
    name: selectedContent?.name || "",
    description: selectedContent?.description || ""
  };
};

// Hook para buscar categorias de eventos
export const useEventCategories = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return useQuery<FormattedEventCategory[]>({
    queryKey: ['event-categories', isEn],
    queryFn: async () => {
      const response = await api.get<EventCategoriesResponse>('/event-categories', {
        params: {
          Page: 1,
          PageSize: 100,
          IsActive: true
        }
      });
      
      const categories = response.data.items || [];
      
      return categories
        .filter(cat => cat.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((category) => {
          const { name, description } = getLocalizedCategory(category.contents, isEn);
          return {
            id: category.id,
            slug: category.slug,
            name: name || category.slug,
            description: description || "",
            displayOrder: category.displayOrder,
          };
        });
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para buscar todos os eventos
export const useApiEvents = (page: number = 1, pageSize: number = 100, status: number = 1) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  
  // Buscar categorias também
  const { data: categories } = useEventCategories();

  return useQuery<FormattedEvent[]>({
    queryKey: ['api-events', page, pageSize, status, isEn],
    queryFn: async () => {
      const response = await api.get<ApiEventsResponse>('/events', {
        params: {
          Page: page,
          PageSize: pageSize,
          Status: status,
          IsActive: true
        }
      });
      
      const events = response.data.items || [];
      
      // Criar um mapa de categorias para acesso rápido
      const categoryMap = new Map<string, string>();
      if (categories) {
        categories.forEach(cat => {
          categoryMap.set(cat.id, cat.name);
        });
      }
      
      return events.map((event) => {
        const { title, description, body } = getLocalizedContent(event.contents, isEn);
        
        return {
          id: event.id,
          slug: event.slug || event.id,
          title,
          description,
          body,
          startAt: event.startAt,
          endAt: event.endAt,
          formattedStartDate: formatEventDate(event.startAt),
          formattedEndDate: formatEventDate(event.endAt),
          location: event.location,
          mapUrl: event.mapUrl,
          registrationUrl: event.registrationUrl,
          image: event.featuredImageUrl ? getFullImageUrl(event.featuredImageUrl) : '/placeholder-event.jpg',
          status: event.status,
          isActive: event.isActive,
          rawStartDate: event.startAt,
          rawEndDate: event.endAt,
          categoryId: event.categoryId,
          categoryName: categoryMap.get(event.categoryId) || "Sem categoria",
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para buscar um evento específico por ID
export const useApiEventById = (id: string | undefined) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  
  const { data: categories } = useEventCategories();

  return useQuery<FormattedEvent | null>({
    queryKey: ['api-event', id, isEn],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await api.get<ApiEvent>(`/events/${id}`);
        const event = response.data;
        
        if (!event) return null;
        
        const { title, description, body } = getLocalizedContent(event.contents, isEn);
        
        // Encontrar o nome da categoria
        let categoryName = "Sem categoria";
        if (categories) {
          const category = categories.find(cat => cat.id === event.categoryId);
          if (category) categoryName = category.name;
        }
        
        return {
          id: event.id,
          slug: event.slug || event.id,
          title,
          description,
          body,
          startAt: event.startAt,
          endAt: event.endAt,
          formattedStartDate: formatEventDate(event.startAt),
          formattedEndDate: formatEventDate(event.endAt),
          location: event.location,
          mapUrl: event.mapUrl,
          registrationUrl: event.registrationUrl,
          image: event.featuredImageUrl ? getFullImageUrl(event.featuredImageUrl) : '/placeholder-event.jpg',
          status: event.status,
          isActive: event.isActive,
          rawStartDate: event.startAt,
          rawEndDate: event.endAt,
          categoryId: event.categoryId,
          categoryName: categoryName,
        };
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};