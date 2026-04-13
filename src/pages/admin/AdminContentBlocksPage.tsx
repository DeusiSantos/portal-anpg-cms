import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Search, Pencil, Trash2, Loader2, LayoutGrid } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type ContentBlock = Tables<'content_blocks'>;

export default function AdminContentBlocksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPage, setFilterPage] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [deleteItem, setDeleteItem] = useState<ContentBlock | null>(null);
  const [formData, setFormData] = useState({
    page_key: '', section_key: '', language: 'pt', content: '{}', sort_order: 0, is_active: true });

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['admin-content-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('content_blocks').select('*').order('page_key').order('sort_order');
      if (error) throw error;
      return data as ContentBlock[];
    } });

  const pageKeys = [...new Set(blocks?.map(b => b.page_key) || [])];

  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'content_blocks'>) => {
      const { error } = await supabase.from('content_blocks').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] }); toast.success('Bloco criado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentBlock> }) => {
      const { error } = await supabase.from('content_blocks').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] }); toast.success('Bloco actualizado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_blocks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-content-blocks'] }); toast.success('Bloco eliminado'); setDeleteItem(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const handleClose = () => { setIsDialogOpen(false); setEditing(null); setFormData({ page_key: '', section_key: '', language: 'pt', content: '{}', sort_order: 0, is_active: true }); };

  const handleEdit = (block: ContentBlock) => {
    setEditing(block);
    setFormData({ page_key: block.page_key, section_key: block.section_key, language: block.language, content: JSON.stringify(block.content, null, 2), sort_order: block.sort_order, is_active: block.is_active });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedContent;
    try { parsedContent = JSON.parse(formData.content); } catch { toast.error('JSON inválido no campo conteúdo'); return; }
    const submitData = { page_key: formData.page_key, section_key: formData.section_key, language: formData.language, content: parsedContent, sort_order: formData.sort_order, is_active: formData.is_active };
    if (editing) { updateMutation.mutate({ id: editing.id, data: submitData }); } else { createMutation.mutate(submitData); }
  };

  const filtered = blocks?.filter(b => {
    const matchSearch = b.page_key.toLowerCase().includes(search.toLowerCase()) || b.section_key.toLowerCase().includes(search.toLowerCase());
    const matchPage = filterPage === 'all' || b.page_key === filterPage;
    return matchSearch && matchPage;
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Blocos de Conteúdo" subtitle="Gerir blocos de conteúdo das páginas">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div><CardTitle>Content Blocks</CardTitle><CardDescription>Gerir secções editáveis das páginas (Hero, Estatísticas, Serviços, etc.)</CardDescription></div>
              <Button onClick={() => { setEditing(null); setFormData({ page_key: '', section_key: '', language: 'pt', content: '{}', sort_order: 0, is_active: true }); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Bloco</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
              <Select value={filterPage} onValueChange={setFilterPage}>
                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Página" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todas as Páginas</SelectItem>{pageKeys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow><TableHead>Página</TableHead><TableHead>Secção</TableHead><TableHead>Idioma</TableHead><TableHead>Ordem</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acções</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum bloco encontrado</TableCell></TableRow>
                    ) : filtered?.map(block => (
                      <TableRow key={block.id}>
                        <TableCell className="font-medium">{block.page_key}</TableCell>
                        <TableCell>{block.section_key}</TableCell>
                        <TableCell><Badge variant="outline">{block.language.toUpperCase()}</Badge></TableCell>
                        <TableCell>{block.sort_order}</TableCell>
                        <TableCell><Badge variant={block.is_active ? 'default' : 'secondary'}>{block.is_active ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(block)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteItem(block)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">{filtered?.length || 0} bloco(s)</div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar Bloco' : 'Novo Bloco de Conteúdo'}</DialogTitle><DialogDescription>Defina a página, secção e conteúdo JSON do bloco.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Página (page_key) *</Label><Input value={formData.page_key} onChange={e => setFormData({...formData, page_key: e.target.value})} placeholder="Ex: home, about" required /></div>
                <div className="space-y-2"><Label>Secção (section_key) *</Label><Input value={formData.section_key} onChange={e => setFormData({...formData, section_key: e.target.value})} placeholder="Ex: hero, stats" required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Idioma</Label>
                  <Select value={formData.language} onValueChange={v => setFormData({...formData, language: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pt">Português</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})} /></div>
                <div className="flex items-end gap-2 pb-1"><Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} /><Label>Activo</Label></div>
              </div>
              <div className="space-y-2"><Label>Conteúdo (JSON) *</Label><Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={10} className="font-mono text-xs" placeholder='{"title": "...", "description": "..."}' /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Guardar' : 'Criar'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar Bloco</AlertDialogTitle><AlertDialogDescription>Tem a certeza que deseja eliminar o bloco "{deleteItem?.page_key}/{deleteItem?.section_key}"?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
