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
import { ImageUpload } from '@/components/admin/ImageUpload';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, FileText, Video, Scissors,
  CalendarDays, Eye, EyeOff, ExternalLink, Film,
} from 'lucide-react';

type MediaType = 'publication' | 'video' | 'press_clipping' | 'event';

interface MediaItem {
  id: string;
  media_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  file_url: string | null;
  external_url: string | null;
  youtube_url: string | null;
  source: string | null;
  event_date: string | null;
  sort_order: number;
  is_active: boolean;
}

const MEDIA_TYPES: { value: MediaType; label: string; icon: React.ReactNode }[] = [
  { value: 'publication', label: 'Publicações', icon: <FileText className="h-4 w-4" /> },
  { value: 'video', label: 'Vídeos', icon: <Video className="h-4 w-4" /> },
  { value: 'press_clipping', label: 'Recortes de Imprensa', icon: <Scissors className="h-4 w-4" /> },
  { value: 'event', label: 'Eventos', icon: <CalendarDays className="h-4 w-4" /> },
];

const emptyForm = (): Partial<MediaItem> => ({
  media_type: 'publication',
  title: '',
  description: '',
  image_url: '',
  file_url: '',
  external_url: '',
  youtube_url: '',
  source: '',
  event_date: '',
  sort_order: 0,
  is_active: true,
});

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<MediaType>('publication');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [form, setForm] = useState<Partial<MediaItem>>(emptyForm());

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-media', activeType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('media_type', activeType)
        .order('sort_order')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MediaItem[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (item: Partial<MediaItem>) => {
      const payload: any = {
        title: item.title!,
        description: item.description || null,
        image_url: item.image_url || null,
        file_url: item.file_url || null,
        external_url: item.external_url || null,
        youtube_url: item.youtube_url || null,
        source: item.source || null,
        event_date: item.event_date || null,
        sort_order: item.sort_order || 0,
        is_active: item.is_active ?? true,
        title_en: (item as any).title_en || null,
        description_en: (item as any).description_en || null,
      };
      if (editingItem) {
        const { error } = await supabase
          .from('media_items')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('media_items')
          .insert({ ...payload, media_type: item.media_type || activeType });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success(editingItem ? 'Item actualizado' : 'Item criado');
      closeDialog();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('Item eliminado');
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('media_items')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const openNew = () => {
    setEditingItem(null);
    setForm({ ...emptyForm(), media_type: activeType });
    setDialogOpen(true);
  };

  const openEdit = (item: MediaItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm());
  };

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.title?.trim()) {
      toast.error('O título é obrigatório');
      return;
    }
    upsertMutation.mutate(form);
  };

  const typeConfig = MEDIA_TYPES.find(t => t.value === activeType)!;

  return (
    <AdminLayout title="Central de Media" subtitle="Gerir publicações, vídeos e eventos">

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MEDIA_TYPES.map(type => (
            <Button
              key={type.value}
              variant={activeType === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveType(type.value)}
              className="gap-2"
            >
              {type.icon}
              {type.label}
              {items && activeType === type.value && (
                <Badge variant="secondary" className="ml-1">{items.length}</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {typeConfig.icon}
            {typeConfig.label}
          </h2>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !items?.length ? (
          <div className="text-center py-12 bg-background rounded-lg border">
            <p className="text-muted-foreground mb-4">Nenhum item encontrado.</p>
            <Button onClick={openNew} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Criar primeiro item
            </Button>
          </div>
        ) : (
          <div className="bg-background rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  {activeType === 'press_clipping' && <TableHead>Fonte</TableHead>}
                  {activeType === 'event' && <TableHead>Data</TableHead>}
                  <TableHead className="w-20">Activo</TableHead>
                  <TableHead className="w-28 text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-10 h-10 rounded object-cover border"
                          />
                        )}
                        <div>
                          <div className="font-medium line-clamp-1">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {activeType === 'press_clipping' && (
                      <TableCell className="text-sm text-muted-foreground">{item.source || '—'}</TableCell>
                    )}
                    {activeType === 'event' && (
                      <TableCell className="text-sm text-muted-foreground">{item.event_date || '—'}</TableCell>
                    )}
                    <TableCell>
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: item.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Eliminar este item?')) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar' : 'Novo'} {typeConfig.label.replace(/s$/, '')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label>Título (PT) *</Label>
                <Input
                  value={form.title || ''}
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Título do item em português"
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Title (EN)</Label>
                <Input
                  value={(form as any).title_en || ''}
                  onChange={e => updateField('title_en', e.target.value)}
                  placeholder="Item title in English"
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Descrição (PT)</Label>
                <Textarea
                  value={form.description || ''}
                  onChange={e => updateField('description', e.target.value)}
                  rows={3}
                  placeholder="Descrição breve em português"
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Description (EN)</Label>
                <Textarea
                  value={(form as any).description_en || ''}
                  onChange={e => updateField('description_en', e.target.value)}
                  rows={3}
                  placeholder="Brief description in English"
                />
              </div>

              {/* Image Upload — for publications, events */}
              {(activeType === 'publication' || activeType === 'event') && (
                <div className="grid gap-1.5">
                  <Label>Imagem</Label>
                  <ImageUpload
                    value={form.image_url || ''}
                    onChange={(url) => updateField('image_url', url)}
                  />
                </div>
              )}

              {/* PDF URL — publications */}
              {activeType === 'publication' && (
                <div className="grid gap-1.5">
                  <Label>URL do PDF</Label>
                  <Input
                    value={form.file_url || ''}
                    onChange={e => updateField('file_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* YouTube URL — videos */}
              {activeType === 'video' && (
                <div className="grid gap-1.5">
                  <Label>URL do YouTube (embed)</Label>
                  <Input
                    value={form.youtube_url || ''}
                    onChange={e => updateField('youtube_url', e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
              )}

              {/* Source — press_clipping */}
              {activeType === 'press_clipping' && (
                <div className="grid gap-1.5">
                  <Label>Fonte</Label>
                  <Input
                    value={form.source || ''}
                    onChange={e => updateField('source', e.target.value)}
                    placeholder="Ex: Jornal de Angola"
                  />
                </div>
              )}

              {/* External URL — press_clipping, event */}
              {(activeType === 'press_clipping' || activeType === 'event') && (
                <div className="grid gap-1.5">
                  <Label>URL externo</Label>
                  <Input
                    value={form.external_url || ''}
                    onChange={e => updateField('external_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Date — press_clipping, event */}
              {(activeType === 'press_clipping' || activeType === 'event') && (
                <div className="grid gap-1.5">
                  <Label>Data</Label>
                  <Input
                    value={form.event_date || ''}
                    onChange={e => updateField('event_date', e.target.value)}
                    placeholder="Ex: 20 de Janeiro, 2026"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={form.sort_order || 0}
                    onChange={e => updateField('sort_order', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={form.is_active ?? true}
                    onCheckedChange={v => updateField('is_active', v)}
                  />
                  <Label>Activo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingItem ? 'Guardar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </AdminLayout>
  );
}
