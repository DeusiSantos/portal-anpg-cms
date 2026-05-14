import { History, TrendingDown, Calendar, BarChart3, Download, Fuel, Droplets, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { usePageData } from "@/hooks/pages/usePageData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function ProductionHistoryPage() {
  const { data: pageData, isLoading } = usePageData("productionHistoryContent");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const s = (key: string) => pageData?.statsLabels?.[key] || key;
  const longTermProduction: Array<{ year: string; oil: number }> = pageData?.longTermProduction || [];
  const productionByDecade: Array<{ decade: string; avgProduction: number; peakYear: string; peak: number }> = pageData?.decadeData || [];
  const monthlyData2024: Array<{ month: string; oil: number; gas: number }> = pageData?.monthlyData2024 || [];
  const milestones: Array<{ year: string; title: string; description: string }> = pageData?.milestones || [];

  return (
    <PageLayout
      pageKey="production-history"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<History className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.production", href: "/production" },
        { labelKey: "nav.submenu.productionHistory" },
      ]}
      heroChildren={
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="hero" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {pageData?.downloadReport || "Descarregar Relatório"}
          </Button>
        </div>
      }
    >
      {/* Key Statistics */}
      <SectionTransition>
        <section className="mb-16">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{s("start")}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">1968</p>
                <p className="text-xs text-muted-foreground mt-1">{s("firstExport")}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{s("historicPeak")}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">1.875</p>
                <p className="text-xs text-muted-foreground mt-1">{s("peakUnit")}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{s("current")}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">1.003</p>
                <p className="text-xs text-muted-foreground mt-1">{s("currentUnit")}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{s("gas")}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">71.9</p>
                <p className="text-xs text-muted-foreground mt-1">{s("gasUnit")}</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* Long-term Production Chart */}
      {longTermProduction.length > 0 && (
        <SectionTransition delay={0.1}>
          <section className="mb-16">
            <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    {pageData?.longTermTitle || "Evolução Histórica (1978-2025)"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {pageData?.longTermSubtitle || ""}
                  </p>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={longTermProduction} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOilHistory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} interval="preserveStartEnd" />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => [`${value} kbbl/dia`, pageData?.chartLabels?.production || "Produção"]}
                    />
                    <Area type="monotone" dataKey="oil" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOilHistory)" strokeWidth={2} name={pageData?.chartLabels?.oil || "Petróleo (kbbl/dia)"} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {pageData?.declineNote && (
                <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
                  <TrendingDown className="w-5 h-5 text-status-warning flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-status-warning">Nota:</strong> {pageData.declineNote}
                  </p>
                </div>
              )}
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Monthly Production Chart */}
      {monthlyData2024.length > 0 && (
        <SectionTransition delay={0.15}>
          <section className="mb-16">
            <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                  {pageData?.monthlyTitle || "Produção Mensal (2024-2025)"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {pageData?.monthlySubtitle || ""}
                </p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData2024} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="oil" fill="hsl(var(--primary))" name={pageData?.chartLabels?.oil || "Petróleo (kbbl/dia)"} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="gas" fill="hsl(var(--chart-2))" name={pageData?.chartLabels?.gas || "Gás (MMscf/dia)"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Production by Decade */}
      {productionByDecade.length > 0 && (
        <SectionTransition delay={0.2}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {pageData?.decadeTitle || "Produção por Década"}
                </h2>
                <p className="text-muted-foreground text-sm">{pageData?.decadeSubtitle || ""}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productionByDecade.map((decade) => (
                <div key={decade.decade} className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">{decade.decade}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {pageData?.decadeLabels?.peak || "Pico"}: {decade.peakYear}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{pageData?.decadeLabels?.average || "Média"}</span>
                      <span className="font-semibold text-foreground">{decade.avgProduction} kbbl/dia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{pageData?.decadeLabels?.peak || "Pico"}</span>
                      <span className="font-semibold text-primary">{decade.peak} kbbl/dia</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500" style={{ width: `${(decade.peak / 1875) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Timeline */}
      {milestones.length > 0 && (
        <SectionTransition delay={0.25}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {pageData?.milestonesTitle || "Marcos Históricos"}
                </h2>
                <p className="text-muted-foreground text-sm">{pageData?.milestonesSubtitle || ""}</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="relative flex gap-6 md:gap-8">
                    <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0 shadow-lg shadow-primary/30">
                      {milestone.year}
                    </div>
                    <div className={`flex-1 pb-6 ${index === milestones.length - 1 ? 'pb-0' : ''}`}>
                      <div className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all">
                        <h3 className="font-bold text-foreground mb-2">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* CTA */}
      <SectionTransition delay={0.3}>
        <section>
          <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-8 md:p-12 text-primary-foreground text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {pageData?.ctaTitle || "Aceda aos Dados Completos"}
            </h3>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              {pageData?.ctaDescription || ""}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/production">{pageData?.ctaDashboard || "Dashboard de Produção"}</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground" asChild>
                <Link to="/ep-data">{pageData?.ctaData || "Explorar Dados de E&P"}</Link>
              </Button>
            </div>
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
