import { useState, useMemo } from 'react';
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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Image, Search, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { ImageUpload } from '@/components/admin/ImageUpload';

type PageBanner = Tables<'page_banners'>;

const SECTION_MAP: Record<string, { label: string; order: number }> = {
  'Institucional': { label: '🏛️ Institucional', order: 0 },
  'Exploração & Produção': { label: '⛽ Exploração & Produção', order: 1 },
  'Oportunidades': { label: '📈 Oportunidades', order: 2 },
  'Regulação': { label: '⚖️ Regulação', order: 3 },
  'Dados & Media': { label: '📊 Dados & Media', order: 4 },
  'Portal do Investidor': { label: '💼 Portal do Investidor', order: 5 },
  'Outras': { label: '📄 Outras', order: 6 } };

function getSection(pageKey: string): string {
  const map: Record<string, string> = {
    about: 'Institucional', anpg: 'Institucional', history: 'Institucional', 'board-member': 'Institucional',
    'pca-message': 'Institucional', 'social-responsibility': 'Institucional', contacts: 'Institucional',
    'local-content': 'Institucional', sustainability: 'Institucional',
    exploration: 'Exploração & Produção', production: 'Exploração & Produção',
    'production-history': 'Exploração & Produção', 'new-areas': 'Exploração & Produção',
    processing: 'Exploração & Produção', 'seismic-campaigns': 'Exploração & Produção',
    'seismic-map': 'Exploração & Produção',
    opportunities: 'Oportunidades', gas: 'Oportunidades', 'energy-integration': 'Oportunidades',
    'permanent-offer': 'Oportunidades', 'tender-2023': 'Oportunidades', 'tender-2025': 'Oportunidades',
    regulation: 'Regulação', licensing: 'Regulação', oversight: 'Regulação', tenders: 'Regulação',
    data: 'Dados & Media', 'data-packages': 'Dados & Media', 'ep-data': 'Dados & Media',
    'ep-maps': 'Dados & Media', 'block-details': 'Dados & Media',
    'conference-2021': 'Dados & Media', 'conference-2023': 'Dados & Media',
    'iona': 'Dados & Media', 'oasis': 'Dados & Media',
    media: 'Dados & Media', events: 'Dados & Media', 'news-archive': 'Dados & Media',
    'investor-login': 'Portal do Investidor', 'investor-portal': 'Portal do Investidor',
    'investor-reset': 'Portal do Investidor' };
  return map[pageKey] || 'Outras';
}

export default function AdminPageBannersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PageBanner | null>(null);
  const [deleteItem, setDeleteItem] = useState<PageBanner | null>(null);
  const [search, setSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    page_key: '', title_pt: '', title_en: '', subtitle_pt: '', subtitle_en: '', image_url: '', overlay_opacity: 0.6, is_active: true });

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-page-banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('page_banners').select('*').order('page_key');
      if (error) throw error;
      return data as PageBanner[];
    } });

  const grouped = useMemo(() => {
    if (!banners) return [];
    const filtered = banners.filter(b => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.page_key.toLowerCase().includes(q) || (b.title_pt || '').toLowerCase().includes(q) || (b.title_en || '').toLowerCase().includes(q);
    });
    const groups: Record<string, PageBanner[]> = {};
    filtered.forEach(b => {
      const section = getSection(b.page_key);
      if (!groups[section]) groups[section] = [];
      groups[section].push(b);
    });
    return Object.entries(groups)
      .map(([name, items]) => ({ name, ...SECTION_MAP[name], items }))
      .sort((a, b) => a.order - b.order);
  }, [banners, search]);

  const toggleSection = (name: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'page_banners'>) => {
      const { error } = await supabase.from('page_banners').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-page-banners'] }); toast.success('Banner criado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PageBanner> }) => {
      const { error } = await supabase.from('page_banners').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-page-banners'] }); toast.success('Banner actualizado'); handleClose(); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('page_banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-page-banners'] }); toast.success('Banner eliminado'); setDeleteItem(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const handleClose = () => { setIsDialogOpen(false); setEditing(null); setFormData({ page_key: '', title_pt: '', title_en: '', subtitle_pt: '', subtitle_en: '', image_url: '', overlay_opacity: 0.6, is_active: true }); };

  const handleEdit = (b: PageBanner) => {
    setEditing(b);
    setFormData({ page_key: b.page_key, title_pt: b.title_pt || '', title_en: b.title_en || '', subtitle_pt: b.subtitle_pt || '', subtitle_en: b.subtitle_en || '', image_url: b.image_url || '', overlay_opacity: Number(b.overlay_opacity) || 0.6, is_active: b.is_active });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.page_key) { toast.error('Page key é obrigatório'); return; }
    const submitData = { page_key: formData.page_key, title_pt: formData.title_pt || null, title_en: formData.title_en || null, subtitle_pt: formData.subtitle_pt || null, subtitle_en: formData.subtitle_en || null, image_url: formData.image_url || null, overlay_opacity: formData.overlay_opacity, is_active: formData.is_active };
    if (editing) { updateMutation.mutate({ id: editing.id, data: submitData }); } else { createMutation.mutate(submitData); }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const totalFiltered = grouped.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <AdminLayout title="Banners de Página" subtitle="Gerir banners das páginas">

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Banners de Página</h1>
            <p className="text-muted-foreground text-sm">Gerir imagens de cabeçalho, títulos e subtítulos — {banners?.length || 0} banner(s)</p>
          </div>
          <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Banner</Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por página ou título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : totalFiltered === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{search ? 'Nenhum banner encontrado para a pesquisa' : 'Nenhum banner registado'}</CardContent></Card>
        ) : (
          grouped.map(group => {
            const isCollapsed = collapsedSections.has(group.name);
            return (
              <Card key={group.name}>
                <button
                  onClick={() => toggleSection(group.name)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{group.label}</span>
                    <Badge variant="secondary" className="text-xs">{group.items.length}</Badge>
                  </div>
                  {isCollapsed ? <ChevronRight className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
                {!isCollapsed && (
                  <CardContent className="pt-0 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {group.items.map(b => (
                        <div key={b.id} className="group relative rounded-lg border overflow-hidden bg-background hover:shadow-md transition-shadow">
                          {/* Image preview */}
                          <div className="relative aspect-[16/7] bg-muted overflow-hidden">
                            {b.image_url ? (
                              <>
                                <img src={b.image_url} alt={b.title_pt || b.page_key} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black" style={{ opacity: Number(b.overlay_opacity) || 0 }} />
                                <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                                  <div>
                                    <p className="font-bold text-base drop-shadow-md">{b.title_pt || b.page_key}</p>
                                    {b.subtitle_pt && <p className="text-xs mt-1 opacity-90 drop-shadow-md line-clamp-2">{b.subtitle_pt}</p>}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Image className="h-10 w-10 text-muted-foreground/30" />
                              </div>
                            )}
                            {/* Status indicator */}
                            <div className="absolute top-2 right-2">
                              {b.is_active ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full"><Eye className="h-3 w-3" />Activo</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-gray-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full"><EyeOff className="h-3 w-3" />Inactivo</span>
                              )}
                            </div>
                          </div>
                          {/* Info */}
                          <div className="p-3 flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-medium truncate">{b.page_key}</p>
                              <p className="text-xs text-muted-foreground truncate">{b.title_pt || 'Sem título'}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteItem(b)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing ? 'Editar Banner' : 'Novo Banner'}</DialogTitle><DialogDescription>Configure o banner de cabeçalho da página</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Page Key *</Label><Input value={formData.page_key} onChange={e => setFormData({...formData, page_key: e.target.value})} placeholder="Ex: about, production, faq" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Título PT</Label><Input value={formData.title_pt} onChange={e => setFormData({...formData, title_pt: e.target.value})} /></div>
                <div className="space-y-2"><Label>Título EN</Label><Input value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Subtítulo PT</Label><Input value={formData.subtitle_pt} onChange={e => setFormData({...formData, subtitle_pt: e.target.value})} /></div>
                <div className="space-y-2"><Label>Subtítulo EN</Label><Input value={formData.subtitle_en} onChange={e => setFormData({...formData, subtitle_en: e.target.value})} /></div>
              </div>
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({...formData, image_url: url})} folder="page-banners" label="Imagem do Banner" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Opacidade do Overlay ({formData.overlay_opacity})</Label><Input type="range" min="0" max="1" step="0.1" value={formData.overlay_opacity} onChange={e => setFormData({...formData, overlay_opacity: Number(e.target.value)})} /></div>
                <div className="flex items-end gap-2 pb-1"><Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} /><Label>Activo</Label></div>
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Guardar' : 'Criar'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar Banner</AlertDialogTitle><AlertDialogDescription>Eliminar o banner da página "{deleteItem?.page_key}"?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
