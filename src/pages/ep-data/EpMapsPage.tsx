import { Map, Download, Building2, Layers, List } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ConcessionsMap } from "@/components/concessions/ConcessionsMap";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { lazy, Suspense } from "react";
import { usePageData } from "@/hooks/pages/usePageData";

const GeographicMap = lazy(() => import("@/components/concessions/GeographicMap").then(m => ({ default: m.GeographicMap })));

export default function EpMapsPage() {
  const { data: pageData } = usePageData("epMaps");

  const basins: Array<{ key: string; label: string; count: number }> = pageData?.basins || [];
  const topOperators: Array<{ name: string; blocks: number; production: number }> = pageData?.topOperatorsList || [];

  const basinColors = [
    "from-primary/20 to-primary/5 border-primary/30",
    "from-accent/20 to-accent/5 border-accent/30",
    "from-secondary/40 to-secondary/10 border-border",
    "from-muted/60 to-muted/20 border-border",
  ];

  return (
    <PageLayout
      pageKey="ep-maps"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Map className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.epMaps" },
      ]}
      heroChildren={
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="hero" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {pageData?.downloadPdf || "Download PDF"}
          </Button>
        </div>
      }
    >
      {/* Basin Distribution */}
      <SectionTransition>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.basinDistribution || "Distribuição por Bacia"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.basinDistributionDesc || ""}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {basins.map((basin, index) => (
              <div key={basin.key} className={`p-6 rounded-2xl bg-gradient-to-br ${basinColors[index % basinColors.length]} border`}>
                <h3 className="font-bold text-foreground mb-1">{basin.label}</h3>
                <p className="text-3xl font-bold text-primary">{basin.count}</p>
                <p className="text-sm text-muted-foreground">{pageData?.blocksLabel || "Blocos"}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionTransition>

      {/* Interactive Map with Tabs */}
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.concessionsMap || "Mapa de Concessões"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.concessionsMapDesc || ""}</p>
            </div>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="map" className="gap-2">
                <Map className="w-4 h-4" />
                {pageData?.mapView || "Vista Mapa"}
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="w-4 h-4" />
                {pageData?.listView || "Vista Lista"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <Suspense fallback={<div className="h-[600px] w-full rounded-2xl border border-border bg-muted/50 flex items-center justify-center text-muted-foreground">{pageData?.loadingMap || "A carregar mapa..."}</div>}>
                <GeographicMap blocks={[]} />
              </Suspense>
            </TabsContent>

            <TabsContent value="list">
              <ConcessionsMap />
            </TabsContent>
          </Tabs>
        </section>
      </SectionTransition>

      {/* Top Operators */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pageData?.topOperators || "Principais Operadores"}</h2>
              <p className="text-muted-foreground text-sm">{pageData?.topOperatorsDesc || ""}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topOperators.map((operator, index) => (
              <div
                key={operator.name}
                className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-foreground">{operator.name}</h3>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{pageData?.operatedBlocks || "Blocos Operados"}</span>
                  <span className="font-medium text-foreground">{operator.blocks}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">{pageData?.inProduction || "Em Produção"}</span>
                  <span className="font-medium text-primary">{operator.production}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </SectionTransition>

      {/* Info Note */}
      <SectionTransition delay={0.3}>
        <section>
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Map className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">{pageData?.updatedData || "Dados Actualizados"}</h3>
                <p className="text-sm text-muted-foreground">
                  {pageData?.updatedDataDesc || "Informação actualizada sobre os blocos petrolíferos de Angola."}{" "}
                  <a href="https://anpg.co.ao" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {pageData?.officialPortal || "Portal Oficial ANPG"}
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
