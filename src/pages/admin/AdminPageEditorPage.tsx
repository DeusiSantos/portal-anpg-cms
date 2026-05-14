// src/pages/admin/AdminPageEditorPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Save, Plus, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { SITE_PAGES, PAGE_SCHEMAS } from '@/data/pageSchemas';
import { STATIC_PAGE_DATA } from '@/data/staticPageData';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPageEditorPage() {
  const { pageKey } = useParams<{ pageKey: string }>();
  const queryClient = useQueryClient();
  const pageConfig = SITE_PAGES.find(p => p.pageKey === pageKey);
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  // Carregar dados
  useEffect(() => {
    if (!pageKey) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Tentar Supabase primeiro; fallback para JSON estático
        const { data: row } = await (supabase as any)
          .from('page_content')
          .select('data')
          .eq('page_key', pageKey)
          .maybeSingle();

        if (row?.data) {
          setPageData(row.data);
        } else {
          setPageData(STATIC_PAGE_DATA[pageKey] || {});
        }
      } catch {
        setPageData(STATIC_PAGE_DATA[pageKey] || {});
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [pageKey]);

  // Definir primeira tab disponível
  useEffect(() => {
    if (pageData && !activeTab) {
      const schema = PAGE_SCHEMAS[pageKey || ''];
      if (schema) {
        const groups = new Set<string>();
        Object.values(schema).forEach((field: any) => {
          if (field.group) groups.add(field.group);
        });
        if (groups.size > 0) {
          setActiveTab(Array.from(groups)[0]);
        }
      }
    }
  }, [pageData, pageKey, activeTab]);

  const handleSave = async () => {
    if (!pageKey) return;
    setIsSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('page_content')
        .upsert({ page_key: pageKey, data: pageData, updated_at: new Date().toISOString() });

      if (error) throw error;

      // Invalida cache para todas as páginas verem o conteúdo actualizado
      queryClient.invalidateQueries({ queryKey: ['page-content', pageKey] });

      toast.success('Página guardada com sucesso!');
    } catch {
      toast.error('Erro ao guardar. Verifica a ligação ao Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (path: string[], value: any) => {
    setPageData((prev: any) => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (path: string[], itemSchema: any) => {
    const currentArray = path.reduce((obj, key) => obj?.[key], pageData) || [];
    const newItem = itemSchema?.type === 'object' 
      ? Object.keys(itemSchema.properties || {}).reduce((acc: any, key) => ({ ...acc, [key]: '' }), {})
      : '';
    updateField(path, [...currentArray, newItem]);
  };

  const removeArrayItem = (path: string[], index: number) => {
    const currentArray = path.reduce((obj, key) => obj?.[key], pageData) || [];
    updateField(path, currentArray.filter((_: any, i: number) => i !== index));
  };

  const renderField = (fieldKey: string, fieldSchema: any, currentPath: string[] = [], parentValue?: any) => {
    const fullPath = [...currentPath, fieldKey];
    const value = parentValue !== undefined ? parentValue[fieldKey] : fullPath.reduce((obj, key) => obj?.[key], pageData);
    const isRequired = fieldSchema.required;
    const type = fieldSchema.type || 'string';
    const label = fieldSchema.label || fieldKey;

    if (type === 'object' && fieldSchema.properties) {
      return (
        <div key={fieldKey} className="ml-4 pl-4 border-l-2 border-muted mb-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-3">{label}</h3>
          {Object.entries(fieldSchema.properties).map(([subKey, subSchema]) =>
            renderField(subKey, subSchema as any, fullPath, value)
          )}
        </div>
      );
    }

    if (type === 'array') {
      const arrayValue = Array.isArray(value) ? value : [];
      const itemSchema = fieldSchema.items;

      return (
        <div key={fieldKey} className="space-y-3 mb-4">
          <Label className="text-sm font-medium">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="space-y-2">
            {arrayValue.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-start">
                {itemSchema?.type === 'object' ? (
                  <Card className="flex-1 p-3">
                    {Object.entries(itemSchema.properties || {}).map(([propKey, propSchema]: [string, any]) => (
                      <div key={propKey} className="mb-2">
                        <Label className="text-xs">{propSchema.label || propKey}</Label>
                        {propSchema.isLongText ? (
                          <Textarea
                            value={item[propKey] || ''}
                            onChange={(e) => {
                              const newArray = [...arrayValue];
                              newArray[idx] = { ...item, [propKey]: e.target.value };
                              updateField(fullPath, newArray);
                            }}
                            className="min-h-[60px]"
                          />
                        ) : (
                          <Input
                            value={item[propKey] || ''}
                            onChange={(e) => {
                              const newArray = [...arrayValue];
                              newArray[idx] = { ...item, [propKey]: e.target.value };
                              updateField(fullPath, newArray);
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </Card>
                ) : (
                  <Input
                    value={item || ''}
                    onChange={(e) => {
                      const newArray = [...arrayValue];
                      newArray[idx] = e.target.value;
                      updateField(fullPath, newArray);
                    }}
                    className="flex-1"
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem(fullPath, idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem(fullPath, itemSchema)}
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar {label.slice(0, -1)}
            </Button>
          </div>
        </div>
      );
    }

    // Campo simples
    const isLongText = fieldSchema.isLongText || (typeof value === 'string' && value?.length > 100);
    const InputComponent = isLongText ? Textarea : Input;

    return (
      <div key={fieldKey} className="space-y-1 mb-4">
        <Label className="text-sm font-medium">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <InputComponent
          value={value ?? ''}
          onChange={(e) => updateField(fullPath, e.target.value)}
          placeholder={fieldSchema.placeholder || `Insira ${label.toLowerCase()}`}
          className={isLongText ? 'min-h-[100px]' : ''}
        />
        {fieldSchema.description && (
          <p className="text-xs text-muted-foreground">{fieldSchema.description}</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout title="Carregando...">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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

  const schema = PAGE_SCHEMAS[pageKey || ''] || {};
  
  // Agrupar campos por grupo
  const groups: Record<string, string[]> = {};
  Object.entries(schema).forEach(([key, config]: [string, any]) => {
    const group = config.group || 'main';
    if (!groups[group]) groups[group] = [];
    groups[group].push(key);
  });

  // Mapeamento de nomes dos grupos para português
  const groupLabels: Record<string, string> = {
    main: 'Principal',
    pt: 'Português',
    en: 'English',
    header: 'Cabeçalho',
    content: 'Conteúdo',
    objectives: 'Objectivos Estratégicos',
    values: 'Valores',
    cta: 'Chamada para Ação',
    seismic: 'Campanhas Sísmicas',
    processing: 'Processamento',
    newAreas: 'Novas Áreas',
    maps: 'Mapas',
    board: 'Conselho de Administração',
    supervision: 'Fiscalização',
    institutional: 'Institucional',
    timeline: 'Linha do Tempo',
    stats: 'Estatísticas',
    info: 'Informações',
    blocks: 'Blocos',
    advantages: 'Vantagens',
    areas: 'Áreas',
    features: 'Características',
    tabs: 'Tabs',
    dateFilters: 'Filtros de Data',
    sort: 'Ordenação',
    categories: 'Categorias',
    empty: 'Mensagens Vazias',
    defaultStats: 'Estatísticas Padrão',
    statsLabels: 'Labels Estatísticas',
    chartLabels: 'Labels Gráfico',
    decadeLabels: 'Labels Década',
    milestones: 'Marcos',
    sections: 'Secções Legais',
    dpo: 'Encarregado Dados',
    updates: 'Actualizações',
    contactFields: 'Campos do Formulário',
    interestOptions: 'Opções de Interesse',
    licenseTypes: 'Tipos de Licença',
    processSteps: 'Passos do Processo',
    phases: 'Fases',
    documents: 'Documentos',
    resources: 'Recursos',
    publications: 'Publicações',
    metrics: 'Métricas',
    activeTenders: 'Licitações Activas',
    pastTenders: 'Licitações Anteriores',
  };

  return (
    <AdminLayout title={pageConfig.label} subtitle={`Editar conteúdo da página ${pageConfig.url}`}>
      <div className="p-6 space-y-4">
        {/* Top bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/site-pages"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
          </Button>
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {isSaving ? 'A guardar...' : 'Guardar'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conteúdo da Página</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(groups).length > 1 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 flex flex-wrap h-auto">
                  {Object.keys(groups).map(group => (
                    <TabsTrigger key={group} value={group} className="text-sm">
                      {groupLabels[group] || group}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(groups).map(([group, fields]) => (
                  <TabsContent key={group} value={group} className="space-y-4">
                    {fields.map(fieldKey => renderField(fieldKey, schema[fieldKey]))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-4">
                {Object.entries(schema).map(([fieldKey, fieldSchema]: [string, any]) => 
                  renderField(fieldKey, fieldSchema)
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}