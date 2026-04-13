import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Image, GripVertical, Eye } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface HeroSlide {
  id: string;
  image: string;
  title_pt?: string;
  title_en?: string;
  subtitle_pt?: string;
  subtitle_en?: string;
  sort_order: number;
  is_active: boolean;
}

// We store hero slides as individual content_blocks with page_key="home", section_key="hero-slide"
// Each block's content JSON holds: { image, title_pt, title_en, subtitle_pt, subtitle_en }

export default function AdminHeroSlidesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [deleteItem, setDeleteItem] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    image: '',
    title_pt: '',
    title_en: '',
    subtitle_pt: '',
    subtitle_en: '',
    sort_order: 0,
    is_active: true });

  const { data: slides, isLoading } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page_key', 'home')
        .eq('section_key', 'hero-slide')
        .order('sort_order');
      if (error) throw error;
      return data.map((block) => {
        const content = block.content as Record<string, any>;
        return {
          id: block.id,
          image: content.image || '',
          title_pt: content.title_pt || '',
          title_en: content.title_en || '',
          subtitle_pt: content.subtitle_pt || '',
          subtitle_en: content.subtitle_en || '',
          sort_order: block.sort_order,
          is_active: block.is_active } as HeroSlide;
      });
    } });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('content_blocks').insert({
        page_key: 'home',
        section_key: 'hero-slide',
        language: 'pt',
        sort_order: data.sort_order,
        is_active: data.is_active,
        content: {
          image: data.image,
          title_pt: data.title_pt,
          title_en: data.title_en,
          subtitle_pt: data.subtitle_pt,
          subtitle_en: data.subtitle_en } });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['content_blocks'] });
      queryClient.invalidateQueries({ queryKey: ['content_block'] });
      toast.success('Slide criado');
      handleClose();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('content_blocks').update({
        sort_order: data.sort_order,
        is_active: data.is_active,
        content: {
          image: data.image,
          title_pt: data.title_pt,
          title_en: data.title_en,
          subtitle_pt: data.subtitle_pt,
          subtitle_en: data.subtitle_en } }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['content_blocks'] });
      queryClient.invalidateQueries({ queryKey: ['content_block'] });
      toast.success('Slide actualizado');
      handleClose();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_blocks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['content_blocks'] });
      queryClient.invalidateQueries({ queryKey: ['content_block'] });
      toast.success('Slide eliminado');
      setDeleteItem(null);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`) });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setFormData({ image: '', title_pt: '', title_en: '', subtitle_pt: '', subtitle_en: '', sort_order: 0, is_active: true });
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setFormData({
      image: slide.image,
      title_pt: slide.title_pt || '',
      title_en: slide.title_en || '',
      subtitle_pt: slide.subtitle_pt || '',
      subtitle_en: slide.subtitle_en || '',
      sort_order: slide.sort_order,
      is_active: slide.is_active });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error('A imagem é obrigatória');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const activeSlides = slides?.filter(s => s.is_active) || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Slides Hero" subtitle="Gerir slides da página principal">

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Carrossel da Homepage</CardTitle>
                <CardDescription>
                  Gerir as imagens e textos do carrossel Hero. Máximo de 6 slides. 
                  {activeSlides.length > 0 && ` (${activeSlides.length} activo${activeSlides.length > 1 ? 's' : ''})`}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  const nextOrder = (slides?.length || 0);
                  setEditing(null);
                  setFormData({ image: '', title_pt: '', title_en: '', subtitle_pt: '', subtitle_en: '', sort_order: nextOrder, is_active: true });
                  setIsDialogOpen(true);
                }}
                disabled={(slides?.length || 0) >= 6}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Slide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : slides?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum slide configurado.</p>
                <p className="text-sm">O Hero utilizará as imagens padrão.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {slides?.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      slide.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-shrink-0 w-32 h-20 rounded-md overflow-hidden border bg-muted">
                      {slide.image ? (
                        <img src={slide.image} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Slide {idx + 1}</span>
                        {!slide.is_active && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Inactivo</span>
                        )}
                      </div>
                      {slide.title_pt && (
                        <p className="text-sm text-muted-foreground truncate mt-1">{slide.title_pt}</p>
                      )}
                      {slide.subtitle_pt && (
                        <p className="text-xs text-muted-foreground/60 truncate">{slide.subtitle_pt}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteItem(slide)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              {slides?.length || 0} / 6 slides
            </div>
          </CardContent>
        </Card>

        {/* Preview hint */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Pré-visualização</p>
                <p className="text-sm text-muted-foreground">
                  Os slides são apresentados por ordem crescente (campo "Ordem"). 
                  Se não existirem slides configurados, o Hero utiliza as imagens padrão do sistema.
                  O carrossel roda automaticamente a cada 6 segundos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Slide' : 'Novo Slide do Hero'}</DialogTitle>
            <DialogDescription>
              Configure a imagem e textos opcionais para este slide.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="hero-slides"
                label="Imagem do Slide *"
                cropAspectRatio={16 / 9}
                maxWidth={1920}
                maxHeight={1080}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título (PT)</Label>
                  <Input
                    value={formData.title_pt}
                    onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título (EN)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtítulo (PT)</Label>
                  <Input
                    value={formData.subtitle_pt}
                    onChange={(e) => setFormData({ ...formData, subtitle_pt: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo (EN)</Label>
                  <Input
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Guardar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar este slide do Hero?
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
