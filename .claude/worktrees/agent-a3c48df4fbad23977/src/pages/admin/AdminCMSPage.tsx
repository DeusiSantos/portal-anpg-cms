import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import RichTextEditor from '@/components/admin/RichTextEditor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  Eye,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CMSPage = Tables<'cms_pages'>;

const STATUSES = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

const emptyPage: Partial<TablesInsert<'cms_pages'>> = {
  title: '',
  slug: '',
  content: '',
  meta_description: '',
  status: 'draft',
};

export default function AdminCMSPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [formData, setFormData] = useState<Partial<TablesInsert<'cms_pages'>>>(emptyPage);
  const [deletePage, setDeletePage] = useState<CMSPage | null>(null);

  // Fetch pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['admin-cms-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as CMSPage[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'cms_pages'>) => {
      const { error } = await supabase.from('cms_pages').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] });
      toast.success('Página criada com sucesso');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao criar página: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<'cms_pages'> }) => {
      const { error } = await supabase.from('cms_pages').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] });
      toast.success('Página actualizada com sucesso');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao actualizar página: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] });
      toast.success('Página eliminada com sucesso');
      setDeletePage(null);
    },
    onError: (error) => {
      toast.error(`Erro ao eliminar página: ${error.message}`);
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormData(emptyPage);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (page: CMSPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      meta_description: page.meta_description || '',
      status: page.status,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    setFormData(emptyPage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      toast.error('Título e slug são obrigatórios');
      return;
    }

    const submitData: TablesInsert<'cms_pages'> = {
      title: formData.title!,
      slug: formData.slug!,
      content: formData.content || null,
      meta_description: formData.meta_description || null,
      status: formData.status || 'draft',
      author_id: user?.id || null,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    };

    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const filteredPages = pages?.filter((page) =>
    page.title.toLowerCase().includes(search.toLowerCase()) ||
    page.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-status-success text-white">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Páginas CMS" subtitle="Gerir páginas de conteúdo">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Gestão de Páginas</CardTitle>
                <CardDescription>Criar e editar páginas do website</CardDescription>
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Página
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar páginas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Última Actualização</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma página encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPages?.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell className="font-medium">{page.title}</TableCell>
                          <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                          <TableCell>{getStatusBadge(page.status)}</TableCell>
                          <TableCell>
                            {format(new Date(page.updated_at), "d MMM yyyy 'às' HH:mm", { locale: pt })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {page.status === 'published' && (
                                <Button variant="ghost" size="icon" asChild>
                                  <Link to={`/${page.slug}`} target="_blank">
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(page)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeletePage(page)}>
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
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Editar Página' : 'Criar Nova Página'}</DialogTitle>
            <DialogDescription>
              {editingPage ? 'Actualizar conteúdo da página' : 'Preencha os dados da nova página'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                        slug: formData.slug || generateSlug(title),
                      });
                    }}
                    placeholder="Título da página"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="titulo-da-pagina"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Descrição (SEO)</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ''}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Descrição para motores de busca..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <RichTextEditor
                  content={formData.content || ''}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                  placeholder="Escreva o conteúdo da página..."
                />
              </div>

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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPage ? 'Actualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePage} onOpenChange={() => setDeletePage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Página</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar a página "{deletePage?.title}"?
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePage && deleteMutation.mutate(deletePage.id)}
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
