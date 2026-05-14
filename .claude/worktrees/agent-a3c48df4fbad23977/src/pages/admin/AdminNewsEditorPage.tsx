import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { cn } from '@/lib/utils';
import api, { getFullImageUrl } from '@/service/api';
import { fileService } from '@/service/fileService';

// Tipos da nova API
type NewsState = 1 | 2 | 3;

interface NewsContent {
  lang: number;
  title: string;
  excerpt: string;
  content: string;
}

interface NewsItem {
  id: string;
  slug: string;
  state: NewsState;
  newsCategoryId: string;
  destaqueImageUrl: string | null;
  destaqueImagePath: string | null;
  contents: NewsContent[];
  createdAt: string;
  isActive: boolean;
}

interface NewsCategory {
  id: string;
  name: string;
  isActive: boolean;
}

interface NewsCategoryResponse {
  items: NewsCategory[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface NewsFormData {
  id?: string;
  slug: string;
  state: NewsState;
  newsCategoryId: string;
  existingImageUrl?: string | null;
  destaqueImageFile?: File;
  titlePt: string;
  excerptPt: string;
  contentPt: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  isActive: boolean;
}

const STATE_CONFIG: Record<NewsState, { label: string; color: string; icon: any; description: string }> = {
  1: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: Edit,
    description: 'Rascunho da notícia. Pode ser editado livremente.'
  },
  2: {
    label: 'Publicado',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: Send,
    description: 'Notícia publicada no site. Visível para o público.'
  },
  3: {
    label: 'Arquivado',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    icon: Archive,
    description: 'Notícia arquivada. Não está visível no site principal.'
  }
};

function StatusBadge({ state, size = 'default' }: { state: NewsState; size?: 'sm' | 'default' }) {
  const config = STATE_CONFIG[state];
  const Icon = config?.icon || Edit;
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 font-medium",
      size === 'sm' ? 'text-xs px-2 py-0.5 rounded-full' : 'text-sm px-3 py-1.5 rounded-full',
      config?.color
    )}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config?.label || state}
    </div>
  );
}

function CreateCategoryModal({ onCategoryCreated }: { onCategoryCreated: (category: NewsCategory) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<NewsCategory>('/news-categories', { name: name.trim() });
      toast.success('Categoria criada com sucesso!');
      onCategoryCreated(response.data);
      setOpen(false);
      setName('');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para as notícias.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nome da Categoria</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tecnologia, Esportes, etc."
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
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

export default function AdminNewsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState<NewsFormData>({
    slug: '',
    state: 1,
    newsCategoryId: '',
    existingImageUrl: null,
    titlePt: '',
    excerptPt: '',
    contentPt: '',
    titleEn: '',
    excerptEn: '',
    contentEn: '',
    isActive: true,
  });

  const [currentState, setCurrentState] = useState<NewsState>(1);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('pt');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.get<NewsCategoryResponse>('/news-categories', {
        params: { Page: 1, PageSize: 100 }
      });
      setCategories(response.data.items);
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
      fetchArticle();
    }
  }, [id, isNew]);

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<NewsItem>(`/news/${id}`);
      const article = response.data;

      const portugueseContent = article.contents?.find(c => c.lang === 1);
      const englishContent = article.contents?.find(c => c.lang === 2);

      setFormData({
        id: article.id,
        slug: article.slug || '',
        state: article.state || 1,
        newsCategoryId: article.newsCategoryId || '',
        existingImageUrl: article.destaqueImageUrl,
        titlePt: portugueseContent?.title || '',
        excerptPt: portugueseContent?.excerpt || '',
        contentPt: portugueseContent?.content || '',
        titleEn: englishContent?.title || '',
        excerptEn: englishContent?.excerpt || '',
        contentEn: englishContent?.content || '',
        isActive: article.isActive ?? true,
      });

      setCurrentState(article.state || 1);

      if (article.destaqueImageUrl) {
        const fullImageUrl = getFullImageUrl(article.destaqueImageUrl);
        setCurrentImageUrl(fullImageUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar artigo:', error);
      toast.error('Erro ao carregar os dados da notícia');
    } finally {
      setIsLoading(false);
    }
  };

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const saveMutation = useMutation({
    mutationFn: async (data: NewsFormData) => {
      const formDataToSend = new FormData();

      if (isNew) {
        // Criar nova notícia
        formDataToSend.append('Slug', data.slug || generateSlug(data.titlePt));
        formDataToSend.append('State', String(data.state));
        formDataToSend.append('NewsCategoryId', data.newsCategoryId);
        formDataToSend.append('TitlePt', data.titlePt);
        formDataToSend.append('ExcerptPt', data.excerptPt || '');
        formDataToSend.append('ContentPt', data.contentPt);
        formDataToSend.append('TitleEn', data.titleEn || '');
        formDataToSend.append('ExcerptEn', data.excerptEn || '');
        formDataToSend.append('ContentEn', data.contentEn || '');
        formDataToSend.append('IsActive', String(data.isActive));

        if (data.destaqueImageFile) {
          formDataToSend.append('DestaqueImageAttachment', data.destaqueImageFile);
        }

        const response = await api.post('/news/from-form', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        return response.data;
      } else {
        // Atualizar notícia existente - usa PATCH com /from-form
        formDataToSend.append('Id', id!);
        formDataToSend.append('Slug', data.slug || generateSlug(data.titlePt));
        formDataToSend.append('State', String(data.state));
        formDataToSend.append('NewsCategoryId', data.newsCategoryId);
        formDataToSend.append('TitlePt', data.titlePt);
        formDataToSend.append('ExcerptPt', data.excerptPt || '');
        formDataToSend.append('ContentPt', data.contentPt);
        formDataToSend.append('TitleEn', data.titleEn || '');
        formDataToSend.append('ExcerptEn', data.excerptEn || '');
        formDataToSend.append('ContentEn', data.contentEn || '');
        formDataToSend.append('IsActive', String(data.isActive));

        // Verificar se deve remover a imagem de destaque:
        // Remove apenas se o usuário selecionou explicitamente um novo arquivo
        // NÃO remove se não há arquivo selecionado E já existe uma imagem
        const hasExistingImage = !!data.existingImageUrl;
        const hasNewImage = !!data.destaqueImageFile;
        
        // Remove apenas se o usuário explicitamente quer substituir a imagem
        // ou se não há imagem existente (caso raro)
        const shouldRemoveImage = hasNewImage || (!hasExistingImage && !hasNewImage);
        
        formDataToSend.append('RemoveDestaqueImage', String(shouldRemoveImage));

        if (data.destaqueImageFile) {
          formDataToSend.append('DestaqueImageAttachment', data.destaqueImageFile);
        }

        // Verificar se deve remover o conteúdo em inglês
        const shouldRemoveEnglish = !data.titleEn && !data.excerptEn && !data.contentEn;
        formDataToSend.append('RemoveEnglish', String(shouldRemoveEnglish));

        const response = await api.patch(`/news/from-form`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success(isNew ? 'Notícia criada com sucesso' : 'Notícia actualizada com sucesso');

      if (isNew) {
        navigate('/admin/news');
      } else {
        fetchArticle();
      }
    },
    onError: (error: any) => {
      console.error('Erro detalhado:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao guardar a notícia';
      toast.error(`Erro ao guardar: ${errorMessage}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titlePt) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.newsCategoryId) {
      toast.error('Selecione uma categoria');
      return;
    }

    if (isNew && !selectedImageFile) {
      toast.error('A imagem de destaque é obrigatória');
      return;
    }

    const dataToSubmit = {
      ...formData,
      slug: formData.slug || generateSlug(formData.titlePt),
      destaqueImageFile: selectedImageFile || undefined,
    };

    saveMutation.mutate(dataToSubmit);
  };

  // Função para remover a imagem existente
  const handleRemoveExistingImage = () => {
    setSelectedImageFile(null);
    setFormData(prev => ({ ...prev, existingImageUrl: null }));
    setCurrentImageUrl('');
    toast.info('Imagem será removida ao guardar');
  };

  const handleCategoryCreated = (newCategory: NewsCategory) => {
    setCategories(prev => [...prev, newCategory]);
    setFormData(prev => ({ ...prev, newsCategoryId: newCategory.id }));
    toast.success(`Categoria "${newCategory.name}" adicionada e selecionada!`);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Editor de Notícias">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Editor de Notícias">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/news')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            {!isNew && <StatusBadge state={currentState} />}
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
                    <CardDescription>Preencha os detalhes da notícia em português</CardDescription>
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
                        placeholder="Digite o título da notícia"
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerptPt">Excerto / Resumo</Label>
                      <Textarea
                        id="excerptPt"
                        value={formData.excerptPt}
                        onChange={(e) => setFormData({ ...formData, excerptPt: e.target.value })}
                        placeholder="Breve resumo da notícia..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conteúdo Completo</Label>
                      <RichTextEditor
                        content={formData.contentPt}
                        onChange={(html) => setFormData({ ...formData, contentPt: html })}
                        placeholder="Escreva o conteúdo da notícia aqui..."
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
                        placeholder="Enter the article title in English"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerptEn">Excerpt</Label>
                      <Textarea
                        id="excerptEn"
                        value={formData.excerptEn}
                        onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                        placeholder="Brief summary of the article..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Full Content</Label>
                      <RichTextEditor
                        content={formData.contentEn}
                        onChange={(html) => setFormData({ ...formData, contentEn: html })}
                        placeholder="Write the article content in English here..."
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
                    value={formData.newsCategoryId}
                    onValueChange={(value) => setFormData({ ...formData, newsCategoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "A carregar..." : "Selecione uma categoria"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={String(formData.state)}
                    onValueChange={(value) => setFormData({ ...formData, state: Number(value) as NewsState })}
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Activo
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Imagem de Destaque {!isNew && '(opcional)'} *</CardTitle>
                <CardDescription>
                  {isNew ? 'Obrigatória para novas notícias' : 'Selecione uma nova imagem para substituir a atual'}
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
                    <img src={currentImageUrl} alt="Preview" className="w-full h-40 object-cover" />
                    {!isNew && !selectedImageFile && formData.existingImageUrl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveExistingImage}
                        className="absolute top-2 right-2"
                      >
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
                      <li>As imagens são enviadas automaticamente ao servidor quando inseridas</li>
                      <li>Pode adicionar novas categorias</li>
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
                <Button type="button" variant="outline" onClick={() => window.open(`/news/${formData.slug}`, '_blank')}>
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