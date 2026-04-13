import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { SITE_PAGES } from '@/data/sitePages';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Save, Plus, Trash2, GripVertical, Eye, EyeOff, Monitor, Smartphone, Tablet, RotateCw } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function AdminPageEditorPage() {
  const { pageKey } = useParams<{ pageKey: string }>();
  const queryClient = useQueryClient();
  const pageConfig = SITE_PAGES.find(p => p.pageKey === pageKey);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<string>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  if (!pageConfig) {
    return (
      <AdminLayout title="Página não encontrada">
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Página com chave "{pageKey}" não encontrada.</p>
          <Button asChild className="mt-4"><Link to="/admin/site-pages">← Voltar</Link></Button>
        </div>
      </AdminLayout>
    );
  }

  const previewWidth = previewDevice === 'mobile' ? 390 : previewDevice === 'tablet' ? 768 : '100%';

  return (
    <AdminLayout
      title={pageConfig.label}
      subtitle={`Editar conteúdo da página ${pageConfig.url}`}
    >
      <div className="p-6 space-y-4">
        {/* Top bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/site-pages"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
          </Button>
          <div className="flex-1" />
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(p => !p)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPreview ? 'Fechar Preview' : 'Pré-visualizar'}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={pageConfig.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" /> Abrir em nova aba
            </a>
          </Button>
        </div>

        {/* Inline Preview */}
        {showPreview && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Pré-visualização</span>
                <Badge variant="secondary" className="text-xs">{pageConfig.url}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <ToggleGroup type="single" value={previewDevice} onValueChange={(v) => v && setPreviewDevice(v)} size="sm">
                  <ToggleGroupItem value="mobile" aria-label="Mobile">
                    <Smartphone className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="tablet" aria-label="Tablet">
                    <Tablet className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="desktop" aria-label="Desktop">
                    <Monitor className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewKey(k => k + 1)} title="Recarregar preview">
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex justify-center bg-muted/10">
              <div
                className="bg-background rounded-lg shadow-lg border overflow-hidden transition-all duration-300"
                style={{ width: previewWidth, maxWidth: '100%' }}
              >
                <iframe
                  key={previewKey}
                  src={pageConfig.url}
                  className="w-full border-0"
                  style={{ height: previewDevice === 'mobile' ? 700 : previewDevice === 'tablet' ? 800 : 700 }}
                  title={`Preview: ${pageConfig.label}`}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="banner" className="w-full">
          <TabsList>
            <TabsTrigger value="banner">Banner</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
          </TabsList>

          <TabsContent value="banner">
            <BannerEditor pageKey={pageConfig.pageKey} />
          </TabsContent>

          <TabsContent value="content">
            <ContentBlocksEditor pageKey={pageConfig.pageKey} sections={pageConfig.sections} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// ─── Banner Editor ───
function BannerEditor({ pageKey }: { pageKey: string }) {
  const queryClient = useQueryClient();
  const { data: banner, isLoading } = useQuery({
    queryKey: ['page-banner-edit', pageKey],
    queryFn: async () => {
      const { data } = await supabase.from('page_banners').select('*').eq('page_key', pageKey).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    title_pt: '', title_en: '', subtitle_pt: '', subtitle_en: '', image_url: '', overlay_opacity: 0.6,
  });

  useEffect(() => {
    if (banner) {
      setForm({
        title_pt: banner.title_pt || '',
        title_en: banner.title_en || '',
        subtitle_pt: banner.subtitle_pt || '',
        subtitle_en: banner.subtitle_en || '',
        image_url: banner.image_url || '',
        overlay_opacity: Number(banner.overlay_opacity) || 0.6,
      });
    }
  }, [banner]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (banner) {
        const { error } = await supabase.from('page_banners').update({ ...form, updated_at: new Date().toISOString() }).eq('id', banner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('page_banners').insert({ page_key: pageKey, ...form, is_active: true });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Banner guardado!');
      queryClient.invalidateQueries({ queryKey: ['page-banner-edit', pageKey] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-4 text-muted-foreground">A carregar...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Imagem e Títulos do Header</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        {form.image_url && (
          <div className="relative rounded-lg overflow-hidden h-48">
            <img src={form.image_url} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black flex items-end p-4" style={{ opacity: form.overlay_opacity }}>
            </div>
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="text-lg font-bold">{form.title_pt || 'Título...'}</p>
              {form.subtitle_pt && <p className="text-sm opacity-80">{form.subtitle_pt}</p>}
            </div>
          </div>
        )}

        <div>
          <Label>Imagem do Banner</Label>
          <ImageUpload
            value={form.image_url}
            onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
            folder={`banners/${pageKey}`}
            cropAspectRatio={16 / 5}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Título (PT)</Label>
            <Input value={form.title_pt} onChange={(e) => setForm(f => ({ ...f, title_pt: e.target.value }))} />
          </div>
          <div>
            <Label>Título (EN)</Label>
            <Input value={form.title_en} onChange={(e) => setForm(f => ({ ...f, title_en: e.target.value }))} />
          </div>
          <div>
            <Label>Subtítulo (PT)</Label>
            <Input value={form.subtitle_pt} onChange={(e) => setForm(f => ({ ...f, subtitle_pt: e.target.value }))} />
          </div>
          <div>
            <Label>Subtítulo (EN)</Label>
            <Input value={form.subtitle_en} onChange={(e) => setForm(f => ({ ...f, subtitle_en: e.target.value }))} />
          </div>
        </div>

        <div className="w-48">
          <Label>Opacidade do overlay ({Math.round(form.overlay_opacity * 100)}%)</Label>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={form.overlay_opacity}
            onChange={(e) => setForm(f => ({ ...f, overlay_opacity: parseFloat(e.target.value) }))}
          />
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-1" />
          {saveMutation.isPending ? 'A guardar...' : 'Guardar Banner'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Content Blocks Editor ───
function ContentBlocksEditor({ pageKey, sections }: { pageKey: string; sections: string[] }) {
  const queryClient = useQueryClient();

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['content-blocks-edit', pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page_key', pageKey)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-4 text-muted-foreground">A carregar blocos...</div>;

  const ptBlocks = blocks?.filter(b => b.language === 'pt') || [];
  const enBlocks = blocks?.filter(b => b.language === 'en') || [];

  // Group by section_key
  const sectionKeys = [...new Set([
    ...sections,
    ...ptBlocks.map(b => b.section_key),
    ...enBlocks.map(b => b.section_key),
  ])];

  if (sectionKeys.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Esta página não tem secções de conteúdo editáveis ou os dados são geridos noutros módulos (Notícias, FAQ, etc.).</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sectionKeys.map(sectionKey => {
        const ptBlock = ptBlocks.find(b => b.section_key === sectionKey);
        const enBlock = enBlocks.find(b => b.section_key === sectionKey);

        return (
          <ContentSectionEditor
            key={sectionKey}
            pageKey={pageKey}
            sectionKey={sectionKey}
            ptBlock={ptBlock}
            enBlock={enBlock}
            queryClient={queryClient}
          />
        );
      })}
    </div>
  );
}

function ContentSectionEditor({
  pageKey,
  sectionKey,
  ptBlock,
  enBlock,
  queryClient,
}: {
  pageKey: string;
  sectionKey: string;
  ptBlock: any;
  enBlock: any;
  queryClient: any;
}) {
  const ptContent = (ptBlock?.content || {}) as Record<string, any>;
  const enContent = (enBlock?.content || {}) as Record<string, any>;

  const [ptForm, setPtForm] = useState<Record<string, any>>(ptContent);
  const [enForm, setEnForm] = useState<Record<string, any>>(enContent);

  useEffect(() => { setPtForm(ptContent); }, [ptBlock]);
  useEffect(() => { setEnForm(enContent); }, [enBlock]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const ops = [];
      if (ptBlock) {
        ops.push(supabase.from('content_blocks').update({ content: ptForm, updated_at: new Date().toISOString() }).eq('id', ptBlock.id));
      } else if (Object.keys(ptForm).length > 0) {
        ops.push(supabase.from('content_blocks').insert({ page_key: pageKey, section_key: sectionKey, language: 'pt', content: ptForm, is_active: true }));
      }
      if (enBlock) {
        ops.push(supabase.from('content_blocks').update({ content: enForm, updated_at: new Date().toISOString() }).eq('id', enBlock.id));
      } else if (Object.keys(enForm).length > 0) {
        ops.push(supabase.from('content_blocks').insert({ page_key: pageKey, section_key: sectionKey, language: 'en', content: enForm, is_active: true }));
      }
      const results = await Promise.all(ops);
      results.forEach(r => { if (r.error) throw r.error; });
    },
    onSuccess: () => {
      toast.success(`Secção "${sectionKey}" guardada!`);
      queryClient.invalidateQueries({ queryKey: ['content-blocks-edit', pageKey] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Detect fields from the content
  const allKeys = [...new Set([...Object.keys(ptForm), ...Object.keys(enForm)])];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">{sectionKey}</Badge>
            Secção
          </CardTitle>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {allKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum conteúdo definido para esta secção. Adicione campos abaixo.</p>
        ) : null}

        {allKeys.map(fieldKey => {
          const ptValue = ptForm[fieldKey];
          const enValue = enForm[fieldKey];

          // If value is an array or object, show as JSON textarea
          if (typeof ptValue === 'object' && ptValue !== null && !Array.isArray(ptValue)) {
            return null; // Skip nested objects for now, show simple fields
          }

          if (Array.isArray(ptValue)) {
            return (
              <div key={fieldKey}>
                <Label className="text-xs font-mono text-muted-foreground mb-1 block">{fieldKey} (lista)</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">PT</Label>
                    <Textarea
                      value={JSON.stringify(ptValue, null, 2)}
                      onChange={(e) => {
                        try { setPtForm(f => ({ ...f, [fieldKey]: JSON.parse(e.target.value) })); } catch {}
                      }}
                      className="font-mono text-xs min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">EN</Label>
                    <Textarea
                      value={JSON.stringify(enValue || [], null, 2)}
                      onChange={(e) => {
                        try { setEnForm(f => ({ ...f, [fieldKey]: JSON.parse(e.target.value) })); } catch {}
                      }}
                      className="font-mono text-xs min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            );
          }

          // Simple text field
          const isLong = typeof ptValue === 'string' && ptValue.length > 100;
          const InputComp = isLong ? Textarea : Input;

          return (
            <div key={fieldKey}>
              <Label className="text-xs font-mono text-muted-foreground mb-1 block">{fieldKey}</Label>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">PT</Label>
                  <InputComp
                    value={ptForm[fieldKey] ?? ''}
                    onChange={(e) => setPtForm(f => ({ ...f, [fieldKey]: e.target.value }))}
                    className={isLong ? 'min-h-[80px]' : ''}
                  />
                </div>
                <div>
                  <Label className="text-xs">EN</Label>
                  <InputComp
                    value={enForm[fieldKey] ?? ''}
                    onChange={(e) => setEnForm(f => ({ ...f, [fieldKey]: e.target.value }))}
                    className={isLong ? 'min-h-[80px]' : ''}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add new field */}
        <AddFieldButton
          onAdd={(key, type) => {
            const defaultVal = type === 'list' ? [] : '';
            setPtForm(f => ({ ...f, [key]: defaultVal }));
            setEnForm(f => ({ ...f, [key]: defaultVal }));
          }}
        />
      </CardContent>
    </Card>
  );
}

function AddFieldButton({ onAdd }: { onAdd: (key: string, type: 'text' | 'list') => void }) {
  const [open, setOpen] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'list'>('text');

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" /> Adicionar campo
      </Button>
    );
  }

  return (
    <div className="flex items-end gap-2 p-3 border rounded-lg bg-muted/30">
      <div className="flex-1">
        <Label className="text-xs">Nome do campo</Label>
        <Input
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          placeholder="ex: title, desc, items"
          className="text-sm"
        />
      </div>
      <div className="w-32">
        <Label className="text-xs">Tipo</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value as any)}
        >
          <option value="text">Texto</option>
          <option value="list">Lista</option>
        </select>
      </div>
      <Button
        size="sm"
        disabled={!fieldName.trim()}
        onClick={() => {
          onAdd(fieldName.trim(), fieldType);
          setFieldName('');
          setOpen(false);
        }}
      >
        Adicionar
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
    </div>
  );
}
