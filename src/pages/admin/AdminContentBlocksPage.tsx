import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/service/api';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface ContentBlock {
  id: string;
  pageKey: string;
  section: string;
  language: string;
  order: number;
  status: 'Active' | 'Inactive';
  content: string;
}

interface ContentBlockResponse {
  contentBlock: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: ContentBlock[];
  };
}

export default function AdminContentBlocksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPage, setFilterPage] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [deleteItem, setDeleteItem] = useState<ContentBlock | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    pageKey: '',
    section: '',
    language: 'pt',
    content: '',
    order: 0,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Buscar todos os Content Blocks
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['admin-content-blocks'],
    queryFn: async () => {
      const response = await api.get<ContentBlockResponse>('/content-blocks');
      const blocksData = response.data?.contentBlock?.data || [];
      
      return blocksData.sort((a, b) => {
        if (a.pageKey !== b.pageKey) return a.pageKey.localeCompare(b.pageKey);
        return a.order - b.order;
      });
    }
  });

  // Extrair páginas únicas para o filtro
  const pageKeys = [...new Set(blocks?.map(b => b.pageKey) || [])];

  // Criar Content Block
  const createMutation = useMutation({
    mutationFn: async (data: Omit<ContentBlock, 'id'>) => {
      const payload = {
        contentBlock: {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
          pageKey: data.pageKey,
          section: data.section,
          language: data.language,
          order: data.order,
          status: data.status,
          content: data.content
        }
      };
      const response = await api.post('/content-blocks', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] });
      toast.success('Bloco criado com sucesso');
      handleClose();
    },
    onError: (e) => {
      const errorMsg = e.response?.data?.message || e.message || 'Erro ao criar bloco';
      toast.error(`Erro: ${errorMsg}`);
    }
  });

  // Atualizar Content Block
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentBlock> }) => {
      const payload = {
        contentBlock: {
          id: id,
          pageKey: data.pageKey,
          section: data.section,
          language: data.language,
          order: data.order,
          status: data.status,
          content: data.content
        }
      };
      const response = await api.put(`/content-blocks`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] });
      toast.success('Bloco actualizado com sucesso');
      handleClose();
    },
    onError: (e) => {
      const errorMsg = e.response?.data?.message || e.message || 'Erro ao actualizar bloco';
      toast.error(`Erro: ${errorMsg}`);
    }
  });

  // Eliminar Content Block
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/content-blocks/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] });
      toast.success('Bloco eliminado com sucesso');
      setDeleteItem(null);
    },
    onError: (e) => {
      const errorMsg = e.response?.data?.message || e.message || 'Erro ao eliminar bloco';
      toast.error(`Erro: ${errorMsg}`);
    }
  });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setShowPreview(false);
    setFormData({
      pageKey: '',
      section: '',
      language: 'pt',
      content: '',
      order: 0,
      status: 'Active'
    });
  };

  const handleEdit = (block: ContentBlock) => {
    setEditing(block);
    setFormData({
      pageKey: block.pageKey,
      section: block.section,
      language: block.language,
      content: block.content || '',
      order: block.order,
      status: block.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pageKey || !formData.section) {
      toast.error('Página e secção são obrigatórias');
      return;
    }

    const submitData = {
      pageKey: formData.pageKey,
      section: formData.section,
      language: formData.language,
      content: formData.content || '',
      order: formData.order,
      status: formData.status
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Função para fazer upload de imagem (implementar conforme sua API de imagens)
  const handleImageUpload = async (file: File): Promise<string> => {
    // TODO: Implementar upload para sua API de imagens
    // Exemplo:
    // const formData = new FormData();
    // formData.append('image', file);
    // const response = await api.post('/upload', formData);
    // return response.data.url;
    
    // Por enquanto, converte para base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Filtrar blocos
  const filtered = blocks?.filter(b => {
    const matchSearch = b.pageKey.toLowerCase().includes(search.toLowerCase()) || 
                       b.section.toLowerCase().includes(search.toLowerCase()) ||
                       (b.content && b.content.toLowerCase().includes(search.toLowerCase()));
    const matchPage = filterPage === 'all' || b.pageKey === filterPage;
    return matchSearch && matchPage;
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Função para remover tags HTML para prévia
  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + '...';
  };

  return (
    <AdminLayout title="Blocos de Conteúdo" subtitle="Gerir blocos de conteúdo das páginas">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Content Blocks</CardTitle>
                <CardDescription>Gerir secções editáveis das páginas (Hero, Estatísticas, Serviços, etc.)</CardDescription>
              </div>
              <Button onClick={() => { setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Bloco
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar por página, secção ou conteúdo..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={filterPage} onValueChange={setFilterPage}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Páginas</SelectItem>
                  {pageKeys.map(k => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Página</TableHead>
                      <TableHead>Secção</TableHead>
                      <TableHead>Idioma</TableHead>
                      <TableHead className="w-[40%]">Conteúdo (Prévia)</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum bloco encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered?.map(block => (
                        <TableRow key={block.id}>
                          <TableCell className="font-medium">
                            <Badge variant="outline">{block.pageKey}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{block.section}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{block.language.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {truncateText(block.content, 100)}
                          </TableCell>
                          <TableCell>{block.order}</TableCell>
                          <TableCell>
                            <Badge variant={block.status === 'Active' ? 'default' : 'secondary'}>
                              {block.status === 'Active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(block)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteItem(block)}>
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
              {filtered?.length || 0} bloco(s)
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Bloco' : 'Novo Bloco de Conteúdo'}</DialogTitle>
            <DialogDescription>Defina a página, secção e conteúdo do bloco usando o editor rich text.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Página (pageKey) *</Label>
                  <Input 
                    value={formData.pageKey} 
                    onChange={e => setFormData({...formData, pageKey: e.target.value})} 
                    placeholder="Ex: home, about, services" 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">Identificador único da página</p>
                </div>
                <div className="space-y-2">
                  <Label>Secção (section) *</Label>
                  <Input 
                    value={formData.section} 
                    onChange={e => setFormData({...formData, section: e.target.value})} 
                    placeholder="Ex: hero, stats, services" 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">Identificador da secção na página</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select value={formData.language} onValueChange={v => setFormData({...formData, language: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input 
                    type="number" 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})} 
                  />
                  <p className="text-xs text-muted-foreground">Ordem de exibição</p>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as 'Active' | 'Inactive'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Activo</SelectItem>
                      <SelectItem value="Inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Conteúdo *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Pré-visualizar
                      </>
                    )}
                  </Button>
                </div>
                
                {showPreview ? (
                  <div className="border rounded-lg p-6 min-h-[300px] bg-muted/20">
                    <div 
                      className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-muted-foreground italic">Sem conteúdo para pré-visualizar</p>' }}
                    />
                  </div>
                ) : (
                  <RichTextEditor
                    content={formData.content}
                    onChange={(html) => setFormData({...formData, content: html})}
                    placeholder="Escreva o conteúdo aqui. Use as ferramentas de formatação para criar textos ricos..."
                    onImageUpload={handleImageUpload}
                  />
                )}
              </div>
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
            <AlertDialogTitle>Eliminar Bloco</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o bloco "{deleteItem?.pageKey}/{deleteItem?.section}"?
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