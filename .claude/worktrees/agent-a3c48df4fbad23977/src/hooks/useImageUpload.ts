// hooks/useImageUpload.ts
import { fileService } from '@/service/fileService';
import { useState } from 'react';
import { toast } from 'sonner';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      const imageUrl = await fileService.uploadImage(file);
      toast.success('Imagem enviada com sucesso!');
      return imageUrl;
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar imagem');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
}