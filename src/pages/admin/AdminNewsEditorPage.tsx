import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Eye, Loader2 } from 'lucide-react';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';

type NewsArticle = Tables<'news_articles'>;

const CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'producao', label: 'Produção' },
  { value: 'exploracao', label: 'Exploração' },
  { value: 'licitacao', label: 'Licitação' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'sustentabilidade', label: 'Sustentabilidade' },
];

const STATUSES = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

export default function AdminNewsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState<Partial<TablesInsert<'news_articles'>> & { title_en?: string; excerpt_en?: string; content_en?: string }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'geral',
    status: 'draft',
    featured_image: '',
    title_en: '',
    excerpt_en: '',
    content_en: '' });
  

  // Fetch article if editing
  const { data: article, isLoading } = useQuery({
    queryKey: ['admin-article', id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as NewsArticle | null;
    },
    enabled: !isNew });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content || '',
        category: article.category || 'geral',
        status: article.status,
        featured_image: article.featured_image || '',
        title_en: (article as any).title_en || '',
        excerpt_en: (article as any).excerpt_en || '',
        content_en: (article as any).content_en || '' });
    }
  }, [article]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: TablesInsert<'news_articles'> | TablesUpdate<'news_articles'>) => {
      if (isNew) {
        const { error } = await supabase.from('news_articles').insert(data as TablesInsert<'news_articles'>);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news_articles').update(data).eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success(isNew ? 'Notícia criada com sucesso' : 'Notícia actualizada com sucesso');
      navigate('/admin/news');
    },
    onError: (error) => {
      toast.error(`Erro ao guardar: ${error.message}`);
    } });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      toast.error('Título e slug são obrigatórios');
      return;
    }

    const submitData: any = {
      title: formData.title!,
      slug: formData.slug!,
      excerpt: formData.excerpt || null,
      content: formData.content || null,
      category: formData.category || 'geral',
      status: formData.status || 'draft',
      featured_image: formData.featured_image || null,
      author_id: user?.id || null,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
      title_en: formData.title_en || null,
      excerpt_en: formData.excerpt_en || null,
      content_en: formData.content_en || null };

    saveMutation.mutate(submitData);
  };

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout title="Editor de Notícias">

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: formData.slug || generateSlug(title) });
                    }}
                    placeholder="Título da notícia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="titulo-da-noticia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerto</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Breve descrição da notícia..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <RichTextEditor
                    content={formData.content || ''}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    placeholder="Escreva o conteúdo da notícia..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* English Content */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo em Inglês (EN)</CardTitle>
                <CardDescription>Traduções opcionais — se vazias, será exibido o conteúdo em Português</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title_en">Title (EN)</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Article title in English"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt_en">Excerpt (EN)</Label>
                  <Textarea
                    id="excerpt_en"
                    value={formData.excerpt_en || ''}
                    onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                    placeholder="Brief description in English..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content (EN)</Label>
                  <RichTextEditor
                    content={formData.content_en || ''}
                    onChange={(html) => setFormData({ ...formData, content_en: html })}
                    placeholder="Write the article content in English..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.status || 'draft'}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category || 'geral'}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imagem de Destaque</CardTitle>
                <CardDescription>Imagem principal da notícia (16:9)</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.featured_image || ''}
                  onChange={(url) => setFormData({ ...formData, featured_image: url })}
                  folder="news"
                  label="Imagem de destaque"
                  cropAspectRatio={16 / 9}
                  maxWidth={1920}
                  maxHeight={1080}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </AdminLayout>
  );
}
