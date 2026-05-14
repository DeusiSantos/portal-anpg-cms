import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Image, GripVertical, Eye, Upload, X } from 'lucide-react';
import api, { getFullImageUrl } from '@/service/api';
import { fileService } from '@/service/fileService';

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

interface SlideFormData {
  displayOrder: number;
  imageFile?: File;
  existingImageUrl?: string | null;
  titlePt: string;
  subtitlePt: string;
  titleEn: string;
  subtitleEn: string;
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

export default function AdminHeroSlidesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [deleteItem, setDeleteItem] = useState<Slide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>({
    displayOrder: 0,
    titlePt: '',
    subtitlePt: '',
    titleEn: '',
    subtitleEn: '',
    isActive: true,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Buscar slides
  const { data: slidesResponse, isLoading } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const response = await api.get<SlidesResponse>('/cms/slides', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    }
  });

  const slides = slidesResponse?.items || [];

  // Função para fazer upload de imagem
  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const imageUrl = await fileService.uploadImage(file);
      toast.success('Imagem enviada com sucesso!');
      return imageUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Criar slide
  const createMutation = useMutation({
    mutationFn: async (data: SlideFormData) => {
      if (!selectedImageFile) {
        throw new Error('A imagem é obrigatória');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('DisplayOrder', String(data.displayOrder));
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('SubtitlePt', data.subtitlePt);
      formDataToSend.append('TitleEn', data.titleEn);
      formDataToSend.append('SubtitleEn', data.subtitleEn);
      formDataToSend.append('IsActive', String(data.isActive));
      formDataToSend.append('ImageAttachment', selectedImageFile);

      const response = await api.post('/cms/slides/from-form', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Slide criado com sucesso');
      handleClose();
    },
    onError: (e: any) => toast.error(`Erro ao criar: ${e.response?.data?.message || e.message}`)
  });

  // Atualizar slide
  const updateMutation = useMutation({
    mutationFn: async ({ id, data, imageFile }: { id: string; data: SlideFormData; imageFile?: File }) => {
      const formDataToSend = new FormData();
      formDataToSend.append('DisplayOrder', String(data.displayOrder));
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('SubtitlePt', data.subtitlePt);
      formDataToSend.append('TitleEn', data.titleEn);
      formDataToSend.append('SubtitleEn', data.subtitleEn);
      formDataToSend.append('IsActive', String(data.isActive));

      const hasExistingImage = !!data.existingImageUrl;
      const hasNewImage = !!imageFile;
      const shouldRemoveImage = !hasExistingImage && !hasNewImage;
      formDataToSend.append('RemoveImage', String(shouldRemoveImage));

      if (imageFile) {
        formDataToSend.append('ImageAttachment', imageFile);
      }

      const response = await api.patch(`/cms/slides/${id}/from-form`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Slide actualizado com sucesso');
      handleClose();
    },
    onError: (e: any) => toast.error(`Erro ao actualizar: ${e.response?.data?.message || e.message}`)
  });

  // Eliminar slide
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/cms/slides/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Slide eliminado com sucesso');
      setDeleteItem(null);
    },
    onError: (e: any) => toast.error(`Erro ao eliminar: ${e.response?.data?.message || e.message}`)
  });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageUrl);
    }
    setSelectedImageFile(null);
    setCurrentImageUrl('');
    setFormData({
      displayOrder: 0,
      titlePt: '',
      subtitlePt: '',
      titleEn: '',
      subtitleEn: '',
      isActive: true,
    });
  };

  const handleEdit = (slide: Slide) => {
    const ptContent = getSlideContent(slide, 1);
    const enContent = getSlideContent(slide, 2);

    setEditing(slide);
    setFormData({
      displayOrder: slide.displayOrder,
      existingImageUrl: slide.imageUrl,
      titlePt: ptContent.title,
      subtitlePt: ptContent.subtitle,
      titleEn: enContent.title,
      subtitleEn: enContent.subtitle,
      isActive: slide.isActive,
    });

    if (slide.imageUrl) {
      setCurrentImageUrl(getFullImageUrl(slide.imageUrl));
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        data: formData,
        imageFile: selectedImageFile || undefined
      });
    } else {
      if (!selectedImageFile) {
        toast.error('Por favor, selecione uma imagem para o slide');
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageUrl);
      }

      const previewUrl = URL.createObjectURL(file);
      setCurrentImageUrl(previewUrl);
      setSelectedImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageUrl);
    }
    setCurrentImageUrl('');
    setSelectedImageFile(null);

    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const activeSlides = slides.filter(s => s.isActive);
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const maxSlides = 6;

  return (
    <AdminLayout title="Slides Hero" subtitle="Gerir slides da página principal">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Carrossel da Homepage</CardTitle>
                <CardDescription>
                  Gerir as imagens e textos do carrossel Hero. Máximo de {maxSlides} slides.
                  {activeSlides.length > 0 && ` (${activeSlides.length} activo${activeSlides.length > 1 ? 's' : ''})`}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  const nextOrder = slides.length;
                  setEditing(null);
                  setFormData({
                    displayOrder: nextOrder,
                    titlePt: '',
                    subtitlePt: '',
                    titleEn: '',
                    subtitleEn: '',
                    isActive: true,
                  });
                  setSelectedImageFile(null);
                  setCurrentImageUrl('');
                  setIsDialogOpen(true);
                }}
                disabled={slides.length >= maxSlides}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Slide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : slides.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum slide configurado.</p>
                <p className="text-sm">O Hero utilizará as imagens padrão.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {slides.map((slide, idx) => {
                  const ptContent = getSlideContent(slide, 1);
                  const imageUrl = slide.imageUrl ? getFullImageUrl(slide.imageUrl) : null;

                  return (
                    <div
                      key={slide.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        slide.isActive ? 'bg-background' : 'bg-muted/50 opacity-60'
                      }`}
                    >
                      <div className="text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>

                      <div className="flex-shrink-0 w-32 h-20 rounded-md overflow-hidden border bg-muted">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Slide {idx + 1}</span>
                          {!slide.isActive && (
                            <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                          )}
                        </div>
                        {ptContent.title && (
                          <p className="text-sm text-muted-foreground truncate mt-1">{ptContent.title}</p>
                        )}
                        {ptContent.subtitle && (
                          <p className="text-xs text-muted-foreground/60 truncate">{ptContent.subtitle}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteItem(slide)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              {slides.length} / {maxSlides} slides
            </div>
          </CardContent>
        </Card>

        {/* Preview hint */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Pré-visualização</p>
                <p className="text-sm text-muted-foreground">
                  Os slides são apresentados por ordem crescente (campo "Ordem").
                  Se não existirem slides configurados, o Hero utiliza as imagens padrão do sistema.
                  O carrossel roda automaticamente a cada 6 segundos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Slide' : 'Novo Slide do Hero'}</DialogTitle>
            <DialogDescription>
              Configure a imagem e textos opcionais para este slide.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  placeholder="0, 1, 2..."
                />
                <p className="text-xs text-muted-foreground">
                  Os slides são exibidos por ordem crescente
                </p>
              </div>

              <Tabs defaultValue="pt" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pt">Português</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>

                <TabsContent value="pt" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Título (Português)</Label>
                    <Input
                      value={formData.titlePt}
                      onChange={(e) => setFormData({ ...formData, titlePt: e.target.value })}
                      placeholder="Texto principal do slide"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo (Português)</Label>
                    <Input
                      value={formData.subtitlePt}
                      onChange={(e) => setFormData({ ...formData, subtitlePt: e.target.value })}
                      placeholder="Texto secundário do slide"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="en" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="Main slide text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (English)</Label>
                    <Input
                      value={formData.subtitleEn}
                      onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                      placeholder="Secondary slide text"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Imagem do Slide {!editing && '*'}</Label>
                <div className="flex flex-col gap-3">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    required={!editing}
                  />
                  {currentImageUrl && (
                    <div className="relative rounded-md overflow-hidden border">
                      <img
                        src={currentImageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                      {editing && !selectedImageFile && formData.existingImageUrl && (
                        <p className="text-xs text-muted-foreground text-center p-2 bg-muted">
                          Imagem actual - clique no X para trocar
                        </p>
                      )}
                      {selectedImageFile && (
                        <p className="text-xs text-green-600 text-center p-2 bg-green-50">
                          Nova imagem selecionada - será atualizada ao salvar
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                />
                <Label>Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || isUploadingImage}>
                {(isSaving || isUploadingImage) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Guardar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar este slide do Hero?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}