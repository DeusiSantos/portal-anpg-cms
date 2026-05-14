import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, FileText, Video, Scissors,
  Eye, EyeOff, ExternalLink, Film, X, Globe, Save, Upload, Image as ImageIcon,
  File, Calendar, Link as LinkIcon, AlertCircle, Check,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { getFullImageUrl } from '@/service/api';
import { fileService } from '@/service/fileService';
import RichTextEditor from '@/components/admin/RichTextEditor';

// ==================== TIPOS ====================

type PublicationStatus = 1 | 2 | 3; // 1 = Draft, 2 = Published, 3 = Archived
type VideoStatus = 1 | 2 | 3;
type PressStatus = 1 | 2 | 3;
type VideoProviderType = 1 | 2; // 1 = YouTube, 2 = Vimeo

// Publication Types
interface PublicationContent {
  lang: number;
  title: string;
  description: string;
  summary: string;
}

interface PublicationItem {
  id: string;
  slug: string;
  year: number;
  publishedAt: string;
  fileUrl: string | null;
  filePath: string | null;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  author: string;
  categoryId: string;
  status: PublicationStatus;
  contents: PublicationContent[];
  isActive: boolean;
  createdAt: string;
}

interface PublicationFormData {
  id?: string;
  slug: string;
  year: number;
  publishedAt: string;
  author: string;
  categoryId: string;
  status: PublicationStatus;
  existingFileUrl?: string | null;
  existingCoverImageUrl?: string | null;
  fileAttachment?: File;
  coverImageAttachment?: File;
  titlePt: string;
  descriptionPt: string;
  summaryPt: string;
  titleEn: string;
  descriptionEn: string;
  summaryEn: string;
  isActive: boolean;
}

// Video Types
interface VideoContent {
  lang: number;
  title: string;
  description: string;
  body: string;
}

interface VideoItem {
  id: string;
  slug: string;
  providerType: VideoProviderType;
  externalId: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  durationSeconds: number;
  publishedAt: string;
  categoryId: string;
  status: VideoStatus;
  contents: VideoContent[];
  isActive: boolean;
  createdAt: string;
}

interface VideoFormData {
  id?: string;
  slug: string;
  providerType: VideoProviderType;
  externalId: string;
  embedUrl: string;
  durationSeconds: number;
  publishedAt: string;
  categoryId: string;
  status: VideoStatus;
  existingThumbnailUrl?: string | null;
  thumbnailAttachment?: File;
  titlePt: string;
  descriptionPt: string;
  bodyPt: string;
  titleEn: string;
  descriptionEn: string;
  bodyEn: string;
  isActive: boolean;
}

// Video Category Types
interface VideoCategoryContent {
  lang: number;
  name: string;
  description: string;
}

interface VideoCategoryItem {
  id: string;
  slug: string;
  displayOrder: number;
  contents: VideoCategoryContent[];
  isActive: boolean;
  createdAt: string;
}

interface VideoCategoriesResponse {
  items: VideoCategoryItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

// Press Clipping Types
interface PressContent {
  lang: number;
  title: string;
  summary: string;
  body: string;
}

interface PressItem {
  id: string;
  slug: string;
  source: string;
  sourceLogoUrl: string | null;
  externalUrl: string;
  publishedAt: string;
  clippingFileUrl: string | null;
  clippingFilePath: string | null;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  status: PressStatus;
  contents: PressContent[];
  isActive: boolean;
  createdAt: string;
}

interface PressFormData {
  id?: string;
  slug: string;
  source: string;
  externalUrl: string;
  publishedAt: string;
  status: PressStatus;
  existingFileUrl?: string | null;
  existingThumbnailUrl?: string | null;
  fileAttachment?: File;
  thumbnailAttachment?: File;
  titlePt: string;
  summaryPt: string;
  bodyPt: string;
  titleEn: string;
  summaryEn: string;
  bodyEn: string;
  isActive: boolean;
}

// ==================== CONSTANTES ====================

const STATUS_CONFIG: Record<number, { label: string; color: string; icon: any }> = {
  1: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: FileText },
  2: { label: 'Publicado', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', icon: Check },
  3: { label: 'Arquivado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Archive },
};

function StatusBadge({ status, size = 'default' }: { status: number; size?: 'sm' | 'default' }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 font-medium",
      size === 'sm' ? 'text-xs px-2 py-0.5 rounded-full' : 'text-sm px-3 py-1.5 rounded-full',
      config.color
    )}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </div>
  );
}

// ==================== FUNÇÕES AUXILIARES ====================

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

// ==================== MODAL DE CRIAÇÃO DE CATEGORIA DE VÍDEO ====================

function CreateVideoCategoryModal({ onCategoryCreated }: { onCategoryCreated: (category: VideoCategoryItem) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    displayOrder: 0,
    namePt: '',
    descriptionPt: '',
    nameEn: '',
    descriptionEn: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateSlugLocal = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    if (!formData.namePt.trim()) {
      toast.error('Nome da categoria em português é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<VideoCategoryItem>('/video-categories', {
        slug: formData.slug || generateSlugLocal(formData.namePt),
        displayOrder: formData.displayOrder,
        namePt: formData.namePt.trim(),
        descriptionPt: formData.descriptionPt.trim() || '',
        nameEn: formData.nameEn.trim() || '',
        descriptionEn: formData.descriptionEn.trim() || '',
      });
      toast.success('Categoria de vídeo criada com sucesso!');
      onCategoryCreated(response.data);
      setOpen(false);
      setFormData({
        slug: '',
        displayOrder: 0,
        namePt: '',
        descriptionPt: '',
        nameEn: '',
        descriptionEn: '',
      });
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria de Vídeo</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar os vídeos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome (Português) *</Label>
              <Input
                value={formData.namePt}
                onChange={(e) => setFormData({ ...formData, namePt: e.target.value })}
                placeholder="Ex: Tutoriais, Institucionais"
              />
            </div>
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Ex: Tutorials, Institutional"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Descrição (Português)</Label>
              <Textarea
                value={formData.descriptionPt}
                onChange={(e) => setFormData({ ...formData, descriptionPt: e.target.value })}
                rows={2}
                placeholder="Breve descrição da categoria"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={2}
                placeholder="Brief category description"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlugLocal(e.target.value) })}
                placeholder="url-amigavel"
              />
            </div>
            <div className="space-y-2">
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Criar Categoria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  
  // Estado do tipo ativo
  const [activeTab, setActiveTab] = useState<'publications' | 'videos' | 'press'>('publications');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estados para Publications
  const [pubForm, setPubForm] = useState<PublicationFormData>({
    slug: '',
    year: new Date().getFullYear(),
    publishedAt: new Date().toISOString().split('T')[0],
    author: '',
    categoryId: '',
    status: 1,
    titlePt: '',
    descriptionPt: '',
    summaryPt: '',
    titleEn: '',
    descriptionEn: '',
    summaryEn: '',
    isActive: true,
  });
  const [pubFile, setPubFile] = useState<File | null>(null);
  const [pubImage, setPubImage] = useState<File | null>(null);
  const [pubCurrentFileUrl, setPubCurrentFileUrl] = useState<string>('');
  const [pubCurrentImageUrl, setPubCurrentImageUrl] = useState<string>('');
  const [isUploadingPubFile, setIsUploadingPubFile] = useState(false);
  const [isUploadingPubImage, setIsUploadingPubImage] = useState(false);
  
  // Estados para Videos
  const [vidForm, setVidForm] = useState<VideoFormData>({
    slug: '',
    providerType: 1,
    externalId: '',
    embedUrl: '',
    durationSeconds: 0,
    publishedAt: new Date().toISOString().split('T')[0],
    categoryId: '',
    status: 1,
    titlePt: '',
    descriptionPt: '',
    bodyPt: '',
    titleEn: '',
    descriptionEn: '',
    bodyEn: '',
    isActive: true,
  });
  const [vidThumbnail, setVidThumbnail] = useState<File | null>(null);
  const [vidCurrentThumbnailUrl, setVidCurrentThumbnailUrl] = useState<string>('');
  const [isUploadingVidThumbnail, setIsUploadingVidThumbnail] = useState(false);
  
  // Estados para Press
  const [pressForm, setPressForm] = useState<PressFormData>({
    slug: '',
    source: '',
    externalUrl: '',
    publishedAt: new Date().toISOString().split('T')[0],
    status: 1,
    titlePt: '',
    summaryPt: '',
    bodyPt: '',
    titleEn: '',
    summaryEn: '',
    bodyEn: '',
    isActive: true,
  });
  const [pressFile, setPressFile] = useState<File | null>(null);
  const [pressThumbnail, setPressThumbnail] = useState<File | null>(null);
  const [pressCurrentFileUrl, setPressCurrentFileUrl] = useState<string>('');
  const [pressCurrentThumbnailUrl, setPressCurrentThumbnailUrl] = useState<string>('');
  const [isUploadingPressFile, setIsUploadingPressFile] = useState(false);
  const [isUploadingPressThumbnail, setIsUploadingPressThumbnail] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  // ==================== QUERIES ====================
  
  // Buscar Publicações
  const { data: publications, isLoading: isLoadingPubs, refetch: refetchPubs } = useQuery({
    queryKey: ['admin-publications'],
    queryFn: async () => {
      const response = await api.get('/publications', { params: { page: 1, pageSize: 100 } });
      return response.data.items as PublicationItem[];
    },
  });
  
  // Buscar Vídeos
  const { data: videos, isLoading: isLoadingVids, refetch: refetchVids } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const response = await api.get('/videos', { params: { page: 1, pageSize: 100 } });
      return response.data.items as VideoItem[];
    },
  });
  
  // Buscar Categorias de Vídeo
  const { data: videoCategories, isLoading: isLoadingVideoCats, refetch: refetchVideoCats } = useQuery({
    queryKey: ['admin-video-categories'],
    queryFn: async () => {
      const response = await api.get<VideoCategoriesResponse>('/video-categories', {
        params: { page: 1, pageSize: 100 }
      });
      return response.data.items.filter(cat => cat.isActive);
    },
  });
  
  // Buscar Press Clippings
  const { data: pressItems, isLoading: isLoadingPress, refetch: refetchPress } = useQuery({
    queryKey: ['admin-press'],
    queryFn: async () => {
      const response = await api.get('/press-clippings', { params: { page: 1, pageSize: 100 } });
      return response.data.items as PressItem[];
    },
  });

  // ==================== MUTATIONS ====================
  
  // Publication Mutation
  const pubMutation = useMutation({
    mutationFn: async (data: PublicationFormData) => {
      const formData = new FormData();
      formData.append('Id', data.id || '');
      formData.append('Slug', data.slug || generateSlug(data.titlePt));
      formData.append('Year', String(data.year));
      formData.append('PublishedAt', new Date(data.publishedAt).toISOString());
      formData.append('Author', data.author || '');
      formData.append('CategoryId', data.categoryId || '');
      formData.append('Status', String(data.status));
      formData.append('TitlePt', data.titlePt);
      formData.append('DescriptionPt', data.descriptionPt || '');
      formData.append('SummaryPt', data.summaryPt || '');
      formData.append('TitleEn', data.titleEn || '');
      formData.append('DescriptionEn', data.descriptionEn || '');
      formData.append('SummaryEn', data.summaryEn || '');
      formData.append('IsActive', String(data.isActive));
      
      if (data.fileAttachment) {
        formData.append('FileAttachment', data.fileAttachment);
      }
      if (data.coverImageAttachment) {
        formData.append('CoverImageAttachment', data.coverImageAttachment);
      }
      
      if (editingId) {
        return api.patch(`/publications/from-form`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return api.post('/publications/from-form', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      refetchPubs();
      toast.success(editingId ? 'Publicação actualizada' : 'Publicação criada');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao guardar publicação');
    },
  });
  
  // Video Mutation
  const vidMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      const formData = new FormData();
      formData.append('Id', data.id || '');
      formData.append('Slug', data.slug || generateSlug(data.titlePt));
      formData.append('ProviderType', String(data.providerType));
      formData.append('ExternalId', null);
      formData.append('EmbedUrl', data.embedUrl || '');
      formData.append('DurationSeconds', String(data.durationSeconds || 0));
      formData.append('PublishedAt', new Date(data.publishedAt).toISOString());
      formData.append('CategoryId', data.categoryId || '');
      formData.append('Status', String(data.status));
      formData.append('TitlePt', data.titlePt);
      formData.append('DescriptionPt', data.descriptionPt || '');
      formData.append('BodyPt', data.bodyPt || '');
      formData.append('TitleEn', data.titleEn || '');
      formData.append('DescriptionEn', data.descriptionEn || '');
      formData.append('BodyEn', data.bodyEn || '');
      formData.append('IsActive', String(data.isActive));
      
      if (data.thumbnailAttachment) {
        formData.append('ThumbnailAttachment', data.thumbnailAttachment);
      }
      
      if (editingId) {
        return api.patch(`/videos/from-form`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return api.post('/videos/from-form', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      refetchVids();
      toast.success(editingId ? 'Vídeo actualizado' : 'Vídeo criado');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao guardar vídeo');
    },
  });
  
  // Press Mutation
  const pressMutation = useMutation({
    mutationFn: async (data: PressFormData) => {
      const formData = new FormData();
      formData.append('Slug', data.slug || generateSlug(data.titlePt));
      formData.append('Source', data.source || '');
      formData.append('ExternalUrl', data.externalUrl || '');
      formData.append('PublishedAt', new Date(data.publishedAt).toISOString());
      formData.append('Status', String(data.status));
      formData.append('TitlePt', data.titlePt);
      formData.append('SummaryPt', data.summaryPt || '');
      formData.append('BodyPt', data.bodyPt || '');
      formData.append('TitleEn', data.titleEn || '');
      formData.append('SummaryEn', data.summaryEn || '');
      formData.append('BodyEn', data.bodyEn || '');
      formData.append('IsActive', String(data.isActive));
      
      if (data.fileAttachment) {
        formData.append('ClippingFileAttachment', data.fileAttachment);
      }
      if (data.thumbnailAttachment) {
        formData.append('ThumbnailAttachment', data.thumbnailAttachment);
      }
      
      if (data.id) {
        formData.append('Id', data.id);
      }

      if (editingId) {
        return api.patch(`/press-clippings/from-form`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return api.post('/press-clippings/from-form', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      refetchPress();
      toast.success(editingId ? 'Recorte actualizado' : 'Recorte criado');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao guardar recorte');
    },
  });
  
  // Delete Mutations
  const deletePubMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/publications/${id}`),
    onSuccess: () => { refetchPubs(); toast.success('Publicação eliminada'); },
    onError: () => toast.error('Erro ao eliminar'),
  });
  
  const deleteVidMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/videos/${id}`),
    onSuccess: () => { refetchVids(); toast.success('Vídeo eliminado'); },
    onError: () => toast.error('Erro ao eliminar'),
  });
  
  const deletePressMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/press-clippings/${id}`),
    onSuccess: () => { refetchPress(); toast.success('Recorte eliminado'); },
    onError: () => toast.error('Erro ao eliminar'),
  });
  
  // Toggle Active Mutations
  const togglePubActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => 
      api.patch(`/publications/${id}`, { isActive }),
    onSuccess: () => refetchPubs(),
  });
  
  const toggleVidActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => 
      api.patch(`/videos/${id}`, { isActive }),
    onSuccess: () => refetchVids(),
  });
  
  const togglePressActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => 
      api.patch(`/press-clippings/${id}`, { isActive }),
    onSuccess: () => refetchPress(),
  });

  // ==================== FUNÇÕES DE UPLOAD ====================
  
  const handleUploadFile = async (file: File, type: 'pub' | 'press'): Promise<string> => {
    if (type === 'pub') setIsUploadingPubFile(true);
    else setIsUploadingPressFile(true);
    try {
      const url = await fileService.uploadFile(file);
      toast.success('Ficheiro enviado');
      return url;
    } catch (error) {
      toast.error('Erro ao enviar ficheiro');
      throw error;
    } finally {
      if (type === 'pub') setIsUploadingPubFile(false);
      else setIsUploadingPressFile(false);
    }
  };
  
  const handleUploadImage = async (file: File, type: 'pub' | 'vid' | 'press'): Promise<string> => {
    if (type === 'pub') setIsUploadingPubImage(true);
    else if (type === 'vid') setIsUploadingVidThumbnail(true);
    else setIsUploadingPressThumbnail(true);
    try {
      const url = await fileService.uploadImage(file);
      toast.success('Imagem enviada');
      return url;
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      throw error;
    } finally {
      if (type === 'pub') setIsUploadingPubImage(false);
      else if (type === 'vid') setIsUploadingVidThumbnail(false);
      else setIsUploadingPressThumbnail(false);
    }
  };

  // ==================== FUNÇÕES DE FORMULÁRIO ====================
  
  const openNew = (tab: 'publications' | 'videos' | 'press') => {
    setActiveTab(tab);
    setEditingId(null);
    resetForms();
    setDialogOpen(true);
  };
  
  const openEdit = async (tab: 'publications' | 'videos' | 'press', id: string) => {
    setActiveTab(tab);
    setEditingId(id);
    setIsLoading(true);
    
    try {
      if (tab === 'publications') {
        const response = await api.get<PublicationItem>(`/publications/${id}`);
        const item = response.data;
        const pt = item.contents?.find(c => c.lang === 1);
        const en = item.contents?.find(c => c.lang === 2);
        
        setPubForm({
          id: item.id,
          slug: item.slug || '',
          year: item.year || new Date().getFullYear(),
          publishedAt: formatDateForInput(item.publishedAt) || '',
          author: item.author || '',
          categoryId: item.categoryId || '',
          status: item.status,
          titlePt: pt?.title || '',
          descriptionPt: pt?.description || '',
          summaryPt: pt?.summary || '',
          titleEn: en?.title || '',
          descriptionEn: en?.description || '',
          summaryEn: en?.summary || '',
          isActive: item.isActive,
        });
        setPubCurrentFileUrl(item.fileUrl ? getFullImageUrl(item.fileUrl) : '');
        setPubCurrentImageUrl(item.coverImageUrl ? getFullImageUrl(item.coverImageUrl) : '');
        setPubFile(null);
        setPubImage(null);
      }
      else if (tab === 'videos') {
        const response = await api.get<VideoItem>(`/videos/${id}`);
        const item = response.data;
        const pt = item.contents?.find(c => c.lang === 1);
        const en = item.contents?.find(c => c.lang === 2);
        
        setVidForm({
          id: item.id,
          slug: item.slug || '',
          providerType: item.providerType || 1,
          externalId: item.externalId || '',
          embedUrl: item.embedUrl || '',
          durationSeconds: item.durationSeconds || 0,
          publishedAt: formatDateForInput(item.publishedAt) || '',
          categoryId: item.categoryId || '',
          status: item.status,
          titlePt: pt?.title || '',
          descriptionPt: pt?.description || '',
          bodyPt: pt?.body || '',
          titleEn: en?.title || '',
          descriptionEn: en?.description || '',
          bodyEn: en?.body || '',
          isActive: item.isActive,
        });
        setVidCurrentThumbnailUrl(item.thumbnailUrl ? getFullImageUrl(item.thumbnailUrl) : '');
        setVidThumbnail(null);
      }
      else if (tab === 'press') {
        const response = await api.get<PressItem>(`/press-clippings/${id}`);
        const item = response.data;
        const pt = item.contents?.find(c => c.lang === 1);
        const en = item.contents?.find(c => c.lang === 2);
        
        setPressForm({
          id: item.id,
          slug: item.slug || '',
          source: item.source || '',
          externalUrl: item.externalUrl || '',
          publishedAt: formatDateForInput(item.publishedAt) || '',
          status: item.status,
          titlePt: pt?.title || '',
          summaryPt: pt?.summary || '',
          bodyPt: pt?.body || '',
          titleEn: en?.title || '',
          summaryEn: en?.summary || '',
          bodyEn: en?.body || '',
          isActive: item.isActive,
        });
        setPressCurrentFileUrl(item.clippingFileUrl ? getFullImageUrl(item.clippingFileUrl) : '');
        setPressCurrentThumbnailUrl(item.thumbnailUrl ? getFullImageUrl(item.thumbnailUrl) : '');
        setPressFile(null);
        setPressThumbnail(null);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
      setDialogOpen(true);
    }
  };
  
  const resetForms = () => {
    // Reset Publications
    setPubForm({
      slug: '',
      year: new Date().getFullYear(),
      publishedAt: new Date().toISOString().split('T')[0],
      author: '',
      categoryId: '',
      status: 1,
      titlePt: '',
      descriptionPt: '',
      summaryPt: '',
      titleEn: '',
      descriptionEn: '',
      summaryEn: '',
      isActive: true,
    });
    setPubFile(null);
    setPubImage(null);
    setPubCurrentFileUrl('');
    setPubCurrentImageUrl('');
    
    // Reset Videos
    setVidForm({
      slug: '',
      providerType: 1,
      externalId: '',
      embedUrl: '',
      durationSeconds: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      categoryId: '',
      status: 1,
      titlePt: '',
      descriptionPt: '',
      bodyPt: '',
      titleEn: '',
      descriptionEn: '',
      bodyEn: '',
      isActive: true,
    });
    setVidThumbnail(null);
    setVidCurrentThumbnailUrl('');
    
    // Reset Press
    setPressForm({
      slug: '',
      source: '',
      externalUrl: '',
      publishedAt: new Date().toISOString().split('T')[0],
      status: 1,
      titlePt: '',
      summaryPt: '',
      bodyPt: '',
      titleEn: '',
      summaryEn: '',
      bodyEn: '',
      isActive: true,
    });
    setPressFile(null);
    setPressThumbnail(null);
    setPressCurrentFileUrl('');
    setPressCurrentThumbnailUrl('');
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    resetForms();
  };
  
  const handleSave = () => {
    if (activeTab === 'publications') {
      if (!pubForm.titlePt) {
        toast.error('Título é obrigatório');
        return;
      }
      pubMutation.mutate({
        ...pubForm,
        fileAttachment: pubFile || undefined,
        coverImageAttachment: pubImage || undefined,
      });
    }
    else if (activeTab === 'videos') {
      if (!vidForm.titlePt) {
        toast.error('Título é obrigatório');
        return;
      }
      vidMutation.mutate({
        ...vidForm,
        thumbnailAttachment: vidThumbnail || undefined,
      });
    }
    else if (activeTab === 'press') {
      if (!pressForm.titlePt) {
        toast.error('Título é obrigatório');
        return;
      }
      pressMutation.mutate({
        ...pressForm,
        fileAttachment: pressFile || undefined,
        thumbnailAttachment: pressThumbnail || undefined,
      });
    }
  };

  // ==================== RENDER ====================
  
  const isLoadingData = isLoadingPubs || isLoadingVids || isLoadingPress || isLoadingVideoCats;
  
  return (
    <AdminLayout title="Central de Media" subtitle="Gerir publicações, vídeos e recortes de imprensa">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'publications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('publications')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Publicações
            {publications && <Badge variant="secondary" className="ml-1">{publications.length}</Badge>}
          </Button>
          <Button
            variant={activeTab === 'videos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('videos')}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Vídeos
            {videos && <Badge variant="secondary" className="ml-1">{videos.length}</Badge>}
          </Button>
          <Button
            variant={activeTab === 'press' ? 'default' : 'outline'}
            onClick={() => setActiveTab('press')}
            className="gap-2"
          >
            <Scissors className="h-4 w-4" />
            Recortes de Imprensa
            {pressItems && <Badge variant="secondary" className="ml-1">{pressItems.length}</Badge>}
          </Button>
        </div>
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {activeTab === 'publications' && 'Publicações'}
            {activeTab === 'videos' && 'Vídeos'}
            {activeTab === 'press' && 'Recortes de Imprensa'}
          </h2>
          <Button onClick={() => openNew(activeTab)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
        
        {/* Tabela de Publicações */}
        {activeTab === 'publications' && (
          <div className="bg-background rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Activo</TableHead>
                  <TableHead className="w-28 text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPubs ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : !publications?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma publicação encontrada</TableCell></TableRow>
                ) : (
                  publications.map(item => {
                    const ptContent = item.contents?.find(c => c.lang === 1);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.year}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.coverImageUrl && (
                              <img src={getFullImageUrl(item.coverImageUrl)} alt="" className="w-10 h-10 rounded object-cover border" />
                            )}
                            <div>
                              <div className="font-medium line-clamp-1">{ptContent?.title || 'Sem título'}</div>
                              {ptContent?.description && <div className="text-xs text-muted-foreground line-clamp-1">{ptContent.description}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.author || '—'}</TableCell>
                        <TableCell><StatusBadge status={item.status} size="sm" /></TableCell>
                        <TableCell>
                          <Switch checked={item.isActive} onCheckedChange={(v) => togglePubActive.mutate({ id: item.id, isActive: v })} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit('publications', item.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm('Eliminar?')) deletePubMutation.mutate(item.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Tabela de Vídeos */}
        {activeTab === 'videos' && (
          <div className="bg-background rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumb</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Activo</TableHead>
                  <TableHead className="w-28 text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingVids ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : !videos?.length ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum vídeo encontrado</TableCell></TableRow>
                ) : (
                  videos.map(item => {
                    const ptContent = item.contents?.find(c => c.lang === 1);
                    const category = videoCategories?.find(c => c.id === item.categoryId);
                    const categoryName = category?.contents?.find(c => c.lang === 1)?.name || 'Sem categoria';
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.thumbnailUrl ? (
                            <img src={getFullImageUrl(item.thumbnailUrl)} alt="" className="w-16 h-10 rounded object-cover border" />
                          ) : (
                            <div className="w-16 h-10 bg-muted rounded flex items-center justify-center"><Film className="h-4 w-4 text-muted-foreground" /></div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium line-clamp-1">{ptContent?.title || 'Sem título'}</div>
                          {ptContent?.description && <div className="text-xs text-muted-foreground line-clamp-1">{ptContent.description}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{categoryName}</Badge>
                        </TableCell>
                        <TableCell>{item.providerType === 1 ? 'YouTube' : 'Vimeo'}</TableCell>
                        <TableCell><StatusBadge status={item.status} size="sm" /></TableCell>
                        <TableCell>
                          <Switch checked={item.isActive} onCheckedChange={(v) => toggleVidActive.mutate({ id: item.id, isActive: v })} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit('videos', item.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm('Eliminar?')) deleteVidMutation.mutate(item.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Tabela de Press Clippings */}
        {activeTab === 'press' && (
          <div className="bg-background rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumb</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Activo</TableHead>
                  <TableHead className="w-28 text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPress ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : !pressItems?.length ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum recorte encontrado</TableCell></TableRow>
                ) : (
                  pressItems.map(item => {
                    const ptContent = item.contents?.find(c => c.lang === 1);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.thumbnailUrl ? (
                            <img src={getFullImageUrl(item.thumbnailUrl)} alt="" className="w-16 h-10 rounded object-cover border" />
                          ) : (
                            <div className="w-16 h-10 bg-muted rounded flex items-center justify-center"><Scissors className="h-4 w-4 text-muted-foreground" /></div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium line-clamp-1">{ptContent?.title || 'Sem título'}</div>
                          {ptContent?.summary && <div className="text-xs text-muted-foreground line-clamp-1">{ptContent.summary}</div>}
                        </TableCell>
                        <TableCell>{item.source || '—'}</TableCell>
                        <TableCell className="text-sm">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('pt-PT') : '—'}</TableCell>
                        <TableCell><StatusBadge status={item.status} size="sm" /></TableCell>
                        <TableCell>
                          <Switch checked={item.isActive} onCheckedChange={(v) => togglePressActive.mutate({ id: item.id, isActive: v })} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit('press', item.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm('Eliminar?')) deletePressMutation.mutate(item.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Dialog de Criação/Edição */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar' : 'Novo'} 
                {activeTab === 'publications' && ' Publicação'}
                {activeTab === 'videos' && ' Vídeo'}
                {activeTab === 'press' && ' Recorte de Imprensa'}
              </DialogTitle>
            </DialogHeader>
            
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <>
                {/* Formulário de Publicações */}
                {activeTab === 'publications' && (
                  <div className="grid gap-6">
                    <Tabs defaultValue="pt" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pt" className="gap-2"><FileText className="h-4 w-4" />Português</TabsTrigger>
                        <TabsTrigger value="en" className="gap-2"><Globe className="h-4 w-4" />English</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="pt" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Título (PT) *</Label>
                          <Input value={pubForm.titlePt} onChange={e => setPubForm({ ...pubForm, titlePt: e.target.value, slug: pubForm.slug || generateSlug(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição (PT)</Label>
                          <Textarea value={pubForm.descriptionPt} onChange={e => setPubForm({ ...pubForm, descriptionPt: e.target.value })} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Resumo (PT)</Label>
                          <Textarea value={pubForm.summaryPt} onChange={e => setPubForm({ ...pubForm, summaryPt: e.target.value })} rows={2} />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="en" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Title (EN)</Label>
                          <Input value={pubForm.titleEn} onChange={e => setPubForm({ ...pubForm, titleEn: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (EN)</Label>
                          <Textarea value={pubForm.descriptionEn} onChange={e => setPubForm({ ...pubForm, descriptionEn: e.target.value })} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Summary (EN)</Label>
                          <Textarea value={pubForm.summaryEn} onChange={e => setPubForm({ ...pubForm, summaryEn: e.target.value })} rows={2} />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input value={pubForm.slug} onChange={e => setPubForm({ ...pubForm, slug: e.target.value })} placeholder="url-amigavel" />
                      </div>
                      <div className="space-y-2">
                        <Label>Ano</Label>
                        <Input type="number" value={pubForm.year} onChange={e => setPubForm({ ...pubForm, year: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Publicação</Label>
                        <Input type="date" value={pubForm.publishedAt} onChange={e => setPubForm({ ...pubForm, publishedAt: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Autor</Label>
                        <Input value={pubForm.author} onChange={e => setPubForm({ ...pubForm, author: e.target.value })} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={String(pubForm.status)} onValueChange={v => setPubForm({ ...pubForm, status: parseInt(v) as PublicationStatus })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Rascunho</SelectItem>
                            <SelectItem value="2">Publicado</SelectItem>
                            <SelectItem value="3">Arquivado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <Switch checked={pubForm.isActive} onCheckedChange={v => setPubForm({ ...pubForm, isActive: v })} />
                        <Label>Activo</Label>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-4">
                      <Label>Capa da Publicação</Label>
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setPubImage(e.target.files[0]); setPubCurrentImageUrl(URL.createObjectURL(e.target.files[0])); } }} />
                      {pubCurrentImageUrl && <img src={pubCurrentImageUrl} alt="Preview" className="w-32 h-32 object-cover rounded border" />}
                      {isUploadingPubImage && <p className="text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />A enviar imagem...</p>}
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-4">
                      <Label>Ficheiro (PDF)</Label>
                      <input type="file" accept=".pdf" onChange={e => { if (e.target.files?.[0]) { setPubFile(e.target.files[0]); setPubCurrentFileUrl(e.target.files[0].name); } }} />
                      {pubCurrentFileUrl && <p className="text-sm text-muted-foreground">Ficheiro: {pubCurrentFileUrl.split('/').pop()}</p>}
                      {isUploadingPubFile && <p className="text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />A enviar ficheiro...</p>}
                    </div>
                  </div>
                )}
                
                {/* Formulário de Vídeos */}
                {activeTab === 'videos' && (
                  <div className="grid gap-6">
                    <Tabs defaultValue="pt" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pt" className="gap-2"><FileText className="h-4 w-4" />Português</TabsTrigger>
                        <TabsTrigger value="en" className="gap-2"><Globe className="h-4 w-4" />English</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="pt" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Título (PT) *</Label>
                          <Input value={vidForm.titlePt} onChange={e => setVidForm({ ...vidForm, titlePt: e.target.value, slug: vidForm.slug || generateSlug(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição (PT)</Label>
                          <Textarea value={vidForm.descriptionPt} onChange={e => setVidForm({ ...vidForm, descriptionPt: e.target.value })} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Conteúdo (PT)</Label>
                          <RichTextEditor content={vidForm.bodyPt} onChange={html => setVidForm({ ...vidForm, bodyPt: html })} onImageUpload={async (file) => fileService.uploadImage(file)} />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="en" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Title (EN)</Label>
                          <Input value={vidForm.titleEn} onChange={e => setVidForm({ ...vidForm, titleEn: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (EN)</Label>
                          <Textarea value={vidForm.descriptionEn} onChange={e => setVidForm({ ...vidForm, descriptionEn: e.target.value })} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Content (EN)</Label>
                          <RichTextEditor content={vidForm.bodyEn} onChange={html => setVidForm({ ...vidForm, bodyEn: html })} onImageUpload={async (file) => fileService.uploadImage(file)} />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>URL do Vídeo (Embed)</Label>
                        <Input value={vidForm.embedUrl} onChange={e => setVidForm({ ...vidForm, embedUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Duração (segundos)</Label>
                        <Input type="number" value={vidForm.durationSeconds} onChange={e => setVidForm({ ...vidForm, durationSeconds: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select value={String(vidForm.providerType)} onValueChange={v => setVidForm({ ...vidForm, providerType: parseInt(v) as VideoProviderType })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">YouTube</SelectItem>
                            <SelectItem value="2">Vimeo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Publicação</Label>
                        <Input type="date" value={vidForm.publishedAt} onChange={e => setVidForm({ ...vidForm, publishedAt: e.target.value })} />
                      </div>
                    </div>
                    
                    {/* Campo de Categoria com botão Nova Categoria */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Categoria</Label>
                        <CreateVideoCategoryModal onCategoryCreated={(newCategory) => {
                          queryClient.setQueryData(['admin-video-categories'], (old: VideoCategoryItem[] | undefined) => {
                            return old ? [...old, newCategory] : [newCategory];
                          });
                          setVidForm({ ...vidForm, categoryId: newCategory.id });
                          toast.success(`Categoria "${newCategory.contents?.find(c => c.lang === 1)?.name}" selecionada!`);
                        }} />
                      </div>
                      <Select
                        value={vidForm.categoryId}
                        onValueChange={(value) => setVidForm({ ...vidForm, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingVideoCats ? "A carregar..." : "Selecione uma categoria"} />
                        </SelectTrigger>
                        <SelectContent>
                          {videoCategories?.map((cat) => {
                            const ptContent = cat.contents?.find(c => c.lang === 1);
                            return (
                              <SelectItem key={cat.id} value={cat.id}>
                                {ptContent?.name || cat.slug || cat.id}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={String(vidForm.status)} onValueChange={v => setVidForm({ ...vidForm, status: parseInt(v) as VideoStatus })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Rascunho</SelectItem>
                            <SelectItem value="2">Publicado</SelectItem>
                            <SelectItem value="3">Arquivado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <Switch checked={vidForm.isActive} onCheckedChange={v => setVidForm({ ...vidForm, isActive: v })} />
                        <Label>Activo</Label>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-4">
                      <Label>Miniatura do Vídeo</Label>
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setVidThumbnail(e.target.files[0]); setVidCurrentThumbnailUrl(URL.createObjectURL(e.target.files[0])); } }} />
                      {vidCurrentThumbnailUrl && <img src={vidCurrentThumbnailUrl} alt="Preview" className="w-32 h-20 object-cover rounded border" />}
                      {isUploadingVidThumbnail && <p className="text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />A enviar miniatura...</p>}
                    </div>
                  </div>
                )}
                
                {/* Formulário de Press Clippings */}
                {activeTab === 'press' && (
                  <div className="grid gap-6">
                    <Tabs defaultValue="pt" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pt" className="gap-2"><FileText className="h-4 w-4" />Português</TabsTrigger>
                        <TabsTrigger value="en" className="gap-2"><Globe className="h-4 w-4" />English</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="pt" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Título (PT) *</Label>
                          <Input value={pressForm.titlePt} onChange={e => setPressForm({ ...pressForm, titlePt: e.target.value, slug: pressForm.slug || generateSlug(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Resumo (PT)</Label>
                          <Textarea value={pressForm.summaryPt} onChange={e => setPressForm({ ...pressForm, summaryPt: e.target.value })} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Conteúdo (PT)</Label>
                          <RichTextEditor content={pressForm.bodyPt} onChange={html => setPressForm({ ...pressForm, bodyPt: html })} onImageUpload={async (file) => fileService.uploadImage(file)} />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="en" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Title (EN)</Label>
                          <Input value={pressForm.titleEn} onChange={e => setPressForm({ ...pressForm, titleEn: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Summary (EN)</Label>
                          <Textarea value={pressForm.summaryEn} onChange={e => setPressForm({ ...pressForm, summaryEn: e.target.value })} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Content (EN)</Label>
                          <RichTextEditor content={pressForm.bodyEn} onChange={html => setPressForm({ ...pressForm, bodyEn: html })} onImageUpload={async (file) => fileService.uploadImage(file)} />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fonte</Label>
                        <Input value={pressForm.source} onChange={e => setPressForm({ ...pressForm, source: e.target.value })} placeholder="Ex: Jornal de Angola" />
                      </div>
                      <div className="space-y-2">
                        <Label>URL Externo</Label>
                        <Input value={pressForm.externalUrl} onChange={e => setPressForm({ ...pressForm, externalUrl: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Publicação</Label>
                        <Input type="date" value={pressForm.publishedAt} onChange={e => setPressForm({ ...pressForm, publishedAt: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={String(pressForm.status)} onValueChange={v => setPressForm({ ...pressForm, status: parseInt(v) as PressStatus })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Rascunho</SelectItem>
                            <SelectItem value="2">Publicado</SelectItem>
                            <SelectItem value="3">Arquivado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Switch checked={pressForm.isActive} onCheckedChange={v => setPressForm({ ...pressForm, isActive: v })} />
                      <Label>Activo</Label>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-4">
                      <Label>Thumbnail</Label>
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setPressThumbnail(e.target.files[0]); setPressCurrentThumbnailUrl(URL.createObjectURL(e.target.files[0])); } }} />
                      {pressCurrentThumbnailUrl && <img src={pressCurrentThumbnailUrl} alt="Preview" className="w-32 h-20 object-cover rounded border" />}
                      {isUploadingPressThumbnail && <p className="text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />A enviar thumbnail...</p>}
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-4">
                      <Label>Ficheiro do Recorte (PDF/DOC)</Label>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={e => { if (e.target.files?.[0]) { setPressFile(e.target.files[0]); setPressCurrentFileUrl(e.target.files[0].name); } }} />
                      {pressCurrentFileUrl && <p className="text-sm text-muted-foreground">Ficheiro: {pressCurrentFileUrl.split('/').pop()}</p>}
                      {isUploadingPressFile && <p className="text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />A enviar ficheiro...</p>}
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSave} disabled={pubMutation.isPending || vidMutation.isPending || pressMutation.isPending}>
                {(pubMutation.isPending || vidMutation.isPending || pressMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? 'Guardar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}