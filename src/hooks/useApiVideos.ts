// hooks/useApiVideos.ts - VERSÃO CORRIGIDA (sem useTranslation)
import { useQuery } from "@tanstack/react-query";
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
  externalId: string | null;
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
  isDeleted?: boolean;
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

// Hook que recebe o idioma como parâmetro
export const useApiVideos = (isEn: boolean = false) => {
  return useQuery<FormattedVideo[]>({
    queryKey: ['api-videos', isEn],
    queryFn: async () => {
      try {
        console.log('Buscando vídeos da API...');
        
        const response = await api.get('/videos', {
          params: { page: 1, pageSize: 100 }
        });
        
        console.log('API Videos Response:', response.data);
        
        const items = response.data?.items || [];
        
        if (items.length === 0) {
          console.warn('Nenhum vídeo retornado da API');
          return [];
        }
        
        // Filtrar apenas vídeos ativos e não deletados
        const activeVideos = items.filter((item: ApiVideo) => 
          item.isActive === true && 
          item.isDeleted === false
        );
        
        console.log('Vídeos ativos encontrados:', activeVideos.length);
        
        if (activeVideos.length === 0) {
          console.warn('Nenhum vídeo ativo encontrado');
          return [];
        }
        
        return activeVideos.map((item: ApiVideo) => {
          const { title, description, body } = getLocalizedContent(item.contents, isEn);
          return {
            id: item.id,
            slug: item.slug || item.id,
            title: title || 'Sem título',
            description: description || 'Sem descrição',
            body: body || '',
            embedUrl: item.embedUrl || '',
            thumbnail: item.thumbnailUrl ? getFullImageUrl(item.thumbnailUrl) : '/placeholder-video.jpg',
            durationSeconds: item.durationSeconds || 0,
            publishedAt: item.publishedAt || new Date().toISOString(),
            formattedDate: formatDate(item.publishedAt),
            providerType: item.providerType || 1,
            status: item.status,
            isActive: item.isActive,
          };
        });
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para buscar vídeo por ID
export const useApiVideoById = (id: string | undefined, isEn: boolean = false) => {
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
        title: title || 'Sem título',
        description: description || 'Sem descrição',
        body: body || '',
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