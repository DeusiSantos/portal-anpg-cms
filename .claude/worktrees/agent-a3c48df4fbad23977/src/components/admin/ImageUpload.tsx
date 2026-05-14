import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageCropDialog } from './ImageCropDialog';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
  className?: string;
  /** Max width in px – image will be resized if larger */
  maxWidth?: number;
  /** Max height in px – image will be resized if larger */
  maxHeight?: number;
  /** JPEG/WebP quality 0-1 (default 0.82) */
  quality?: number;
  /** Max file size in MB before compression (default 5) */
  maxSizeMB?: number;
  /** Enable interactive crop dialog (default true) */
  enableCrop?: boolean;
  /** Fixed aspect ratio for cropper (e.g. 16/9) */
  cropAspectRatio?: number;
}

/**
 * Loads an image file into an HTMLImageElement and returns its natural dimensions.
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Compresses / resizes an image on a canvas and returns a Blob.
 * – Maintains aspect ratio
 * – Converts to WebP for best compression (JPEG fallback)
 */
async function compressImage(
  file: File | Blob,
  maxW: number,
  maxH: number,
  quality: number,
): Promise<{ blob: Blob; width: number; height: number; wasResized: boolean }> {
  const img = await loadImage(file);
  let { naturalWidth: w, naturalHeight: h } = img;
  const wasResized = w > maxW || h > maxH;

  if (w > maxW) {
    h = Math.round(h * (maxW / w));
    w = maxW;
  }
  if (h > maxH) {
    w = Math.round(w * (maxH / h));
    h = maxH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) return resolve(b);
        canvas.toBlob(
          (bJpeg) => (bJpeg ? resolve(bJpeg) : reject(new Error('Compression failed'))),
          'image/jpeg',
          quality,
        );
      },
      'image/webp',
      quality,
    );
  });

  return { blob, width: w, height: h, wasResized };
}

export function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Imagem',
  accept = 'image/jpeg,image/png,image/webp',
  className,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.82,
  maxSizeMB = 5,
  enableCrop = true,
  cropAspectRatio,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const pendingFileRef = useRef<File | null>(null);

  const uploadBlob = async (blob: Blob, originalSize: number) => {
    setIsUploading(true);
    try {
      const { blob: compressed, width, height, wasResized } = await compressImage(blob, maxWidth, maxHeight, quality);

      const savedPct = Math.round((1 - compressed.size / originalSize) * 100);
      const info = wasResized
        ? `Redimensionado para ${width}×${height}px • ${(compressed.size / 1024).toFixed(0)}KB (−${savedPct}%)`
        : savedPct > 5
          ? `Comprimido: ${(compressed.size / 1024).toFixed(0)}KB (−${savedPct}%)`
          : `${width}×${height}px • ${(compressed.size / 1024).toFixed(0)}KB`;
      setCompressionInfo(info);

      const ext = compressed.type === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('cms-assets')
        .upload(fileName, compressed, {
          cacheControl: '3600',
          upsert: false,
          contentType: compressed.type,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cms-assets')
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);
      toast.success('Imagem carregada com sucesso');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Ficheiro demasiado grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    if (enableCrop) {
      // Open crop dialog instead of uploading directly
      pendingFileRef.current = file;
      const objectUrl = URL.createObjectURL(file);
      setPendingImageSrc(objectUrl);
      setCropDialogOpen(true);
    } else {
      // Direct upload (legacy behaviour)
      setCompressionInfo(null);
      await uploadBlob(file, file.size);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropDialogOpen(false);
    const originalSize = pendingFileRef.current?.size ?? croppedBlob.size;
    // Clean up object URL
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
    pendingFileRef.current = null;
    setCompressionInfo(null);
    await uploadBlob(croppedBlob, originalSize);
  };

  const handleCropClose = () => {
    setCropDialogOpen(false);
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
    pendingFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    onChange('');
    setCompressionInfo(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>

      {value ? (
        <div className="relative group">
          <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className="ml-1">Substituir</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {compressionInfo && (
            <p className="text-xs text-status-success-foreground mt-1">{compressionInfo}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1 truncate">{value}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">A comprimir e carregar...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Clique para carregar imagem</span>
              <span className="text-xs text-muted-foreground/60">
                JPG, PNG ou WebP • Máx. {maxSizeMB}MB • Até {maxWidth}×{maxHeight}px
              </span>
            </>
          )}
        </button>
      )}

      {/* Manual URL input as fallback */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ou cole um URL de imagem..."
        className="text-xs"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Crop dialog */}
      {pendingImageSrc && (
        <ImageCropDialog
          open={cropDialogOpen}
          onClose={handleCropClose}
          imageSrc={pendingImageSrc}
          aspectRatio={cropAspectRatio}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
