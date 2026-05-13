import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import api, { getFullImageUrl } from '@/service/api';
import { fileService } from '@/service/fileService';

// Tipos da API
interface TimelineContent {
  lang: number;
  title: string;
  description: string;
}

interface TimelineItem {
  id: string;
  year: number;
  displayOrder: number;
  imageUrl: string | null;
  imagePath: string | null;
  contents: TimelineContent[];
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface TimelineResponse {
  items: TimelineItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface TimelineFormData {
  year: number;
  displayOrder: number;
  imageFile?: File;
  existingImageUrl?: string | null;
  titlePt: string;
  descriptionPt: string;
  titleEn: string;
  descriptionEn: string;
  isActive: boolean;
}

// Função para obter conteúdo em português
const getPortugueseContent = (item: TimelineItem): TimelineContent | undefined => {
  return item.contents?.find(c => c.lang === 1);
};

// Função para obter conteúdo em inglês
const getEnglishContent = (item: TimelineItem): TimelineContent | undefined => {
  return item.contents?.find(c => c.lang === 2);
};

export default function AdminHistoryEventsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<TimelineItem | null>(null);
  const [formData, setFormData] = useState<TimelineFormData>({
    year: new Date().getFullYear(),
    displayOrder: 0,
    titlePt: '',
    descriptionPt: '',
    titleEn: '',
    descriptionEn: '',
    isActive: true,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Buscar eventos da timeline
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['admin-timeline-events'],
    queryFn: async () => {
      const response = await api.get<TimelineResponse>('/timelines', {
        params: { Page: 1, PageSize: 100 }
      });
      // Ordenar por ano e displayOrder
      const sorted = response.data.items.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.displayOrder - b.displayOrder;
      });
      return sorted;
    },
  });

  const events = eventsData || [];

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

  // Criar evento
  const createMutation = useMutation({
    mutationFn: async (data: TimelineFormData) => {
      const formDataToSend = new FormData();
      
      formDataToSend.append('Year', String(data.year));
      formDataToSend.append('DisplayOrder', String(data.displayOrder));
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('DescriptionPt', data.descriptionPt);
      formDataToSend.append('TitleEn', data.titleEn || '');
      formDataToSend.append('DescriptionEn', data.descriptionEn || '');
      formDataToSend.append('IsActive', String(data.isActive));

      if (data.imageFile) {
        formDataToSend.append('ImageAttachment', data.imageFile);
      }

      const response = await api.post('/timelines/from-form', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-timeline-events'] });
      toast.success('Evento criado com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao criar evento:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar evento');
    },
  });

  // Atualizar evento
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TimelineFormData }) => {
      const formDataToSend = new FormData();
      
      formDataToSend.append('Year', String(data.year));
      formDataToSend.append('DisplayOrder', String(data.displayOrder));
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('DescriptionPt', data.descriptionPt);
      formDataToSend.append('TitleEn', data.titleEn || '');
      formDataToSend.append('DescriptionEn', data.descriptionEn || '');
      formDataToSend.append('IsActive', String(data.isActive));

      // Verificar se deve remover a imagem
      const hasExistingImage = !!data.existingImageUrl;
      const hasNewImage = !!data.imageFile;
      const shouldRemoveImage = !hasExistingImage && !hasNewImage;
      
      formDataToSend.append('RemoveImage', String(shouldRemoveImage));

      if (data.imageFile) {
        formDataToSend.append('ImageAttachment', data.imageFile);
      }

      const response = await api.patch(`/timelines/${id}/from-form`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-timeline-events'] });
      toast.success('Evento actualizado com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao actualizar evento:', error);
      toast.error(error.response?.data?.message || 'Erro ao actualizar evento');
    },
  });

  // Eliminar evento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/timelines/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-timeline-events'] });
      toast.success('Evento eliminado com sucesso');
      setDeleteItem(null);
    },
    onError: (error: any) => {
      console.error('Erro ao eliminar evento:', error);
      toast.error(error.response?.data?.message || 'Erro ao eliminar evento');
    },
  });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setSelectedImageFile(null);
    setCurrentImageUrl('');
    setFormData({
      year: new Date().getFullYear(),
      displayOrder: 0,
      titlePt: '',
      descriptionPt: '',
      titleEn: '',
      descriptionEn: '',
      isActive: true,
    });
  };

  const handleEdit = (item: TimelineItem) => {
    const ptContent = getPortugueseContent(item);
    const enContent = getEnglishContent(item);
    
    setEditing(item);
    setFormData({
      year: item.year,
      displayOrder: item.displayOrder,
      existingImageUrl: item.imageUrl,
      titlePt: ptContent?.title || '',
      descriptionPt: ptContent?.description || '',
      titleEn: enContent?.title || '',
      descriptionEn: enContent?.description || '',
      isActive: item.isActive,
    });
    
    if (item.imageUrl) {
      setCurrentImageUrl(getFullImageUrl(item.imageUrl));
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titlePt) {
      toast.error('Título em português é obrigatório');
      return;
    }
    
    if (!formData.year) {
      toast.error('Ano é obrigatório');
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      imageFile: selectedImageFile || undefined,
    };
    
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCurrentImageUrl(previewUrl);
    }
  };

  const handleRemoveExistingImage = () => {
    setSelectedImageFile(null);
    setFormData(prev => ({ ...prev, existingImageUrl: null }));
    setCurrentImageUrl('');
    toast.info('Imagem será removida ao guardar');
  };

  // Função para obter título em português
  const getTitlePt = (item: TimelineItem): string => {
    const ptContent = getPortugueseContent(item);
    return ptContent?.title || 'Sem título';
  };

  // Função para obter descrição em português (resumo para tabela)
  const getDescriptionPreview = (item: TimelineItem): string => {
    const ptContent = getPortugueseContent(item);
    const description = ptContent?.description || '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Linha do Tempo" subtitle="Gerir eventos históricos">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Eventos Históricos</CardTitle>
                <CardDescription>Gerir marcos da timeline "A Nossa História"</CardDescription>
              </div>
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Ano</TableHead>
                      <TableHead>Título (PT)</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-24">Imagem</TableHead>
                      <TableHead className="w-16">Ordem</TableHead>
                      <TableHead className="w-24">Estado</TableHead>
                      <TableHead className="w-24 text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum evento registado
                        </TableCell>
                      </TableRow>
                    ) : (
                      events.map(ev => (
                        <TableRow key={ev.id}>
                          <TableCell className="font-bold text-lg">{ev.year}</TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {getTitlePt(ev)}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-muted-foreground">
                            {getDescriptionPreview(ev)}
                          </TableCell>
                          <TableCell>
                            {ev.imageUrl ? (
                              <img 
                                src={getFullImageUrl(ev.imageUrl)} 
                                alt={getTitlePt(ev)}
                                className="h-10 w-16 object-cover rounded"
                                onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell>{ev.displayOrder}</TableCell>
                          <TableCell>
                            <Badge variant={ev.isActive ? 'default' : 'secondary'}>
                              {ev.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(ev)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteItem(ev)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Total: {events.length} evento(s)
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Evento' : 'Novo Evento Histórico'}</DialogTitle>
            <DialogDescription>Adicione um marco à linha do tempo da ANPG</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Ano *</Label>
                  <Input 
                    type="number" 
                    value={formData.year} 
                    onChange={e => setFormData({ ...formData, year: Number(e.target.value) })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input 
                    type="number" 
                    value={formData.displayOrder} 
                    onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })} 
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch 
                    checked={formData.isActive} 
                    onCheckedChange={v => setFormData({ ...formData, isActive: v })} 
                  />
                  <Label>Activo</Label>
                </div>
              </div>

              <Tabs defaultValue="pt" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pt">Português *</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pt" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Título (Português) *</Label>
                    <Input 
                      value={formData.titlePt} 
                      onChange={e => setFormData({ ...formData, titlePt: e.target.value })} 
                      required 
                      placeholder="Ex: Fundação da ANPG"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (Português)</Label>
                    <Textarea 
                      value={formData.descriptionPt} 
                      onChange={e => setFormData({ ...formData, descriptionPt: e.target.value })} 
                      rows={4}
                      placeholder="Descreva o evento histórico..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input 
                      value={formData.titleEn} 
                      onChange={e => setFormData({ ...formData, titleEn: e.target.value })} 
                      placeholder="Ex: ANPG Foundation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <Textarea 
                      value={formData.descriptionEn} 
                      onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })} 
                      rows={4}
                      placeholder="Describe the historical event..."
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Imagem do Evento</Label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {currentImageUrl && (
                    <div className="relative rounded-md overflow-hidden border">
                      <img 
                        src={currentImageUrl} 
                        alt="Preview" 
                        className="w-full h-40 object-cover"
                      />
                      {editing && !selectedImageFile && formData.existingImageUrl && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveExistingImage}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB
                </p>
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
            <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o evento "{deleteItem && getTitlePt(deleteItem)}" ({deleteItem?.year})?
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