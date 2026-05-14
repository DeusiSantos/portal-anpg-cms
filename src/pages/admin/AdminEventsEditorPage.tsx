import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Save,
  Eye,
  Loader2,
  ArrowLeft,
  Plus,
  Check,
  Edit,
  Send,
  Archive,
  Globe,
  FileText,
  AlertCircle,
  Calendar,
  MapPin,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { cn } from '@/lib/utils';
import api, { getFullImageUrl } from '@/service/api';
import { fileService } from '@/service/fileService';

// Tipos da API
type EventStatus = 1 | 2 | 3; // 1 = Draft, 2 = Published, 3 = Archived

interface EventCategoryContent {
  lang: number;
  name: string;
  description: string;
}

interface EventCategory {
  id: string;
  slug: string;
  displayOrder: number;
  contents: EventCategoryContent[];
  isActive: boolean;
  createdAt: string;
}

interface EventCategoriesResponse {
  items: EventCategory[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface EventContent {
  lang: number;
  title: string;
  description: string;
  body: string;
}

interface EventItem {
  id: string;
  slug: string;
  startAt: string;
  endAt: string;
  location: string;
  mapUrl: string;
  registrationUrl: string;
  featuredImageUrl: string | null;
  featuredImagePath: string | null;
  categoryId: string;
  status: EventStatus;
  contents: EventContent[];
  isActive: boolean;
  createdAt: string;
}

interface EventFormData {
  id?: string;
  slug: string;
  startAt: string;
  endAt: string;
  location: string;
  mapUrl: string;
  registrationUrl: string;
  categoryId: string;
  status: EventStatus;
  existingImageUrl?: string | null;
  featuredImageFile?: File;
  titlePt: string;
  descriptionPt: string;
  bodyPt: string;
  titleEn: string;
  descriptionEn: string;
  bodyEn: string;
  isActive: boolean;
}

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; icon: any; description: string }> = {
  1: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: Edit,
    description: 'Rascunho do evento. Pode ser editado livremente.'
  },
  2: {
    label: 'Publicado',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: Send,
    description: 'Evento publicado no site. Visível para o público.'
  },
  3: {
    label: 'Arquivado',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    icon: Archive,
    description: 'Evento arquivado. Não está visível no site principal.'
  }
};

function StatusBadge({ status, size = 'default' }: { status: EventStatus; size?: 'sm' | 'default' }) {
  const config = STATUS_CONFIG[status];
  const Icon = config?.icon || Edit;
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 font-medium",
      size === 'sm' ? 'text-xs px-2 py-0.5 rounded-full' : 'text-sm px-3 py-1.5 rounded-full',
      config?.color
    )}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config?.label || status}
    </div>
  );
}

// Modal de criação de categoria
function CreateCategoryModal({ onCategoryCreated }: { onCategoryCreated: (category: EventCategory) => void }) {
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

  const generateSlug = (title: string) => {
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
      const response = await api.post<EventCategory>('/event-categories', {
        slug: formData.slug || generateSlug(formData.namePt),
        displayOrder: formData.displayOrder,
        namePt: formData.namePt.trim(),
        descriptionPt: formData.descriptionPt.trim() || '',
        nameEn: formData.nameEn.trim() || '',
        descriptionEn: formData.descriptionEn.trim() || '',
      });
      toast.success('Categoria criada com sucesso!');
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
          <DialogTitle>Criar Nova Categoria de Evento</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar os eventos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome (Português) *</Label>
              <Input
                value={formData.namePt}
                onChange={(e) => setFormData({ ...formData, namePt: e.target.value })}
                placeholder="Ex: Conferências"
              />
            </div>
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Ex: Conferences"
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
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Criar Categoria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Função para obter conteúdo por idioma
const getContentByLang = (contents: EventContent[], lang: number): EventContent | undefined => {
  return contents?.find(c => c.lang === lang);
};

// Função para gerar slug
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

export default function AdminEventsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState<EventFormData>({
    slug: '',
    startAt: '',
    endAt: '',
    location: '',
    mapUrl: '',
    registrationUrl: '',
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

  const [currentStatus, setCurrentStatus] = useState<EventStatus>(1);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('pt');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Buscar categorias
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.get<EventCategoriesResponse>('/event-categories', {
        params: { page: 1, pageSize: 100 }
      });
      setCategories(response.data.items.filter(c => c.isActive));
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      fetchEvent();
    }
  }, [id, isNew]);

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<EventItem>(`/events/${id}`);
      const event = response.data;

      const portugueseContent = getContentByLang(event.contents, 1);
      const englishContent = getContentByLang(event.contents, 2);

      setFormData({
        id: event.id,
        slug: event.slug || '',
        startAt: event.startAt?.split('T')[0] || '',
        endAt: event.endAt?.split('T')[0] || '',
        location: event.location || '',
        mapUrl: event.mapUrl || '',
        registrationUrl: event.registrationUrl || '',
        categoryId: event.categoryId || '',
        status: event.status || 1,
        existingImageUrl: event.featuredImageUrl,
        titlePt: portugueseContent?.title || '',
        descriptionPt: portugueseContent?.description || '',
        bodyPt: portugueseContent?.body || '',
        titleEn: englishContent?.title || '',
        descriptionEn: englishContent?.description || '',
        bodyEn: englishContent?.body || '',
        isActive: event.isActive ?? true,
      });

      setCurrentStatus(event.status || 1);

      if (event.featuredImageUrl) {
        setCurrentImageUrl(getFullImageUrl(event.featuredImageUrl));
      }
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      toast.error('Erro ao carregar os dados do evento');
    } finally {
      setIsLoading(false);
    }
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

  const saveMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const formDataToSend = new FormData();

      if (isNew) {
        // Criar novo evento
        formDataToSend.append('Slug', data.slug || generateSlug(data.titlePt));
        formDataToSend.append('StartAt', data.startAt);
        formDataToSend.append('EndAt', data.endAt || '');
        formDataToSend.append('Location', data.location || '');
        formDataToSend.append('MapUrl', data.mapUrl || '');
        formDataToSend.append('RegistrationUrl', data.registrationUrl || '');
        formDataToSend.append('CategoryId', data.categoryId);
        formDataToSend.append('Status', String(data.status));
        formDataToSend.append('TitlePt', data.titlePt);
        formDataToSend.append('DescriptionPt', data.descriptionPt || '');
        formDataToSend.append('BodyPt', data.bodyPt || '');
        formDataToSend.append('TitleEn', data.titleEn || '');
        formDataToSend.append('DescriptionEn', data.descriptionEn || '');
        formDataToSend.append('BodyEn', data.bodyEn || '');
        formDataToSend.append('IsActive', String(data.isActive));

        if (data.featuredImageFile) {
          formDataToSend.append('FeaturedImageAttachment', data.featuredImageFile);
        }

        const response = await api.post('/events/from-form', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        return response.data;
      } else {
        // Atualizar evento existente
        formDataToSend.append('Id', data.id || '');
        formDataToSend.append('Slug', data.slug || generateSlug(data.titlePt));
        formDataToSend.append('StartAt', data.startAt);
        formDataToSend.append('EndAt', data.endAt || '');
        formDataToSend.append('Location', data.location || '');
        formDataToSend.append('MapUrl', data.mapUrl || '');
        formDataToSend.append('RegistrationUrl', data.registrationUrl || '');
        formDataToSend.append('CategoryId', data.categoryId);
        formDataToSend.append('Status', String(data.status));
        formDataToSend.append('TitlePt', data.titlePt);
        formDataToSend.append('DescriptionPt', data.descriptionPt || '');
        formDataToSend.append('BodyPt', data.bodyPt || '');
        formDataToSend.append('TitleEn', data.titleEn || '');
        formDataToSend.append('DescriptionEn', data.descriptionEn || '');
        formDataToSend.append('BodyEn', data.bodyEn || '');
        formDataToSend.append('IsActive', String(data.isActive));

        const hasExistingImage = !!data.existingImageUrl;
        const hasNewImage = !!data.featuredImageFile;
        const shouldRemoveImage = !hasExistingImage && !hasNewImage;
        
        formDataToSend.append('RemoveFeaturedImage', String(shouldRemoveImage));

        if (data.featuredImageFile) {
          formDataToSend.append('FeaturedImageAttachment', data.featuredImageFile);
        }

        const response = await api.patch(`/events/from-form`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success(isNew ? 'Evento criado com sucesso' : 'Evento actualizado com sucesso');

      if (isNew) {
        navigate('/admin/events');
      } else {
        fetchEvent();
      }
    },
    onError: (error: any) => {
      console.error('Erro detalhado:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao guardar o evento';
      toast.error(`Erro ao guardar: ${errorMessage}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titlePt) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Selecione uma categoria');
      return;
    }

    if (!formData.startAt) {
      toast.error('Data de início é obrigatória');
      return;
    }

    if (isNew && !selectedImageFile) {
      toast.error('A imagem de destaque é obrigatória');
      return;
    }

    const dataToSubmit = {
      ...formData,
      slug: formData.slug || generateSlug(formData.titlePt),
      featuredImageFile: selectedImageFile || undefined,
    };

    saveMutation.mutate(dataToSubmit);
  };

  const handleRemoveExistingImage = () => {
    setSelectedImageFile(null);
    setFormData(prev => ({ ...prev, existingImageUrl: null }));
    setCurrentImageUrl('');
    toast.info('Imagem será removida ao guardar');
  };

  const handleCategoryCreated = (newCategory: EventCategory) => {
    setCategories(prev => [...prev, newCategory]);
    setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
    const ptContent = newCategory.contents?.find(c => c.lang === 1);
    toast.success(`Categoria "${ptContent?.name}" adicionada e selecionada!`);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 'Selecione uma categoria';
    const ptContent = category.contents?.find(c => c.lang === 1);
    return ptContent?.name || categoryId;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Editor de Eventos">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Editor de Eventos">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/events')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            {!isNew && <StatusBadge status={currentStatus} />}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pt" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Português
                </TabsTrigger>
                <TabsTrigger value="en" className="gap-2">
                  <Globe className="h-4 w-4" />
                  English
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pt" className="mt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo em Português</CardTitle>
                    <CardDescription>Preencha os detalhes do evento em português</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titlePt">Título *</Label>
                      <Input
                        id="titlePt"
                        value={formData.titlePt}
                        onChange={(e) => {
                          const title = e.target.value;
                          setFormData({
                            ...formData,
                            titlePt: title,
                            slug: formData.slug || generateSlug(title),
                          });
                        }}
                        placeholder="Digite o título do evento"
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL amigável)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="exemplo-de-url"
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para gerar automaticamente a partir do título
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionPt">Descrição Curta</Label>
                      <Textarea
                        id="descriptionPt"
                        value={formData.descriptionPt}
                        onChange={(e) => setFormData({ ...formData, descriptionPt: e.target.value })}
                        placeholder="Breve descrição do evento que aparecerá nas listagens..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conteúdo Completo</Label>
                      <RichTextEditor
                        content={formData.bodyPt}
                        onChange={(html) => setFormData({ ...formData, bodyPt: html })}
                        placeholder="Escreva o conteúdo detalhado do evento aqui..."
                        onImageUpload={handleImageUpload}
                      />
                      {isUploadingImage && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Enviando imagem...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="en" className="mt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content in English</CardTitle>
                    <CardDescription>Optional translations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleEn">Title</Label>
                      <Input
                        id="titleEn"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="Enter the event title in English"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionEn">Short Description</Label>
                      <Textarea
                        id="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                        placeholder="Brief description of the event..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Full Content</Label>
                      <RichTextEditor
                        content={formData.bodyEn}
                        onChange={(html) => setFormData({ ...formData, bodyEn: html })}
                        placeholder="Write the detailed event content in English here..."
                        onImageUpload={handleImageUpload}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Categoria *</Label>
                    <CreateCategoryModal onCategoryCreated={handleCategoryCreated} />
                  </div>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "A carregar..." : "Selecione uma categoria"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const ptContent = cat.contents?.find(c => c.lang === 1);
                        return (
                          <SelectItem key={cat.id} value={cat.id}>
                            {ptContent?.name || cat.id}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início *</Label>
                    <Input
                      type="date"
                      value={formData.startAt}
                      onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Fim</Label>
                    <Input
                      type="date"
                      value={formData.endAt}
                      onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Local</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Luanda, Angola"
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL do Mapa</Label>
                  <Input
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL de Registo</Label>
                  <Input
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={String(formData.status)}
                    onValueChange={(value) => setFormData({ ...formData, status: Number(value) as EventStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Rascunho</SelectItem>
                      <SelectItem value="2">Publicado</SelectItem>
                      <SelectItem value="3">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                  <Label>Activo</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Imagem de Destaque {!isNew && '(opcional)'}</CardTitle>
                <CardDescription>
                  {isNew ? 'Obrigatória para novos eventos' : 'Selecione uma nova imagem para substituir a atual'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setSelectedImageFile(file);
                      const previewUrl = URL.createObjectURL(file);
                      setCurrentImageUrl(previewUrl);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required={isNew}
                />
                
                {currentImageUrl && (
                  <div className="relative rounded-md overflow-hidden border">
                    <img src={currentImageUrl} alt="Preview" className="w-full h-48 object-cover" />
                    {!isNew && !selectedImageFile && formData.existingImageUrl && (
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
                
                {!isNew && !currentImageUrl && !selectedImageFile && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma imagem de destaque selecionada
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Informação:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>As imagens são enviadas automaticamente ao servidor quando inseridas no conteúdo</li>
                      <li>Pode adicionar novas categorias clicando no botão "+ Nova Categoria"</li>
                      <li>A imagem de destaque só é removida se clicar em "Remover" ou enviar uma nova</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 gap-2" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>

              {!isNew && formData.slug && (
                <Button type="button" variant="outline" onClick={() => window.open(`/events/${formData.slug}`, '_blank')}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}