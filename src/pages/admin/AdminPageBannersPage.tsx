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
import api from '@/service/api';
import React from 'react';

interface Attachment {
  id: string;
  fileName: string;
  storedFileName: string;
  contentType: string;
  size: number;
}

interface PageBanner {
  id: string;
  pageKey: string;
  titlePt: string | null;
  subtitlePt: string | null;
  titleEn: string | null;
  subtitleEn: string | null;
  publicationStatus: 'Draft' | 'Published';
  status: 'Active' | 'Inactive';
  bannerCode: string;
  attachments: Attachment[];
}

interface PageBannerFormData {
  pageKey: string;
  titlePt: string;
  subtitlePt: string;
  titleEn: string;
  subtitleEn: string;
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

export default function AdminPageBannersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PageBanner | null>(null);
  const [deleteItem, setDeleteItem] = useState<PageBanner | null>(null);
  const [search, setSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [shouldUpdateImage, setShouldUpdateImage] = useState(false);
  const [formData, setFormData] = useState<PageBannerFormData>({
    pageKey: '',
    titlePt: '',
    titleEn: '',
    subtitlePt: '',
    subtitleEn: ''
  });

  const { data: bannersResponse, isLoading } = useQuery({
    queryKey: ['admin-page-banners'],
    queryFn: async () => {
      const response = await api.get('/banner');
      return response.data;
    }
  });

  const banners = useMemo(() => {
    return bannersResponse?.news?.data || [];
  }, [bannersResponse]);

  const grouped = useMemo(() => {
    if (!banners.length) return [];
    const filtered = banners.filter((b: PageBanner) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.pageKey.toLowerCase().includes(q) || 
             (b.titlePt || '').toLowerCase().includes(q) || 
             (b.titleEn || '').toLowerCase().includes(q);
    });
    const groups: Record<string, PageBanner[]> = {};
    filtered.forEach((b: PageBanner) => {
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

  // Função para buscar imagem do attachment
  const getAttachmentImageUrl = useCallback(async (bannerId: string, attachmentId: string) => {
    try {
      const response = await api.get(`/banner/${bannerId}/attachments/${attachmentId}`, {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      return null;
    }
  }, []);

  // Estado para armazenar URLs das imagens carregadas
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Carregar imagens dos banners
  const loadBannerImage = useCallback(async (banner: PageBanner) => {
    if (banner.attachments && banner.attachments.length > 0) {
      const firstAttachment = banner.attachments[0];
      const url = await getAttachmentImageUrl(banner.id, firstAttachment.id);
      if (url) {
        setImageUrls(prev => ({ ...prev, [banner.id]: url }));
      }
    }
  }, [getAttachmentImageUrl]);

  // Carregar imagens quando os banners são carregados
  useEffect(() => {
    banners.forEach((banner: PageBanner) => {
      loadBannerImage(banner);
    });
    
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [banners, loadBannerImage]);

  // Carregar imagem atual ao editar
  useEffect(() => {
    if (editing && editing.attachments && editing.attachments.length > 0 && !selectedImageFile) {
      const loadCurrentImage = async () => {
        const url = await getAttachmentImageUrl(editing.id, editing.attachments[0].id);
        if (url) {
          setCurrentImageUrl(url);
        }
      };
      loadCurrentImage();
    }
  }, [editing, getAttachmentImageUrl, selectedImageFile]);

  const createMutation = useMutation({
    mutationFn: async (data: PageBannerFormData) => {
      const formDataToSend = new FormData();
      formDataToSend.append('pageKey', data.pageKey);
      formDataToSend.append('titlePt', data.titlePt);
      formDataToSend.append('subtitlePt', data.subtitlePt);
      formDataToSend.append('titleEn', data.titleEn);
      formDataToSend.append('subtitleEn', data.subtitleEn);
      
      if (selectedImageFile) {
        formDataToSend.append('uploadDocs', selectedImageFile);
      }
      
      if (additionalFiles.length > 0) {
        additionalFiles.forEach(file => {
          formDataToSend.append('uploadDocs', file);
        });
      }
      
      const response = await api.post('/banner', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-page-banners'] }); 
      toast.success('Banner criado com sucesso'); 
      handleClose(); 
    },
    onError: (e: any) => toast.error(`Erro ao criar: ${e.response?.data?.message || e.message}`) 
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PageBannerFormData }) => {
      const updateData = {
        banner: {
          id: id,
          pageKey: data.pageKey,
          titlePt: data.titlePt,
          subtitlePt: data.subtitlePt,
          titleEn: data.titleEn,
          subtitleEn: data.subtitleEn
        }
      };
      
      const response = await api.put(`/banner/`, updateData);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-page-banners'] }); 
      toast.success('Dados do banner actualizados com sucesso'); 
    },
    onError: (e: any) => toast.error(`Erro ao actualizar dados: ${e.response?.data?.message || e.message}`) 
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ bannerId, attachmentId, file }: { bannerId: string; attachmentId: string; file: File }) => {
      const formDataToSend = new FormData();
      formDataToSend.append('bannerId', bannerId);
      formDataToSend.append('attachmentId', attachmentId);
      formDataToSend.append('newFile', file);
      
      const response = await api.patch('/banner/file', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-page-banners'] }); 
      toast.success('Imagem do banner actualizada com sucesso'); 
    },
    onError: (e: any) => toast.error(`Erro ao actualizar imagem: ${e.response?.data?.message || e.message}`) 
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/banner/${id}`);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-page-banners'] }); 
      toast.success('Banner eliminado com sucesso'); 
      setDeleteItem(null); 
    },
    onError: (e: any) => toast.error(`Erro ao eliminar: ${e.response?.data?.message || e.message}`) 
  });

  const handleClose = () => { 
    setIsDialogOpen(false); 
    setEditing(null); 
    setAdditionalFiles([]);
    // Limpar previews
    if (selectedImagePreview && selectedImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageUrl);
    }
    setSelectedImagePreview('');
    setSelectedImageFile(null);
    setCurrentImageUrl('');
    setShouldUpdateImage(false);
    setFormData({ 
      pageKey: '', 
      titlePt: '', 
      titleEn: '', 
      subtitlePt: '', 
      subtitleEn: ''
    }); 
  };

  const handleEdit = (b: PageBanner) => {
    setEditing(b);
    setFormData({ 
      pageKey: b.pageKey, 
      titlePt: b.titlePt || '', 
      titleEn: b.titleEn || '', 
      subtitlePt: b.subtitlePt || '', 
      subtitleEn: b.subtitleEn || ''
    });
    setAdditionalFiles([]);
    setSelectedImagePreview('');
    setSelectedImageFile(null);
    setCurrentImageUrl('');
    setShouldUpdateImage(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pageKey) { 
      toast.error('Page key é obrigatório'); 
      return; 
    }
    
    if (editing) {
      // Primeiro atualiza os dados do banner via PUT
      await updateMutation.mutateAsync({ id: editing.id, data: formData });
      
      // Se o usuário trocou a imagem, faz o PATCH
      if (shouldUpdateImage && selectedImageFile && editing.attachments && editing.attachments.length > 0) {
        await updateImageMutation.mutateAsync({
          bannerId: editing.id,
          attachmentId: editing.attachments[0].id,
          file: selectedImageFile
        });
      }
      
      handleClose();
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
      
      // Limpar preview anterior se existir
      if (selectedImagePreview && selectedImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImagePreview);
      }
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageUrl);
      }
      
      const previewUrl = URL.createObjectURL(file);
      setSelectedImagePreview(previewUrl);
      setSelectedImageFile(file);
      setCurrentImageUrl(''); // Limpa a imagem atual
      setShouldUpdateImage(true);
    }
  };

  const handleRemoveImage = () => {
    // Limpar previews
    if (selectedImagePreview && selectedImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageUrl);
    }
    
    setSelectedImagePreview('');
    setSelectedImageFile(null);
    setCurrentImageUrl('');
    setShouldUpdateImage(true);
    
    // Resetar o input file
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalFiles(prev => [...prev, ...files]);
    }
  };

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || updateImageMutation.isPending;
  const totalFiltered = grouped.reduce((sum, g) => sum + g.items.length, 0);

  // Determinar qual imagem mostrar no preview
  const displayImage = selectedImagePreview || currentImageUrl;

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
                      {group.items.map((b: PageBanner) => (
                        <div key={b.id} className="group relative rounded-lg border overflow-hidden bg-background hover:shadow-md transition-shadow">
                          <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                            {imageUrls[b.id] ? (
                              <>
                                <img 
                                  src={imageUrls[b.id]} 
                                  alt={b.titlePt || b.pageKey} 
                                  className="w-full h-full object-cover"
                                  onError={() => {
                                    console.error('Failed to load image for banner:', b.id);
                                    setImageUrls(prev => ({ ...prev, [b.id]: '' }));
                                  }}
                                />
                                
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Image className="h-10 w-10 text-muted-foreground/30" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              {b.status === 'Active' ? (
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
                            {b.bannerCode && (
                              <div className="absolute bottom-2 left-2">
                                <span className="inline-flex items-center gap-1 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                  {b.bannerCode}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-medium truncate">{b.pageKey}</p>
                              <p className="text-xs text-muted-foreground truncate">{b.titlePt || 'Sem título'}</p>
                              {b.attachments && b.attachments.length > 1 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📎 {b.attachments.length - 1} anexo(s)
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(b)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteItem(b)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </main>

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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título PT</Label>
                  <Input 
                    value={formData.titlePt} 
                    onChange={e => setFormData({...formData, titlePt: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título EN</Label>
                  <Input 
                    value={formData.titleEn} 
                    onChange={e => setFormData({...formData, titleEn: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtítulo PT</Label>
                  <Input 
                    value={formData.subtitlePt} 
                    onChange={e => setFormData({...formData, subtitlePt: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo EN</Label>
                  <Input 
                    value={formData.subtitleEn} 
                    onChange={e => setFormData({...formData, subtitleEn: e.target.value})} 
                  />
                </div>
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
                    {editing && !selectedImagePreview && currentImageUrl && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Imagem actual - clique no X para trocar
                      </p>
                    )}
                    {selectedImagePreview && (
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
                          <span className="font-semibold">Clique para fazer upload</span> da imagem principal
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

              {/* Anexos adicionais - apenas para criação */}
              {!editing && (
                <div className="space-y-2">
                  <Label>Anexos Adicionais (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      onChange={handleAdditionalFilesChange}
                      className="flex-1"
                      accept="image/*,application/pdf"
                    />
                  </div>
                  {additionalFiles.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {additionalFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                          <span className="truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdditionalFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Guardar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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