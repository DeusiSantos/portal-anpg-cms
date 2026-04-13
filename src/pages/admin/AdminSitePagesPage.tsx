import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SITE_PAGES, SITE_PAGE_CATEGORIES } from '@/data/sitePages';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, ExternalLink, Edit, Image, LayoutGrid, ChevronRight } from 'lucide-react';

export default function AdminSitePagesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch banner and content block counts for each page
  const { data: banners } = useQuery({
    queryKey: ['admin-site-pages-banners'],
    queryFn: async () => {
      const { data } = await supabase.from('page_banners').select('page_key, image_url, updated_at').eq('is_active', true);
      return data || [];
    },
  });

  const { data: blockCounts } = useQuery({
    queryKey: ['admin-site-pages-blocks'],
    queryFn: async () => {
      const { data } = await supabase.from('content_blocks').select('page_key, updated_at').eq('is_active', true);
      return data || [];
    },
  });

  const bannerMap = new Map(banners?.map(b => [b.page_key, b]) || []);
  const blocksPerPage = new Map<string, { count: number; lastUpdated: string }>();
  blockCounts?.forEach(b => {
    const existing = blocksPerPage.get(b.page_key);
    if (!existing) {
      blocksPerPage.set(b.page_key, { count: 1, lastUpdated: b.updated_at });
    } else {
      existing.count += 1;
      if (b.updated_at > existing.lastUpdated) existing.lastUpdated = b.updated_at;
    }
  });

  const filtered = SITE_PAGES.filter(p => {
    const matchSearch = !search || p.label.toLowerCase().includes(search.toLowerCase()) || p.url.includes(search.toLowerCase());
    const matchCat = !activeCategory || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped = SITE_PAGE_CATEGORIES.map(cat => ({
    category: cat,
    pages: filtered.filter(p => p.category === cat),
  })).filter(g => g.pages.length > 0);

  return (
    <AdminLayout title="Páginas do Site" subtitle="Gerir conteúdo, banners e SEO de todas as páginas">
      <div className="p-6 space-y-6">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar páginas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={!activeCategory ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory(null)}
            >
              Todas ({SITE_PAGES.length})
            </Badge>
            {SITE_PAGE_CATEGORIES.map(cat => {
              const count = SITE_PAGES.filter(p => p.category === cat).length;
              return (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                >
                  {cat} ({count})
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Page groups */}
        {grouped.map(({ category, pages }) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">{category}</h2>
            <div className="grid gap-3">
              {pages.map((page) => {
                const banner = bannerMap.get(page.pageKey);
                const blocks = blocksPerPage.get(page.pageKey);
                const hasBanner = !!banner?.image_url;
                const blockCount = blocks?.count || 0;

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
                              <Image className="h-3 w-3" />
                              Banner: {hasBanner ? (
                                <Badge variant="default" className="text-[10px] px-1 py-0">✓</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">—</Badge>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <LayoutGrid className="h-3 w-3" />
                              {blockCount} bloco{blockCount !== 1 ? 's' : ''}
                            </span>
                            {page.sections.length > 0 && (
                              <span className="hidden md:inline">
                                Secções: {page.sections.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
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
