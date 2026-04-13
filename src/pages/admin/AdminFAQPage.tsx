import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type FAQItem = Tables<'faq_items'>;

const CATEGORIES = ['general', 'licensing', 'production', 'investment', 'technical'];

export default function AdminFAQPage() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question_pt: '', question_en: '', answer_pt: '', answer_en: '', category: 'general', sort_order: 0, is_active: true });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-faq-items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faq_items').select('*').order('category').order('sort_order');
      if (error) throw error;
      return data as FAQItem[];
    } });

  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'faq_items'>) => {
      const { error } = await supabase.from('faq_items').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] }); toast.success('FAQ criada'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FAQItem> }) => {
      const { error } = await supabase.from('faq_items').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] }); toast.success('FAQ actualizada'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faq_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] }); toast.success('FAQ eliminada'); setDeleteItem(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const handleClose = () => { setIsDialogOpen(false); setEditing(null); setFormData({ question_pt: '', question_en: '', answer_pt: '', answer_en: '', category: 'general', sort_order: 0, is_active: true }); };

  const handleEdit = (item: FAQItem) => {
    setEditing(item);
    setFormData({ question_pt: item.question_pt, question_en: item.question_en || '', answer_pt: item.answer_pt, answer_en: item.answer_en || '', category: item.category, sort_order: item.sort_order, is_active: item.is_active });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_pt || !formData.answer_pt) { toast.error('Pergunta e resposta PT são obrigatórias'); return; }
    const submitData = { question_pt: formData.question_pt, question_en: formData.question_en || null, answer_pt: formData.answer_pt, answer_en: formData.answer_en || null, category: formData.category, sort_order: formData.sort_order, is_active: formData.is_active };
    if (editing) { updateMutation.mutate({ id: editing.id, data: submitData }); } else { createMutation.mutate(submitData); }
  };

  const filtered = items?.filter(i => filterCategory === 'all' || i.category === filterCategory);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="FAQ" subtitle="Gerir perguntas frequentes">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div><CardTitle>FAQ</CardTitle><CardDescription>Gerir perguntas e respostas frequentes do website</CardDescription></div>
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova FAQ</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todas</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground self-center">{filtered?.length || 0} FAQ(s)</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow><TableHead>Pergunta</TableHead><TableHead>Categoria</TableHead><TableHead>Ordem</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acções</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma FAQ encontrada</TableCell></TableRow>
                    ) : filtered?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-md truncate">{item.question_pt}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{item.category}</Badge></TableCell>
                        <TableCell>{item.sort_order}</TableCell>
                        <TableCell><Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Activa' : 'Inactiva'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar FAQ' : 'Nova FAQ'}</DialogTitle><DialogDescription>Preencha a pergunta e resposta em ambos os idiomas</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Pergunta PT *</Label><Input value={formData.question_pt} onChange={e => setFormData({...formData, question_pt: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Pergunta EN</Label><Input value={formData.question_en} onChange={e => setFormData({...formData, question_en: e.target.value})} /></div>
              <div className="space-y-2"><Label>Resposta PT *</Label><Textarea value={formData.answer_pt} onChange={e => setFormData({...formData, answer_pt: e.target.value})} rows={4} required /></div>
              <div className="space-y-2"><Label>Resposta EN</Label><Textarea value={formData.answer_en} onChange={e => setFormData({...formData, answer_en: e.target.value})} rows={4} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})} /></div>
                <div className="flex items-end gap-2 pb-1"><Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} /><Label>Activa</Label></div>
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Guardar' : 'Criar'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar FAQ</AlertDialogTitle><AlertDialogDescription>Eliminar esta pergunta frequente?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
