// src/pages/admin/AdminSitePagesPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, Edit, LayoutGrid, ChevronRight, Download, Upload, FileJson } from 'lucide-react';
import { SITE_PAGES, SITE_PAGE_CATEGORIES } from '@/data/pageSchemas';
import { toast } from 'sonner';
import { exportAllPages, getAllPagesData, getLastUpdated, importAllPages, loadPageFromLocalStorage } from '@/service/localJsonService';


export default function AdminSitePagesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allPagesData, setAllPagesData] = useState<Record<string, any>>({});

  // Carregar todas as páginas do localStorage
  useEffect(() => {
    const data = getAllPagesData();
    setAllPagesData(data);
  }, [refreshKey]);

  // Obter status da página
  const getPageStatus = (pageKey: string) => {
    const data = allPagesData[pageKey] || loadPageFromLocalStorage(pageKey);
    const hasData = !!data;
    const lastUpdated = getLastUpdated(pageKey);

    // Contar campos preenchidos
    const countFields = (obj: any): number => {
      if (!obj) return 0;
      let count = 0;
      Object.values(obj).forEach(value => {
        if (typeof value === 'string' && value.length > 0) count++;
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          count += countFields(value);
        } else if (Array.isArray(value)) {
          // Para arrays, conta o número de itens
          count += value.length;
        }
      });
      return count;
    };

    const fieldCount = countFields(data);

    return {
      hasData,
      fieldCount,
      lastUpdated,
    };
  };

  const handleExportAll = () => {
    exportAllPages();
    toast.success('Todas as páginas exportadas!');
  };

  const handleExportSingle = (pageKey: string, label: string) => {
    const data = loadPageFromLocalStorage(pageKey);
    if (data) {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageKey}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`"${label}" exportada com sucesso!`);
    } else {
      toast.error('Nenhum dado para exportar');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const success = importAllPages(importedData);

        if (success) {
          toast.success('Dados importados com sucesso!');
          setRefreshKey(k => k + 1);
        } else {
          toast.error('Erro ao importar dados');
        }
      } catch (error) {
        toast.error('Erro ao importar ficheiro: formato inválido');
      }
    };
    reader.readAsText(file);
  };

  const filtered = SITE_PAGES.filter(p => {
    const matchSearch = !search || p.label.toLowerCase().includes(search.toLowerCase()) || p.url.includes(search.toLowerCase());
    const matchCat = !activeCategory || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped = SITE_PAGE_CATEGORIES.map(cat => ({
    category: cat,
    pages: filtered.filter(p => p.category === cat.key),
  })).filter(g => g.pages.length > 0);

  return (
    <AdminLayout title="Páginas do Site" subtitle="Gerir conteúdo de todas as páginas">
      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar páginas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="h-4 w-4 mr-1" />
              Exportar Tudo
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                Importar JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={!activeCategory ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setActiveCategory(null)}
          >
            Todas ({SITE_PAGES.length})
          </Badge>
          {SITE_PAGE_CATEGORIES.map(cat => {
            const count = SITE_PAGES.filter(p => p.category === cat.key).length;
            return (
              <Badge
                key={cat.key}
                variant={activeCategory === cat.key ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
              >
                {cat.label} ({count})
              </Badge>
            );
          })}
        </div>

        {/* Page groups */}
        {grouped.map(({ category, pages }) => (
          <div key={category.key}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">{category.label}</h2>
            <div className="grid gap-3">
              {pages.map((page) => {
                const { hasData, fieldCount, lastUpdated } = getPageStatus(page.pageKey);

                return (
                  <Card key={page.pageKey} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Page info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{page.label}</span>
                            <span className="text-xs text-muted-foreground font-mono">{page.url}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <LayoutGrid className="h-3 w-3" />
                              {hasData ? (
                                <Badge variant="default" className="text-[10px] px-1 py-0">
                                  {fieldCount} campo{fieldCount !== 1 ? 's' : ''}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                  Por editar
                                </Badge>
                              )}
                            </span>
                            {lastUpdated && (
                              <span className="hidden md:inline">
                                Atualizado: {new Date(lastUpdated).toLocaleDateString('pt-PT')}
                              </span>
                            )}
                            {!hasData && !lastUpdated && (
                              <span className="hidden md:inline text-muted-foreground">
                                Aguardando primeira edição
                              </span>
                            )}
                            {page.sections && page.sections.length > 0 && (
                              <span className="hidden md:inline">
                                Secções: {page.sections.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExportSingle(page.pageKey, page.label)}
                            title="Exportar JSON"
                          >
                            <FileJson className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={page.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="default" size="sm" asChild>
                            <Link to={`/admin/site-pages/${page.pageKey}`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}