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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Clock } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { ImageUpload } from '@/components/admin/ImageUpload';

type HistoryEvent = Tables<'history_events'>;

export default function AdminHistoryEventsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HistoryEvent | null>(null);
  const [deleteItem, setDeleteItem] = useState<HistoryEvent | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(), title_pt: '', title_en: '', description_pt: '', description_en: '', image_url: '', sort_order: 0, is_active: true });

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-history-events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('history_events').select('*').order('year').order('sort_order');
      if (error) throw error;
      return data as HistoryEvent[];
    } });

  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'history_events'>) => {
      const { error } = await supabase.from('history_events').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-history-events'] }); toast.success('Evento criado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HistoryEvent> }) => {
      const { error } = await supabase.from('history_events').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-history-events'] }); toast.success('Evento actualizado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('history_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-history-events'] }); toast.success('Evento eliminado'); setDeleteItem(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const handleClose = () => { setIsDialogOpen(false); setEditing(null); setFormData({ year: new Date().getFullYear(), title_pt: '', title_en: '', description_pt: '', description_en: '', image_url: '', sort_order: 0, is_active: true }); };

  const handleEdit = (ev: HistoryEvent) => {
    setEditing(ev);
    setFormData({ year: ev.year, title_pt: ev.title_pt, title_en: ev.title_en || '', description_pt: ev.description_pt || '', description_en: ev.description_en || '', image_url: ev.image_url || '', sort_order: ev.sort_order, is_active: ev.is_active });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_pt || !formData.year) { toast.error('Ano e título PT são obrigatórios'); return; }
    const submitData = { year: formData.year, title_pt: formData.title_pt, title_en: formData.title_en || null, description_pt: formData.description_pt || null, description_en: formData.description_en || null, image_url: formData.image_url || null, sort_order: formData.sort_order, is_active: formData.is_active };
    if (editing) { updateMutation.mutate({ id: editing.id, data: submitData }); } else { createMutation.mutate(submitData); }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Linha do Tempo" subtitle="Gerir eventos históricos">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div><CardTitle>Eventos Históricos</CardTitle><CardDescription>Gerir marcos da timeline "A Nossa História"</CardDescription></div>
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Evento</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow><TableHead>Ano</TableHead><TableHead>Título</TableHead><TableHead>Imagem</TableHead><TableHead>Ordem</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acções</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {events?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum evento registado</TableCell></TableRow>
                    ) : events?.map(ev => (
                      <TableRow key={ev.id}>
                        <TableCell className="font-bold text-lg">{ev.year}</TableCell>
                        <TableCell className="font-medium">{ev.title_pt}</TableCell>
                        <TableCell>{ev.image_url ? <img src={ev.image_url} alt="" className="h-8 w-16 object-cover rounded" /> : '—'}</TableCell>
                        <TableCell>{ev.sort_order}</TableCell>
                        <TableCell><Badge variant={ev.is_active ? 'default' : 'secondary'}>{ev.is_active ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(ev)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteItem(ev)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">{events?.length || 0} evento(s)</div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar Evento' : 'Novo Evento Histórico'}</DialogTitle><DialogDescription>Adicione um marco à linha do tempo da ANPG</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Ano *</Label><Input type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} required /></div>
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})} /></div>
                <div className="flex items-end gap-2 pb-1"><Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} /><Label>Activo</Label></div>
              </div>
              <div className="space-y-2"><Label>Título PT *</Label><Input value={formData.title_pt} onChange={e => setFormData({...formData, title_pt: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Título EN</Label><Input value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} /></div>
              <div className="space-y-2"><Label>Descrição PT</Label><Textarea value={formData.description_pt} onChange={e => setFormData({...formData, description_pt: e.target.value})} rows={4} /></div>
              <div className="space-y-2"><Label>Descrição EN</Label><Textarea value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} rows={4} /></div>
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({...formData, image_url: url})} folder="history-events" label="Imagem do Evento" />
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Guardar' : 'Criar'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar Evento</AlertDialogTitle><AlertDialogDescription>Eliminar o evento "{deleteItem?.title_pt}" ({deleteItem?.year})?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
