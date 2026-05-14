import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Plus, Pencil, Trash2, Loader2, Image, Search, Eye, EyeOff, 
  ChevronDown, ChevronRight, Building2, Fuel, TrendingUp, 
  Scale, Database, Wallet, FileText, Upload, X 
} from 'lucide-react';
import api, { getFullImageUrl } from '@/service/api';
import { fileService } from '@/service/fileService';
import React from 'react';

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

interface BannerFormData {
  pageKey: string;
  overlayOpacity: number;
  titlePt: string;
  subtitlePt: string;
  titleEn: string;
  subtitleEn: string;
  isActive: boolean;
}

const SECTION_MAP: Record<string, { label: string; order: number; icon: React.ReactNode }> = {
  'Institucional': { label: 'Institucional', order: 0, icon: <Building2 className="h-4 w-4" /> },
  'Exploração & Produção': { label: 'Exploração & Produção', order: 1, icon: <Fuel className="h-4 w-4" /> },
  'Oportunidades': { label: 'Oportunidades', order: 2, icon: <TrendingUp className="h-4 w-4" /> },
  'Regulação': { label: 'Regulação', order: 3, icon: <Scale className="h-4 w-4" /> },
  'Dados & Media': { label: 'Dados & Media', order: 4, icon: <Database className="h-4 w-4" /> },
  'Portal do Investidor': { label: 'Portal do Investidor', order: 5, icon: <Wallet className="h-4 w-4" /> },
  'Outras': { label: 'Outras', order: 6, icon: <FileText className="h-4 w-4" /> }
};

function getSection(pageKey: string): string {
  const map: Record<string, string> = {
    about: 'Institucional', anpg: 'Institucional', history: 'Institucional', 'board-member': 'Institucional',
    'pca-message': 'Institucional', 'social-responsibility': 'Institucional', contacts: 'Institucional',
    'local-content': 'Institucional', sustainability: 'Institucional',
    exploration: 'Exploração & Produção', production: 'Exploração & Produção',
    'production-history': 'Exploração & Produção', 'new-areas': 'Exploração & Produção',
    processing: 'Exploração & Produção', 'seismic-campaigns': 'Exploração & Produção',
    'seismic-map': 'Exploração & Produção',
    opportunities: 'Oportunidades', gas: 'Oportunidades', 'energy-integration': 'Oportunidades',
    'permanent-offer': 'Oportunidades', 'tender-2023': 'Oportunidades', 'tender-2025': 'Oportunidades',
    regulation: 'Regulação', licensing: 'Regulação', oversight: 'Regulação', tenders: 'Regulação',
    data: 'Dados & Media', 'data-packages': 'Dados & Media', 'ep-data': 'Dados & Media',
    'ep-maps': 'Dados & Media', 'block-details': 'Dados & Media',
    'conference-2021': 'Dados & Media', 'conference-2023': 'Dados & Media',
    'iona': 'Dados & Media', 'oasis': 'Dados & Media',
    media: 'Dados & Media', events: 'Dados & Media', 'news-archive': 'Dados & Media',
    'investor-login': 'Portal do Investidor', 'investor-portal': 'Portal do Investidor',
    'investor-reset': 'Portal do Investidor' };
  return map[pageKey] || 'Outras';
}

// Função para obter conteúdo do banner por idioma
const getBannerContent = (banner: Banner, lang: number): { title: string; subtitle: string } => {
  const content = banner.contents?.find(c => c.lang === lang);
  return {
    title: content?.title || '',
    subtitle: content?.subtitle || ''
  };
};

export default function AdminPageBannersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteItem, setDeleteItem] = useState<Banner | null>(null);
  const [search, setSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState<BannerFormData>({
    pageKey: '',
    overlayOpacity: 0,
    titlePt: '',
    subtitlePt: '',
    titleEn: '',
    subtitleEn: '',
    isActive: true
  });

  // Buscar banners
  const { data: bannersResponse, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const response = await api.get<BannersResponse>('/cms/banners', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    }
  });

  const banners = useMemo(() => {
    return bannersResponse?.items || [];
  }, [bannersResponse]);

  // Agrupar banners por secção
  const grouped = useMemo(() => {
    if (!banners.length) return [];
    const filtered = banners.filter((b: Banner) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const ptContent = getBannerContent(b, 1);
      const enContent = getBannerContent(b, 2);
      return b.pageKey.toLowerCase().includes(q) || 
             ptContent.title.toLowerCase().includes(q) || 
             enContent.title.toLowerCase().includes(q);
    });
    const groups: Record<string, Banner[]> = {};
    filtered.forEach((b: Banner) => {
      const section = getSection(b.pageKey);
      if (!groups[section]) groups[section] = [];
      groups[section].push(b);
    });
    return Object.entries(groups)
      .map(([name, items]) => ({ name, ...SECTION_MAP[name], items }))
      .sort((a, b) => a.order - b.order);
  }, [banners, search]);

  const toggleSection = (name: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

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

  // Criar banner
  const createMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      if (!selectedImageFile) {
        throw new Error('A imagem é obrigatória');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('PageKey', data.pageKey);
      formDataToSend.append('OverlayOpacity', String(data.overlayOpacity));
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('SubtitlePt', data.subtitlePt);
      formDataToSend.append('TitleEn', data.titleEn);
      formDataToSend.append('SubtitleEn', data.subtitleEn);
      formDataToSend.append('IsActive', String(data.isActive));
      formDataToSend.append('ImageAttachment', selectedImageFile);

      const response = await api.post('/cms/banners/from-form', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); 
      toast.success('Banner criado com sucesso'); 
      handleClose(); 
    },
    onError: (e: any) => toast.error(`Erro ao criar: ${e.response?.data?.message || e.message}`) 
  });

  // Atualizar banner
  const updateMutation = useMutation({
    mutationFn: async ({ id, data, imageFile }: { id: string; data: BannerFormData; imageFile?: File }) => {
      const formDataToSend = new FormData();
      formDataToSend.append('PageKey', data.pageKey);
      formDataToSend.append('OverlayOpacity', String(data.overlayOpacity));
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('SubtitlePt', data.subtitlePt);
      formDataToSend.append('TitleEn', data.titleEn);
      formDataToSend.append('SubtitleEn', data.subtitleEn);
      formDataToSend.append('IsActive', String(data.isActive));

      const hasExistingImage = !!editing?.imageUrl;
      const hasNewImage = !!imageFile;
      const shouldRemoveImage = !hasExistingImage && !hasNewImage;
      formDataToSend.append('RemoveImage', String(shouldRemoveImage));

      if (imageFile) {
        formDataToSend.append('ImageAttachment', imageFile);
      }

      const response = await api.patch(`/cms/banners/${id}/from-form`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); 
      toast.success('Banner actualizado com sucesso'); 
      handleClose(); 
    },
    onError: (e: any) => toast.error(`Erro ao actualizar: ${e.response?.data?.message || e.message}`) 
  });

  // Eliminar banner
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/cms/banners/${id}`);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); 
      toast.success('Banner eliminado com sucesso'); 
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
      pageKey: '', 
      overlayOpacity: 0,
      titlePt: '', 
      subtitlePt: '', 
      titleEn: '', 
      subtitleEn: '',
      isActive: true
    }); 
  };

  const handleEdit = (banner: Banner) => {
    const ptContent = getBannerContent(banner, 1);
    const enContent = getBannerContent(banner, 2);
    
    setEditing(banner);
    setFormData({ 
      pageKey: banner.pageKey,
      overlayOpacity: banner.overlayOpacity,
      titlePt: ptContent.title,
      subtitlePt: ptContent.subtitle,
      titleEn: enContent.title,
      subtitleEn: enContent.subtitle,
      isActive: banner.isActive
    });
    
    if (banner.imageUrl) {
      setCurrentImageUrl(getFullImageUrl(banner.imageUrl));
    }
    
    setSelectedImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pageKey) { 
      toast.error('Page key é obrigatório'); 
      return; 
    }
    
    if (editing) {
      await updateMutation.mutateAsync({ 
        id: editing.id, 
        data: formData,
        imageFile: selectedImageFile || undefined
      });
    } else {
      if (!selectedImageFile) {
        toast.error('Por favor, selecione uma imagem para o banner');
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

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const totalFiltered = grouped.reduce((sum, g) => sum + g.items.length, 0);

  // Determinar qual imagem mostrar no preview
  const displayImage = currentImageUrl;

  return (
    <AdminLayout title="Banners de Página" subtitle="Gerir banners das páginas">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Banners de Página</h1>
            <p className="text-muted-foreground text-sm">Gerir imagens de cabeçalho, títulos e subtítulos — {banners?.length || 0} banner(s)</p>
          </div>
          <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Banner
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por página ou título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : totalFiltered === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {search ? 'Nenhum banner encontrado para a pesquisa' : 'Nenhum banner registado'}
            </CardContent>
          </Card>
        ) : (
          grouped.map(group => {
            const isCollapsed = collapsedSections.has(group.name);
            return (
              <Card key={group.name}>
                <button
                  onClick={() => toggleSection(group.name)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {group.icon}
                    <span className="text-lg font-semibold">{group.label}</span>
                    <Badge variant="secondary" className="text-xs">{group.items.length}</Badge>
                  </div>
                  {isCollapsed ? 
                    <ChevronRight className="h-5 w-5 text-muted-foreground" /> : 
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  }
                </button>
                {!isCollapsed && (
                  <CardContent className="pt-0 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {group.items.map((banner: Banner) => {
                        const ptContent = getBannerContent(banner, 1);
                        const imageUrl = banner.imageUrl ? getFullImageUrl(banner.imageUrl) : null;
                        
                        return (
                          <div key={banner.id} className="group relative rounded-lg border overflow-hidden bg-background hover:shadow-md transition-shadow">
                            <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                              {imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={ptContent.title || banner.pageKey} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Failed to load image for banner:', banner.id);
                                    e.currentTarget.src = '/placeholder-image.jpg';
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Image className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                {banner.isActive ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    <Eye className="h-3 w-3" />
                                    Activo
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-gray-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    <EyeOff className="h-3 w-3" />
                                    Inactivo
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-3 flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="font-mono text-sm font-medium truncate">{banner.pageKey}</p>
                                <p className="text-xs text-muted-foreground truncate">{ptContent.title || 'Sem título'}</p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(banner)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteItem(banner)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </main>

      {/* Modal de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
            <DialogDescription>Configure o banner de cabeçalho da página</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Page Key *</Label>
                <Input 
                  value={formData.pageKey} 
                  onChange={e => setFormData({...formData, pageKey: e.target.value})} 
                  placeholder="Ex: about, production, faq" 
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  Identificador único da página (ex: about, anpg, history)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Opacidade da Sobreposição</Label>
                <Input 
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.overlayOpacity} 
                  onChange={e => setFormData({...formData, overlayOpacity: parseFloat(e.target.value)})} 
                  placeholder="0 = sem sobreposição, 1 = totalmente escuro"
                />
                <p className="text-xs text-muted-foreground">
                  Valor entre 0 e 1. Recomendado: 0.4 a 0.6
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título (Português)</Label>
                  <Input 
                    value={formData.titlePt} 
                    onChange={e => setFormData({...formData, titlePt: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título (English)</Label>
                  <Input 
                    value={formData.titleEn} 
                    onChange={e => setFormData({...formData, titleEn: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtítulo (Português)</Label>
                  <Input 
                    value={formData.subtitlePt} 
                    onChange={e => setFormData({...formData, subtitlePt: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo (English)</Label>
                  <Input 
                    value={formData.subtitleEn} 
                    onChange={e => setFormData({...formData, subtitleEn: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Activo</Label>
              </div>
              
              {/* Imagem do Banner */}
              <div className="space-y-2">
                <Label>Imagem do Banner {!editing && '*'}</Label>
                {displayImage ? (
                  <div className="relative">
                    <img 
                      src={displayImage} 
                      alt="Preview" 
                      className="w-full h-48 object-contain rounded-lg border bg-muted"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {editing && !selectedImageFile && currentImageUrl && !currentImageUrl.startsWith('blob:') && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Imagem actual - clique no X para trocar
                      </p>
                    )}
                    {selectedImageFile && (
                      <p className="text-xs text-green-600 mt-2 text-center">
                        Nova imagem selecionada - será atualizada ao salvar
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Clique para fazer upload</span> da imagem
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 5MB</p>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        required={!editing}
                      />
                    </label>
                  </div>
                )}
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

      {/* Modal de confirmação de eliminação */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o banner da página "{deleteItem?.pageKey}"?
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