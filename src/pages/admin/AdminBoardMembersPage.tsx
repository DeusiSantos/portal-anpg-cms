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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { BoardDepartmentsManager } from '@/components/admin/BoardDepartmentsManager';

type BoardMember = Tables<'board_members'>;

const GROUP_OPTIONS = [
  { value: 'board', label: 'Conselho de Administração' },
  { value: 'executive', label: 'Direcção Executiva' },
  { value: 'fiscal', label: 'Conselho Fiscal' },
];

export default function AdminBoardMembersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BoardMember | null>(null);
  const [deleteItem, setDeleteItem] = useState<BoardMember | null>(null);
  const [formData, setFormData] = useState({
    full_name: '', slug: '', title_pt: '', title_en: '', role_pt: '', role_en: '',
    bio_pt: '', bio_en: '', message_pt: '', message_en: '', photo_url: '',
    email: '', phone: '', office_location: '', group_key: 'board', sort_order: 0, is_active: true });

  const { data: members, isLoading } = useQuery({
    queryKey: ['admin-board-members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('board_members').select('*').order('group_key').order('sort_order');
      if (error) throw error;
      return data as BoardMember[];
    } });

  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'board_members'>) => {
      const { error } = await supabase.from('board_members').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-board-members'] }); toast.success('Membro criado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BoardMember> }) => {
      const { error } = await supabase.from('board_members').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-board-members'] }); toast.success('Membro actualizado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('board_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-board-members'] }); toast.success('Membro eliminado'); setDeleteItem(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const handleClose = () => {
    setIsDialogOpen(false); setEditing(null);
    setFormData({ full_name: '', slug: '', title_pt: '', title_en: '', role_pt: '', role_en: '', bio_pt: '', bio_en: '', message_pt: '', message_en: '', photo_url: '', email: '', phone: '', office_location: '', group_key: 'board', sort_order: 0, is_active: true });
  };

  const handleEdit = (m: BoardMember) => {
    setEditing(m);
    setFormData({ full_name: m.full_name, slug: m.slug, title_pt: m.title_pt, title_en: m.title_en || '', role_pt: m.role_pt || '', role_en: m.role_en || '', bio_pt: m.bio_pt || '', bio_en: m.bio_en || '', message_pt: m.message_pt || '', message_en: m.message_en || '', photo_url: m.photo_url || '', email: m.email || '', phone: m.phone || '', office_location: m.office_location || '', group_key: m.group_key, sort_order: m.sort_order, is_active: m.is_active });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.slug || !formData.title_pt) { toast.error('Nome, slug e título PT são obrigatórios'); return; }
    const submitData = { full_name: formData.full_name, slug: formData.slug, title_pt: formData.title_pt, title_en: formData.title_en || null, role_pt: formData.role_pt || null, role_en: formData.role_en || null, bio_pt: formData.bio_pt || null, bio_en: formData.bio_en || null, message_pt: formData.message_pt || null, message_en: formData.message_en || null, photo_url: formData.photo_url || null, email: formData.email || null, phone: formData.phone || null, office_location: formData.office_location || null, group_key: formData.group_key, sort_order: formData.sort_order, is_active: formData.is_active };
    if (editing) { updateMutation.mutate({ id: editing.id, data: submitData }); } else { createMutation.mutate(submitData); }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Conselho de Administração" subtitle="Gerir membros do conselho">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div><CardTitle>Membros</CardTitle><CardDescription>Gerir membros do conselho, biografias e mensagens institucionais</CardDescription></div>
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Membro</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Título</TableHead><TableHead>Grupo</TableHead><TableHead>Ordem</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acções</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {members?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum membro registado</TableCell></TableRow>
                    ) : members?.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.full_name}</TableCell>
                        <TableCell>{m.title_pt}</TableCell>
                        <TableCell><Badge variant="outline">{GROUP_OPTIONS.find(g => g.value === m.group_key)?.label || m.group_key}</Badge></TableCell>
                        <TableCell>{m.sort_order}</TableCell>
                        <TableCell><Badge variant={m.is_active ? 'default' : 'secondary'}>{m.is_active ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteItem(m)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">{members?.length || 0} membro(s)</div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader><DialogTitle>{editing ? 'Editar Membro' : 'Novo Membro'}</DialogTitle><DialogDescription>Preencha todos os campos do perfil do membro</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-4"><TabsTrigger value="info">Informações</TabsTrigger><TabsTrigger value="bio">Biografia</TabsTrigger><TabsTrigger value="message">Mensagem</TabsTrigger><TabsTrigger value="contact">Contactos</TabsTrigger>{editing && <TabsTrigger value="departments">Pelouro</TabsTrigger>}</TabsList>
              <TabsContent value="info">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Nome Completo *</Label><Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Slug *</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="paulino-jeronimo" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Título PT *</Label><Input value={formData.title_pt} onChange={e => setFormData({...formData, title_pt: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Título EN</Label><Input value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Pelouro PT</Label><Input value={formData.role_pt} onChange={e => setFormData({...formData, role_pt: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Pelouro EN</Label><Input value={formData.role_en} onChange={e => setFormData({...formData, role_en: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Grupo</Label>
                      <Select value={formData.group_key} onValueChange={v => setFormData({...formData, group_key: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GROUP_OPTIONS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})} /></div>
                    <div className="flex items-end gap-2 pb-1"><Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} /><Label>Activo</Label></div>
                  </div>
                  <ImageUpload value={formData.photo_url} onChange={(url) => setFormData({...formData, photo_url: url})} folder="board-members" label="Foto do Membro" />
                </div>
              </TabsContent>
              <TabsContent value="bio">
                <div className="grid gap-4">
                  <div className="space-y-2"><Label>Biografia PT</Label><Textarea value={formData.bio_pt} onChange={e => setFormData({...formData, bio_pt: e.target.value})} rows={8} /></div>
                  <div className="space-y-2"><Label>Biografia EN</Label><Textarea value={formData.bio_en} onChange={e => setFormData({...formData, bio_en: e.target.value})} rows={8} /></div>
                </div>
              </TabsContent>
              <TabsContent value="message">
                <div className="grid gap-4">
                  <div className="space-y-2"><Label>Mensagem Institucional PT</Label><Textarea value={formData.message_pt} onChange={e => setFormData({...formData, message_pt: e.target.value})} rows={8} /></div>
                  <div className="space-y-2"><Label>Mensagem Institucional EN</Label><Textarea value={formData.message_en} onChange={e => setFormData({...formData, message_en: e.target.value})} rows={8} /></div>
                </div>
              </TabsContent>
              <TabsContent value="contact">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Telefone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2"><Label>Localização do Gabinete</Label><Input value={formData.office_location} onChange={e => setFormData({...formData, office_location: e.target.value})} /></div>
                </div>
              </TabsContent>
              {editing && (
                <TabsContent value="departments">
                  <BoardDepartmentsManager memberId={editing.id} memberName={editing.full_name} />
                </TabsContent>
              )}
            </Tabs>
            <DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Guardar' : 'Criar'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar Membro</AlertDialogTitle><AlertDialogDescription>Eliminar "{deleteItem?.full_name}"? Esta acção não pode ser revertida.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
