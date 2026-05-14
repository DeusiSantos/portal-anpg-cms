import { useState } from 'react';
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, Loader2, LayoutGrid } from 'lucide-react';
import api from '@/service/api';

// Tipos da API
interface ContentBlockContent {
  lang: number;
  [key: string]: any; // Conteúdo dinâmico por idioma
}

interface ContentBlock {
  id: string;
  pageKey: string;
  sectionKey: string;
  order: number;
  contents: ContentBlockContent[];
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface ContentBlocksResponse {
  items: ContentBlock[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ContentBlockFormData {
  pageKey: string;
  sectionKey: string;
  order: number;
  contentPt: Record<string, any>;
  contentEn: Record<string, any>;
  isActive: boolean;
}

// Função para obter conteúdo por idioma
const getContentByLang = (contents: ContentBlockContent[], lang: number): Record<string, any> => {
  const content = contents?.find(c => c.lang === lang);
  if (!content) return {};
  // Remover o campo lang do objeto
  const { lang: _, ...rest } = content;
  return rest;
};

// Função para construir o objeto de conteúdo para a API
const buildContents = (contentPt: Record<string, any>, contentEn: Record<string, any>): ContentBlockContent[] => {
  const contents: ContentBlockContent[] = [];
  
  if (contentPt && Object.keys(contentPt).length > 0) {
    contents.push({ lang: 1, ...contentPt });
  }
  
  if (contentEn && Object.keys(contentEn).length > 0) {
    contents.push({ lang: 2, ...contentEn });
  }
  
  return contents;
};

export default function AdminContentBlocksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPage, setFilterPage] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [deleteItem, setDeleteItem] = useState<ContentBlock | null>(null);
  const [formData, setFormData] = useState<ContentBlockFormData>({
    pageKey: '',
    sectionKey: '',
    order: 0,
    contentPt: {},
    contentEn: {},
    isActive: true,
  });
  const [contentPtJson, setContentPtJson] = useState('{}');
  const [contentEnJson, setContentEnJson] = useState('{}');

  // Buscar content blocks da API
  const { data: blocksResponse, isLoading } = useQuery({
    queryKey: ['admin-content-blocks'],
    queryFn: async () => {
      const response = await api.get<ContentBlocksResponse>('/content-blocks', {
        params: { page: 1, pageSize: 100 }
      });
      return response.data;
    }
  });

  const blocks = blocksResponse?.items || [];
  
  // Páginas únicas para filtro
  const pageKeys = [...new Set(blocks.map(b => b.pageKey))];

  // Criar content block
  const createMutation = useMutation({
    mutationFn: async (data: ContentBlockFormData) => {
      const payload = {
        pageKey: data.pageKey,
        sectionKey: data.sectionKey,
        order: data.order,
        contents: buildContents(data.contentPt, data.contentEn),
        isActive: data.isActive,
      };
      const response = await api.post('/content-blocks', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] });
      toast.success('Bloco criado com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao criar bloco:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar bloco');
    },
  });

  // Atualizar content block
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContentBlockFormData }) => {
      const payload = {
        pageKey: data.pageKey,
        sectionKey: data.sectionKey,
        order: data.order,
        contents: buildContents(data.contentPt, data.contentEn),
        isActive: data.isActive,
      };
      const response = await api.put(`/content-blocks/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] });
      toast.success('Bloco actualizado com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao actualizar bloco:', error);
      toast.error(error.response?.data?.message || 'Erro ao actualizar bloco');
    },
  });

  // Eliminar content block
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
    onError: (error: any) => {
      console.error('Erro ao eliminar bloco:', error);
      toast.error(error.response?.data?.message || 'Erro ao eliminar bloco');
    },
  });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setFormData({
      pageKey: '',
      sectionKey: '',
      order: 0,
      contentPt: {},
      contentEn: {},
      isActive: true,
    });
    setContentPtJson('{}');
    setContentEnJson('{}');
  };

  const handleEdit = (block: ContentBlock) => {
    const ptContent = getContentByLang(block.contents, 1);
    const enContent = getContentByLang(block.contents, 2);
    
    setEditing(block);
    setFormData({
      pageKey: block.pageKey,
      sectionKey: block.sectionKey,
      order: block.order,
      contentPt: ptContent,
      contentEn: enContent,
      isActive: block.isActive,
    });
    setContentPtJson(JSON.stringify(ptContent, null, 2));
    setContentEnJson(JSON.stringify(enContent, null, 2));
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pageKey) {
      toast.error('Page Key é obrigatório');
      return;
    }
    
    if (!formData.sectionKey) {
      toast.error('Section Key é obrigatório');
      return;
    }
    
    // Validar JSON
    let parsedPt: Record<string, any> = {};
    let parsedEn: Record<string, any> = {};
    
    try {
      parsedPt = JSON.parse(contentPtJson);
    } catch {
      toast.error('JSON inválido no conteúdo em português');
      return;
    }
    
    try {
      parsedEn = JSON.parse(contentEnJson);
    } catch {
      toast.error('JSON inválido no conteúdo em inglês');
      return;
    }
    
    const submitData = {
      ...formData,
      contentPt: parsedPt,
      contentEn: parsedEn,
    };
    
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Filtrar blocos
  const filtered = blocks.filter(block => {
    const matchSearch = block.pageKey.toLowerCase().includes(search.toLowerCase()) || 
                        block.sectionKey.toLowerCase().includes(search.toLowerCase());
    const matchPage = filterPage === 'all' || block.pageKey === filterPage;
    return matchSearch && matchPage;
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}>
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
                  placeholder="Pesquisar por página ou secção..." 
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
                  {pageKeys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
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
                      <TableHead>Conteúdo</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum bloco encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(block => {
                        const ptContent = getContentByLang(block.contents, 1);
                        const hasContent = Object.keys(ptContent).length > 0;
                        return (
                          <TableRow key={block.id}>
                            <TableCell className="font-medium">{block.pageKey}</TableCell>
                            <TableCell>{block.sectionKey}</TableCell>
                            <TableCell>
                              {hasContent ? (
                                <Badge variant="outline" className="text-xs">
                                  {Object.keys(ptContent).join(', ')}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                            <TableCell>{block.order}</TableCell>
                            <TableCell>
                              <Badge variant={block.isActive ? 'default' : 'secondary'}>
                                {block.isActive ? 'Activo' : 'Inactivo'}
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
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              {filtered.length} bloco(s)
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog para criar/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Bloco' : 'Novo Bloco de Conteúdo'}</DialogTitle>
            <DialogDescription>Defina a página, secção e conteúdo do bloco para cada idioma.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Página (pageKey) *</Label>
                  <Input 
                    value={formData.pageKey} 
                    onChange={e => setFormData({...formData, pageKey: e.target.value})} 
                    placeholder="Ex: home, about" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secção (sectionKey) *</Label>
                  <Input 
                    value={formData.sectionKey} 
                    onChange={e => setFormData({...formData, sectionKey: e.target.value})} 
                    placeholder="Ex: hero, stats" 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input 
                    type="number" 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})} 
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch 
                    checked={formData.isActive} 
                    onCheckedChange={v => setFormData({...formData, isActive: v})} 
                  />
                  <Label>Activo</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Conteúdo (JSON)</Label>
                <Tabs defaultValue="pt" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pt">Português</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pt" className="space-y-2 pt-2">
                    <Textarea 
                      value={contentPtJson} 
                      onChange={e => setContentPtJson(e.target.value)} 
                      rows={10} 
                      className="font-mono text-xs"
                      placeholder='{"title": "...", "description": "..."}'
                    />
                    <p className="text-xs text-muted-foreground">
                      Insira o conteúdo em formato JSON. Exemplo: {"{ \"title\": \"Título\", \"subtitle\": \"Subtítulo\" }"}
                    </p>
                  </TabsContent>
                  <TabsContent value="en" className="space-y-2 pt-2">
                    <Textarea 
                      value={contentEnJson} 
                      onChange={e => setContentEnJson(e.target.value)} 
                      rows={10} 
                      className="font-mono text-xs"
                      placeholder='{"title": "...", "description": "..."}'
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter content in JSON format. Example: {"{ \"title\": \"Title\", \"subtitle\": \"Subtitle\" }"}
                    </p>
                  </TabsContent>
                </Tabs>
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

      {/* Alert Dialog para confirmar exclusão */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Bloco</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o bloco "{deleteItem?.pageKey}/{deleteItem?.sectionKey}"?
              Esta acção não pode ser revertida.
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