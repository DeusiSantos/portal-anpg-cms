import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, Loader2, Menu, ExternalLink } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type MenuItem = Tables<'menu_items'>;

export default function AdminMenuItemsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    label_pt: '', label_en: '', url: '', icon: '', menu_group: 'main', parent_id: '' as string | null,
    sort_order: 0, is_visible: true, open_in_new_tab: false });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('menu_items').select('*').order('menu_group').order('sort_order');
      if (error) throw error;
      return data as MenuItem[];
    } });

  const topLevelItems = items?.filter(i => !i.parent_id) || [];

  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'menu_items'>) => {
      const { error } = await supabase.from('menu_items').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] }); toast.success('Item criado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MenuItem> }) => {
      const { error } = await supabase.from('menu_items').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] }); toast.success('Item actualizado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] }); toast.success('Item eliminado'); setDeleteItem(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const handleClose = () => { setIsDialogOpen(false); setEditing(null); setFormData({ label_pt: '', label_en: '', url: '', icon: '', menu_group: 'main', parent_id: null, sort_order: 0, is_visible: true, open_in_new_tab: false }); };

  const handleEdit = (item: MenuItem) => {
    setEditing(item);
    setFormData({ label_pt: item.label_pt, label_en: item.label_en || '', url: item.url || '', icon: item.icon || '', menu_group: item.menu_group, parent_id: item.parent_id, sort_order: item.sort_order, is_visible: item.is_visible, open_in_new_tab: item.open_in_new_tab });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label_pt) { toast.error('Label PT é obrigatório'); return; }
    const submitData = { label_pt: formData.label_pt, label_en: formData.label_en || null, url: formData.url || null, icon: formData.icon || null, menu_group: formData.menu_group, parent_id: formData.parent_id || null, sort_order: formData.sort_order, is_visible: formData.is_visible, open_in_new_tab: formData.open_in_new_tab };
    if (editing) { updateMutation.mutate({ id: editing.id, data: submitData }); } else { createMutation.mutate(submitData); }
  };

  const getChildren = (parentId: string) => items?.filter(i => i.parent_id === parentId) || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Menu / Navegação" subtitle="Gerir itens de menu do site">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div><CardTitle>Menu Items</CardTitle><CardDescription>Gerir a estrutura de navegação do website (menus, submenus)</CardDescription></div>
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow><TableHead>Label (PT)</TableHead><TableHead>Label (EN)</TableHead><TableHead>URL</TableHead><TableHead>Grupo</TableHead><TableHead>Ordem</TableHead><TableHead>Visível</TableHead><TableHead className="text-right">Acções</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {topLevelItems.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum item de menu</TableCell></TableRow>
                    ) : topLevelItems.map(item => {
                      const children = getChildren(item.id);
                      return (
                        <React.Fragment key={item.id}>
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.label_pt}</TableCell>
                            <TableCell>{item.label_en || '—'}</TableCell>
                            <TableCell className="flex items-center gap-1">{item.url || '—'}{item.open_in_new_tab && <ExternalLink className="h-3 w-3" />}</TableCell>
                            <TableCell><Badge variant="outline">{item.menu_group}</Badge></TableCell>
                            <TableCell>{item.sort_order}</TableCell>
                            <TableCell><Badge variant={item.is_visible ? 'default' : 'secondary'}>{item.is_visible ? 'Sim' : 'Não'}</Badge></TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {children.map(child => (
                            <TableRow key={child.id} className="bg-muted/30">
                              <TableCell className="pl-8">↳ {child.label_pt}</TableCell>
                              <TableCell>{child.label_en || '—'}</TableCell>
                              <TableCell>{child.url || '—'}</TableCell>
                              <TableCell><Badge variant="outline">{child.menu_group}</Badge></TableCell>
                              <TableCell>{child.sort_order}</TableCell>
                              <TableCell><Badge variant={child.is_visible ? 'default' : 'secondary'}>{child.is_visible ? 'Sim' : 'Não'}</Badge></TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(child)}><Pencil className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteItem(child)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">{items?.length || 0} item(s) de menu</div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing ? 'Editar Item' : 'Novo Item de Menu'}</DialogTitle><DialogDescription>Configure o item de navegação</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Label PT *</Label><Input value={formData.label_pt} onChange={e => setFormData({...formData, label_pt: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Label EN</Label><Input value={formData.label_en} onChange={e => setFormData({...formData, label_en: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>URL</Label><Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="/about" /></div>
                <div className="space-y-2"><Label>Ícone</Label><Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="Ex: Building, Globe" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Grupo</Label>
                  <Select value={formData.menu_group} onValueChange={v => setFormData({...formData, menu_group: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="main">Principal</SelectItem><SelectItem value="footer">Rodapé</SelectItem><SelectItem value="utility">Utilidades</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Pai</Label>
                  <Select value={formData.parent_id || 'none'} onValueChange={v => setFormData({...formData, parent_id: v === 'none' ? null : v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">— Nenhum (topo) —</SelectItem>{topLevelItems.filter(i => i.id !== editing?.id).map(i => <SelectItem key={i.id} value={i.id}>{i.label_pt}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})} /></div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={formData.is_visible} onCheckedChange={v => setFormData({...formData, is_visible: v})} /><Label>Visível</Label></div>
                <div className="flex items-center gap-2"><Switch checked={formData.open_in_new_tab} onCheckedChange={v => setFormData({...formData, open_in_new_tab: v})} /><Label>Nova aba</Label></div>
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Guardar' : 'Criar'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar Item</AlertDialogTitle><AlertDialogDescription>Eliminar "{deleteItem?.label_pt}"? Os sub-itens ficarão órfãos.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
