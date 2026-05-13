// services/fileService.ts
import api from '@/service/api';

export interface UploadResponse {
  url: string;
  path: string;
  fileName: string;
  size: number;
  contentType: string;
}

class FileService {
  private baseURL: string;

  constructor() {
    // Pega a base URL sem o /api
    this.baseURL = api.defaults.baseURL?.replace('/api/', '') || '';
  }

  async uploadImage(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Por favor, selecione um arquivo de imagem válido');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }

    const formData = new FormData();
    formData.append('File', file);

    const response = await api.post<UploadResponse>('files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Construir URL completa
    const fullImageUrl = `${this.baseURL}${response.data.url}`;
    return fullImageUrl;
  }

  async deleteImage(path: string): Promise<void> {
    await api.delete(`files/${encodeURIComponent(path)}`);
  }

  getImageUrl(path: string): string {
    return `${this.baseURL}/api/files/${encodeURIComponent(path)}`;
  }
}

export const fileService = new FileService();