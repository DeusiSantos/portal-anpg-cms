import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Loader2, Home, BarChart3, Briefcase, Info,
  Megaphone, Image, Plus, Trash2, GripVertical, Newspaper,
} from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface ContentBlock {
  id: string;
  page_key: string;
  section_key: string;
  language: string;
  content: Record<string, any>;
  sort_order: number;
  is_active: boolean;
}

const SECTION_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  hero: { label: 'Hero (Texto)', icon: <Home className="h-4 w-4" />, description: 'Título, subtítulo e botões do hero principal' },
  'hero-slide': { label: 'Hero Slides', icon: <Image className="h-4 w-4" />, description: 'Imagens do carrossel do hero' },
  stats: { label: 'Estatísticas', icon: <BarChart3 className="h-4 w-4" />, description: 'Números chave do sector petrolífero' },
  services: { label: 'Serviços', icon: <Briefcase className="h-4 w-4" />, description: 'Cards de serviços/competências da ANPG' },
  about: { label: 'Sobre Nós', icon: <Info className="h-4 w-4" />, description: 'Secção institucional com valores' },
  investment: { label: 'Investimento', icon: <Briefcase className="h-4 w-4" />, description: 'Oportunidades de investimento e blocos' },
  cta: { label: 'Call to Action', icon: <Megaphone className="h-4 w-4" />, description: 'Secção final com contactos' },
  news: { label: 'Notícias', icon: <Newspaper className="h-4 w-4" />, description: 'Títulos e categorias da secção de notícias' },
};

export default function AdminHomepageContentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pt');

  const { data: allBlocks, isLoading } = useQuery({
    queryKey: ['admin-homepage-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page_key', 'home')
        .order('section_key')
        .order('sort_order');
      if (error) throw error;
      return data as ContentBlock[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: Record<string, any> }) => {
      const { error } = await supabase
        .from('content_blocks')
        .update({ content: content as unknown as Json })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-blocks'] });
      toast.success('Secção guardada com sucesso');
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const getBlock = (sectionKey: string, lang: string) =>
    allBlocks?.find(b => b.section_key === sectionKey && b.language === lang);

  const getBlocks = (sectionKey: string) =>
    allBlocks?.filter(b => b.section_key === sectionKey) || [];

  const sections = ['hero', 'hero-slide', 'stats', 'services', 'about', 'investment', 'cta', 'news'];

  return (
    <AdminLayout title="Conteúdo Homepage" subtitle="Gerir secções da página principal">

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="pt">🇦🇴 Português</TabsTrigger>
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {sections.map(sectionKey => {
              const meta = SECTION_META[sectionKey];
              if (!meta) return null;

              if (sectionKey === 'hero-slide') {
                return (
                  <HeroSlidesEditor
                    key={sectionKey}
                    slides={getBlocks('hero-slide')}
                    meta={meta}
                    onSave={(id, content) => updateMutation.mutate({ id, content })}
                    isSaving={updateMutation.isPending}
                  />
                );
              }

              const block = getBlock(sectionKey, activeTab);
              if (!block) {
                return (
                  <AccordionItem key={sectionKey} value={sectionKey} className="border rounded-lg bg-background px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        {meta.icon}
                        <div className="text-left">
                          <div className="font-medium">{meta.label}</div>
                          <div className="text-sm text-muted-foreground">{meta.description}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground py-4">
                        Sem conteúdo para <Badge variant="outline">{activeTab.toUpperCase()}</Badge>. Crie primeiro no editor genérico de blocos.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              }

              return (
                <SectionEditor
                  key={`${sectionKey}-${activeTab}`}
                  sectionKey={sectionKey}
                  block={block}
                  meta={meta}
                  onSave={(content) => updateMutation.mutate({ id: block.id, content })}
                  isSaving={updateMutation.isPending}
                />
              );
            })}
          </Accordion>
        )}
      </main>
    </AdminLayout>
  );
}

// ─── Section Editor ───

interface SectionEditorProps {
  sectionKey: string;
  block: ContentBlock;
  meta: { label: string; icon: React.ReactNode; description: string };
  onSave: (content: Record<string, any>) => void;
  isSaving: boolean;
}

function SectionEditor({ sectionKey, block, meta, onSave, isSaving }: SectionEditorProps) {
  const [content, setContent] = useState<Record<string, any>>(block.content);

  const update = (key: string, value: any) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const renderFields = () => {
    switch (sectionKey) {
      case 'hero':
        return <HeroFields content={content} update={update} />;
      case 'news':
        return <NewsFields content={content} update={update} />;
      case 'stats':
        return <StatsFields content={content} update={update} />;
      case 'services':
        return <ServicesFields content={content} update={update} />;
      case 'about':
        return <AboutFields content={content} update={update} />;
      case 'investment':
        return <InvestmentFields content={content} update={update} />;
      case 'cta':
        return <CTAFields content={content} update={update} />;
      default:
        return <GenericJSONEditor content={content} onChange={setContent} />;
    }
  };

  return (
    <AccordionItem value={sectionKey} className="border rounded-lg bg-background px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          {meta.icon}
          <div className="text-left">
            <div className="font-medium">{meta.label}</div>
            <div className="text-sm text-muted-foreground">{meta.description}</div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-6">
        <div className="space-y-4">
          {renderFields()}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onSave(content)} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Secção
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Field Helpers ───

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

// ─── Hero Fields ───

function HeroFields({ content, update }: { content: Record<string, any>; update: (k: string, v: any) => void }) {
  return (
    <div className="grid gap-4">
      <Field label="Subtítulo (Badge)">
        <Input value={content.subtitle || ''} onChange={e => update('subtitle', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Título Principal">
          <Input value={content.title || ''} onChange={e => update('title', e.target.value)} />
        </Field>
        <Field label="Título Destaque (cor primária)">
          <Input value={content.titleHighlight || ''} onChange={e => update('titleHighlight', e.target.value)} />
        </Field>
      </div>
      <Field label="Descrição">
        <Textarea value={content.description || ''} onChange={e => update('description', e.target.value)} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Botão Primário">
          <Input value={content.ctaPrimary || ''} onChange={e => update('ctaPrimary', e.target.value)} />
        </Field>
        <Field label="Botão Secundário">
          <Input value={content.ctaSecondary || ''} onChange={e => update('ctaSecondary', e.target.value)} />
        </Field>
      </div>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Access (cards no fundo do hero)</Label>
      <div className="grid gap-3">
        {(content.quickAccess || []).map((item: any, i: number) => (
          <div key={i} className="p-3 border rounded-md bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Card {i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => {
                const items = [...(content.quickAccess || [])];
                items.splice(i, 1);
                update('quickAccess', items);
              }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Ícone">
                <Input value={item.iconKey || ''} onChange={e => {
                  const items = [...(content.quickAccess || [])];
                  items[i] = { ...items[i], iconKey: e.target.value };
                  update('quickAccess', items);
                }} placeholder="TrendingUp, Shield, BarChart3" />
              </Field>
              <Field label="Link">
                <Input value={item.href || ''} onChange={e => {
                  const items = [...(content.quickAccess || [])];
                  items[i] = { ...items[i], href: e.target.value };
                  update('quickAccess', items);
                }} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Título">
                <Input value={item.title || item.titleKey || ''} onChange={e => {
                  const items = [...(content.quickAccess || [])];
                  items[i] = { ...items[i], title: e.target.value };
                  update('quickAccess', items);
                }} />
              </Field>
              <Field label="Descrição">
                <Input value={item.description || item.descriptionKey || ''} onChange={e => {
                  const items = [...(content.quickAccess || [])];
                  items[i] = { ...items[i], description: e.target.value };
                  update('quickAccess', items);
                }} />
              </Field>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => {
          update('quickAccess', [...(content.quickAccess || []), { iconKey: 'TrendingUp', title: '', description: '', href: '/' }]);
        }} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />Adicionar Card
        </Button>
      </div>
    </div>
  );
}

// ─── Stats Fields ───

function StatsFields({ content, update }: { content: Record<string, any>; update: (k: string, v: any) => void }) {
  const items = (content.items || []) as { value: number; suffix: string; label: string; description: string }[];

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update('items', newItems);
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Etiqueta">
          <Input value={content.label || ''} onChange={e => update('label', e.target.value)} />
        </Field>
        <Field label="Link 'Explorar Dados'">
          <Input value={content.exploreData || ''} onChange={e => update('exploreData', e.target.value)} />
        </Field>
      </div>
      <Field label="Título">
        <Input value={content.title || ''} onChange={e => update('title', e.target.value)} />
      </Field>
      <Field label="Subtítulo">
        <Textarea value={content.subtitle || ''} onChange={e => update('subtitle', e.target.value)} rows={2} />
      </Field>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estatísticas</Label>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 p-3 border rounded-md bg-muted/30">
            <Field label="Valor">
              <Input type="number" step="0.1" value={item.value} onChange={e => updateItem(i, 'value', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Sufixo">
              <Input value={item.suffix} onChange={e => updateItem(i, 'suffix', e.target.value)} placeholder="M, B+, +" />
            </Field>
            <Field label="Label">
              <Input value={item.label} onChange={e => updateItem(i, 'label', e.target.value)} />
            </Field>
            <Field label="Descrição">
              <Input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
            </Field>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Services Fields ───

function ServicesFields({ content, update }: { content: Record<string, any>; update: (k: string, v: any) => void }) {
  const items = (content.items || []) as any[];

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update('items', newItems);
  };

  const addItem = () => {
    update('items', [...items, { iconKey: 'FileCheck', titleKey: '', title: '', descriptionKey: '', description: '', href: '/', color: 'bg-primary/10 text-primary' }]);
  };

  const removeItem = (index: number) => {
    update('items', items.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-4">
      <Field label="Etiqueta">
        <Input value={content.label || ''} onChange={e => update('label', e.target.value)} />
      </Field>
      <Field label="Título">
        <Input value={content.title || ''} onChange={e => update('title', e.target.value)} />
      </Field>
      <Field label="Subtítulo">
        <Textarea value={content.subtitle || ''} onChange={e => update('subtitle', e.target.value)} rows={2} />
      </Field>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Serviços</Label>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div key={i} className="p-3 border rounded-md bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Serviço {i + 1}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Ícone">
                <Input value={item.iconKey || ''} onChange={e => updateItem(i, 'iconKey', e.target.value)} placeholder="FileCheck, Shield, Scale..." />
              </Field>
              <Field label="Link">
                <Input value={item.href || ''} onChange={e => updateItem(i, 'href', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Título">
                <Input value={item.title || item.titleKey || ''} onChange={e => updateItem(i, 'title', e.target.value)} />
              </Field>
              <Field label="Descrição">
                <Input value={item.description || item.descriptionKey || ''} onChange={e => updateItem(i, 'description', e.target.value)} />
              </Field>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />Adicionar Serviço
        </Button>
      </div>
    </div>
  );
}

// ─── About Fields ───

function AboutFields({ content, update }: { content: Record<string, any>; update: (k: string, v: any) => void }) {
  const values = (content.values || []) as any[];

  const updateValue = (index: number, field: string, value: any) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: value };
    update('values', newValues);
  };

  return (
    <div className="grid gap-4">
      <Field label="Etiqueta">
        <Input value={content.label || ''} onChange={e => update('label', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Título">
          <Input value={content.title || ''} onChange={e => update('title', e.target.value)} />
        </Field>
        <Field label="Título Destaque">
          <Input value={content.titleHighlight || ''} onChange={e => update('titleHighlight', e.target.value)} />
        </Field>
      </div>
      <Field label="Descrição">
        <Textarea value={content.description || ''} onChange={e => update('description', e.target.value)} rows={3} />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Valor Estatístico">
          <Input value={content.statValue || ''} onChange={e => update('statValue', e.target.value)} placeholder="45+" />
        </Field>
        <Field label="Label Estatístico">
          <Input value={content.statLabel || ''} onChange={e => update('statLabel', e.target.value)} />
        </Field>
        <Field label="CTA">
          <Input value={content.cta || ''} onChange={e => update('cta', e.target.value)} />
        </Field>
      </div>
      <ImageUpload
        value={content.image || ''}
        onChange={v => update('image', v)}
        folder="homepage/about"
        label="Imagem"
        cropAspectRatio={4 / 3}
      />
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valores</Label>
      <div className="grid gap-3">
        {values.map((val, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 p-3 border rounded-md bg-muted/30">
            <Field label="Ícone">
              <Input value={val.iconKey || ''} onChange={e => updateValue(i, 'iconKey', e.target.value)} />
            </Field>
            <Field label="Título">
              <Input value={val.title || val.titleKey || ''} onChange={e => updateValue(i, 'title', e.target.value)} />
            </Field>
            <Field label="Descrição">
              <Input value={val.description || val.descriptionKey || ''} onChange={e => updateValue(i, 'description', e.target.value)} />
            </Field>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Investment Fields ───

function InvestmentFields({ content, update }: { content: Record<string, any>; update: (k: string, v: any) => void }) {
  const highlights = (content.highlights || []) as string[];
  const blocks = (content.blocks || []) as any[];

  return (
    <div className="grid gap-4">
      <Field label="Etiqueta">
        <Input value={content.label || ''} onChange={e => update('label', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Título">
          <Input value={content.title || ''} onChange={e => update('title', e.target.value)} />
        </Field>
        <Field label="Título Destaque">
          <Input value={content.titleHighlight || ''} onChange={e => update('titleHighlight', e.target.value)} />
        </Field>
      </div>
      <Field label="Descrição">
        <Textarea value={content.description || ''} onChange={e => update('description', e.target.value)} rows={3} />
      </Field>
      <ImageUpload
        value={content.image || ''}
        onChange={v => update('image', v)}
        folder="homepage/investment"
        label="Imagem"
        cropAspectRatio={4 / 3}
      />
      <Field label="Localização">
        <Input value={content.location || ''} onChange={e => update('location', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="CTA Guia">
          <Input value={content.ctaGuide || ''} onChange={e => update('ctaGuide', e.target.value)} />
        </Field>
        <Field label="CTA Blocos">
          <Input value={content.ctaBlocks || ''} onChange={e => update('ctaBlocks', e.target.value)} />
        </Field>
      </div>
      <Field label="Destaques (um por linha)">
        <Textarea
          value={highlights.join('\n')}
          onChange={e => update('highlights', e.target.value.split('\n').filter(Boolean))}
          rows={5}
          placeholder="Cada linha = um destaque"
        />
      </Field>
      <Field label="Blocos Destacados (JSON)">
        <Textarea
          value={JSON.stringify(blocks, null, 2)}
          onChange={e => { try { update('blocks', JSON.parse(e.target.value)); } catch {} }}
          rows={6}
          className="font-mono text-xs"
        />
      </Field>
      <Field label="Título 'Blocos Destacados'">
        <Input value={content.featuredBlocksTitle || ''} onChange={e => update('featuredBlocksTitle', e.target.value)} />
      </Field>
      <Field label="Label 'Ver Todos os Blocos'">
        <Input value={content.viewAllBlocksLabel || ''} onChange={e => update('viewAllBlocksLabel', e.target.value)} />
      </Field>
    </div>
  );
}

// ─── CTA Fields ───

function CTAFields({ content, update }: { content: Record<string, any>; update: (k: string, v: any) => void }) {
  return (
    <div className="grid gap-4">
      <Field label="Título">
        <Input value={content.title || ''} onChange={e => update('title', e.target.value)} />
      </Field>
      <Field label="Descrição">
        <Textarea value={content.description || ''} onChange={e => update('description', e.target.value)} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Botão Primário">
          <Input value={content.ctaPrimary || ''} onChange={e => update('ctaPrimary', e.target.value)} />
        </Field>
        <Field label="Botão Secundário">
          <Input value={content.ctaSecondary || ''} onChange={e => update('ctaSecondary', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email">
          <Input value={content.email || ''} onChange={e => update('email', e.target.value)} />
        </Field>
        <Field label="Telefone">
          <Input value={content.phone || ''} onChange={e => update('phone', e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

// ─── News Fields ───

function NewsFields({ content, update }: { content: Record<string, any>; update: (k: string, v: any) => void }) {
  const categories = (content.categories || []) as { id: string; label: string }[];

  const updateCategory = (index: number, field: string, value: string) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], [field]: value };
    update('categories', newCats);
  };

  return (
    <div className="grid gap-4">
      <Field label="Etiqueta">
        <Input value={content.label || ''} onChange={e => update('label', e.target.value)} />
      </Field>
      <Field label="Título">
        <Input value={content.title || ''} onChange={e => update('title', e.target.value)} />
      </Field>
      <Field label="Texto 'Ver Todas'">
        <Input value={content.viewAll || ''} onChange={e => update('viewAll', e.target.value)} />
      </Field>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categorias (tabs de filtro)</Label>
      <div className="grid gap-2">
        {categories.map((cat, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <Field label="ID">
              <Input value={cat.id} onChange={e => updateCategory(i, 'id', e.target.value)} placeholder="all, highlight..." />
            </Field>
            <Field label="Label">
              <Input value={cat.label} onChange={e => updateCategory(i, 'label', e.target.value)} />
            </Field>
            <Button variant="ghost" size="icon" onClick={() => update('categories', categories.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update('categories', [...categories, { id: '', label: '' }])} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />Adicionar Categoria
        </Button>
      </div>
    </div>
  );
}

// ─── Hero Slides Editor ───

interface HeroSlidesEditorProps {
  slides: ContentBlock[];
  meta: { label: string; icon: React.ReactNode; description: string };
  onSave: (id: string, content: Record<string, any>) => void;
  isSaving: boolean;
}

function HeroSlidesEditor({ slides, meta, onSave, isSaving }: HeroSlidesEditorProps) {
  const [editingSlides, setEditingSlides] = useState<Record<string, Record<string, any>>>(
    () => Object.fromEntries(slides.map(s => [s.id, s.content]))
  );

  const updateSlide = (id: string, field: string, value: string) => {
    setEditingSlides(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  return (
    <AccordionItem value="hero-slide" className="border rounded-lg bg-background px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          {meta.icon}
          <div className="text-left">
            <div className="font-medium">{meta.label}</div>
            <div className="text-sm text-muted-foreground">{slides.length} slide(s) — gerido em ambos os idiomas</div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-6">
        <div className="space-y-4">
          {slides
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((slide, i) => {
              const c = editingSlides[slide.id] || slide.content;
              return (
                <Card key={slide.id} className="border-dashed">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm">Slide {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <ImageUpload
                      value={c.image || ''}
                      onChange={v => updateSlide(slide.id, 'image', v)}
                      folder="homepage/hero-slides"
                      label="Imagem do Slide"
                      cropAspectRatio={16 / 9}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Título PT">
                        <Input value={c.title_pt || ''} onChange={e => updateSlide(slide.id, 'title_pt', e.target.value)} />
                      </Field>
                      <Field label="Título EN">
                        <Input value={c.title_en || ''} onChange={e => updateSlide(slide.id, 'title_en', e.target.value)} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Subtítulo PT">
                        <Input value={c.subtitle_pt || ''} onChange={e => updateSlide(slide.id, 'subtitle_pt', e.target.value)} />
                      </Field>
                      <Field label="Subtítulo EN">
                        <Input value={c.subtitle_en || ''} onChange={e => updateSlide(slide.id, 'subtitle_en', e.target.value)} />
                      </Field>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => onSave(slide.id, editingSlides[slide.id])} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                        Guardar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          {slides.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">Nenhum slide configurado. Use a página de Slides do Hero para criar.</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Fallback Generic JSON Editor ───

function GenericJSONEditor({ content, onChange }: { content: Record<string, any>; onChange: (c: Record<string, any>) => void }) {
  const [raw, setRaw] = useState(JSON.stringify(content, null, 2));
  return (
    <Field label="Conteúdo (JSON)">
      <Textarea
        value={raw}
        onChange={e => {
          setRaw(e.target.value);
          try { onChange(JSON.parse(e.target.value)); } catch {}
        }}
        rows={12}
        className="font-mono text-xs"
      />
    </Field>
  );
}
