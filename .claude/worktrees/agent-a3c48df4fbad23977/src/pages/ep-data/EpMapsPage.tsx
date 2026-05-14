import { Map, Download, Building2, Layers, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ConcessionsMap } from "@/components/concessions/ConcessionsMap";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { lazy, Suspense, useMemo } from "react";

const GeographicMap = lazy(() => import("@/components/concessions/GeographicMap").then(m => ({ default: m.GeographicMap })));
import { usePetroleumBlocks, basinLabels } from "@/hooks/usePetroleumBlocks";

export default function EpMapsPage() {
  const { t } = useTranslation();
  const { data: blocks = [] } = usePetroleumBlocks();

  const operatorStats = useMemo(() => {
    const operators: Record<string, { blocks: number; production: number }> = {};
    blocks.forEach(block => {
      if (!operators[block.operator]) {
        operators[block.operator] = { blocks: 0, production: 0 };
      }
      operators[block.operator].blocks++;
      if (block.statusKey === "production") {
        operators[block.operator].production++;
      }
    });
    return Object.entries(operators)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.blocks - a.blocks)
      .slice(0, 8);
  }, [blocks]);

  const basinStats = useMemo(() => {
    const basins: Record<string, number> = {};
    blocks.forEach(block => {
      basins[block.basinKey] = (basins[block.basinKey] || 0) + 1;
    });
    return basins;
  }, [blocks]);

  const uniqueBasins = useMemo(() => {
    return [...new Set(blocks.map(b => b.basinKey))].sort();
  }, [blocks]);

  return (
    <PageLayout
      pageKey="ep-maps"
      titleKey="pages.epMaps.title"
      subtitleKey="pages.epMaps.subtitle"
      descriptionKey="pages.epMaps.description"
      
      icon={<Map className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.epMaps" },
      ]}
      heroChildren={
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="hero" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {t("pages.epMaps.downloadPdf")}
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
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("pages.epMaps.basinDistribution")}</h2>
              <p className="text-muted-foreground text-sm">{t("pages.epMaps.basinDistributionDesc")}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {uniqueBasins.map((key, index) => {
              const colors = [
                "from-primary/20 to-primary/5 border-primary/30",
                "from-accent/20 to-accent/5 border-accent/30",
                "from-secondary/40 to-secondary/10 border-border",
                "from-muted/60 to-muted/20 border-border",
              ];
              return (
                <div key={key} className={`p-6 rounded-2xl bg-gradient-to-br ${colors[index % colors.length]} border`}>
                  <h3 className="font-bold text-foreground mb-1">{basinLabels[key] || key}</h3>
                  <p className="text-3xl font-bold text-primary">{basinStats[key] || 0}</p>
                  <p className="text-sm text-muted-foreground">{t("pages.epMaps.blocks")}</p>
                </div>
              );
            })}
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
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("pages.epMaps.concessionsMap")}</h2>
              <p className="text-muted-foreground text-sm">{t("pages.epMaps.concessionsMapDesc")}</p>
            </div>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="map" className="gap-2">
                <Map className="w-4 h-4" />
                {t("pages.epMaps.mapView")}
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="w-4 h-4" />
                {t("pages.epMaps.listView")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <Suspense fallback={<div className="h-[600px] w-full rounded-2xl border border-border bg-muted/50 flex items-center justify-center text-muted-foreground">{t("pages.epMaps.loadingMap")}</div>}>
                <GeographicMap blocks={blocks} />
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
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("pages.epMaps.topOperators")}</h2>
              <p className="text-muted-foreground text-sm">{t("pages.epMaps.topOperatorsDesc")}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {operatorStats.map((operator, index) => (
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
                  <span className="text-muted-foreground">{t("pages.epMaps.operatedBlocks")}</span>
                  <span className="font-medium text-foreground">{operator.blocks}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">{t("pages.epMaps.inProduction")}</span>
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
                <h3 className="font-semibold text-foreground mb-2">{t("pages.epMaps.updatedData")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("pages.epMaps.updatedDataDesc")}{" "}
                  <a href="https://anpg.co.ao" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {t("pages.epMaps.officialPortal")}
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
