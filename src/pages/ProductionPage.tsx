import { BarChart3, TrendingUp, TrendingDown, Fuel, Droplets, Factory, Globe, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { usePageData } from "@/hooks/pages/usePageData";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--muted-foreground))"];

const statIconMap: Record<string, React.ElementType> = {
  fuel: Fuel, gas: Droplets, blocks: Factory, operators: Globe,
};

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  change?: number;
  suffix?: string;
}

function StatCard({ icon: Icon, value, label, change, suffix }: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? "text-status-success-foreground" : "text-destructive"}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">
        {value}
        {suffix && <span className="text-lg font-normal text-muted-foreground ml-1">{suffix}</span>}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function ProductionPage() {
  const { data: pageData, isLoading } = usePageData("production");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const keyStats: Array<{ icon: string; value: string; suffix?: string; label: string; change?: number }> = pageData?.keyStats || [];
  const historicalProduction: Array<{ year: string; oil: number; gas: number }> = pageData?.historicalData || [];
  const monthlyProduction: Array<{ month: string; production: number }> = pageData?.monthlyData || [];
  const productionByOperator: Array<{ name: string; value: number; barrels: number }> = pageData?.operatorData || [];
  const productionByBasin: Array<{ basin: string; production: number; percentage: number }> = pageData?.basinData || [];

  return (
    <PageLayout
      pageKey="production"
      title={pageData?.title || "Produção"}
      subtitle={pageData?.subtitle || "Estatísticas"}
      description={pageData?.description || ""}
      icon={<BarChart3 className="w-8 h-8 text-primary" />}
      breadcrumbs={[{ label: pageData?.title || "Produção" }]}
    >
      {/* Key Statistics */}
      <SectionTransition>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider">
              <span className="w-8 h-px bg-primary" />
              {pageData?.keyIndicators || "Indicadores Chave"}
            </span>
          </div>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyStats.map((stat, i) => (
              <StaggerItem key={i}>
                <StatCard
                  icon={statIconMap[stat.icon] || Fuel}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  change={stat.change}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* Historical Production Chart */}
      {historicalProduction.length > 0 && (
        <SectionTransition delay={0.1}>
          <section className="mb-16">
            <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    {pageData?.historicalTitle || "Produção Histórica"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {pageData?.historicalSubtitle || ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{pageData?.oilLabel || "Petróleo (kbbl/dia)"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                    <span className="text-muted-foreground">{pageData?.gasLabel || "Gás (MMscf/dia)"}</span>
                  </div>
                </div>
              </div>

              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalProduction} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="oil" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOil)" strokeWidth={2} name={pageData?.oilName || "Petróleo"} />
                    <Area type="monotone" dataKey="gas" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorGas)" strokeWidth={2} name={pageData?.gasName || "Gás Natural"} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Monthly Production & Operators */}
      {(monthlyProduction.length > 0 || productionByOperator.length > 0) && (
        <SectionTransition delay={0.2}>
          <section className="mb-16">
            <div className="grid lg:grid-cols-2 gap-8">
              {monthlyProduction.length > 0 && (
                <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {pageData?.monthlyTitle || "Produção Mensal 2024"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {pageData?.monthlySubtitle || ""}
                  </p>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyProduction} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[1100, 1200]} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value) => [`${value} kbbl/dia`, pageData?.productionLabel || "Produção"]} />
                        <Bar dataKey="production" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={pageData?.productionLabel || "Produção"} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {productionByOperator.length > 0 && (
                <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {pageData?.operatorTitle || "Produção por Operador"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {pageData?.operatorSubtitle || ""}
                  </p>
                  <div className="h-[280px] flex items-center">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={productionByOperator} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                            {productionByOperator.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: any) => [`${value}%`, pageData?.quotaLabel || "Quota"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-2">
                      {productionByOperator.map((operator, index) => (
                        <div key={operator.name} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-muted-foreground truncate flex-1">{operator.name}</span>
                          <span className="font-medium text-foreground">{operator.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Production by Basin */}
      {productionByBasin.length > 0 && (
        <SectionTransition delay={0.3}>
          <section className="mb-16">
            <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {pageData?.basinTitle || "Produção por Bacia Sedimentar"}
              </h3>
              <p className="text-sm text-muted-foreground mb-8">
                {pageData?.basinSubtitle || ""}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {productionByBasin.map((basin, index) => (
                  <div key={basin.basin} className="p-5 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold" style={{ backgroundColor: COLORS[index] }}>
                        {basin.percentage}%
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{basin.basin}</h4>
                    <p className="text-2xl font-bold text-primary">{basin.production}</p>
                    <p className="text-xs text-muted-foreground">kbbl/dia</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Data Table */}
      {productionByOperator.length > 0 && (
        <SectionTransition delay={0.4}>
          <section>
            <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-1">{pageData?.tableTitle || "Dados de Produção por Operador"}</h3>
              <p className="text-sm text-muted-foreground mb-6">{pageData?.tableSubtitle || ""}</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">{pageData?.tableOperator || "Operador"}</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">{pageData?.tableProduction || "Produção (kbbl/dia)"}</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">{pageData?.tableQuota || "Quota (%)"}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">{pageData?.tableTrend || "Tendência"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionByOperator.map((operator, index) => (
                      <tr key={operator.name} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                            <span className="font-medium text-foreground">{operator.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-foreground">{operator.barrels}</td>
                        <td className="py-4 px-4 text-right font-mono text-muted-foreground">{operator.value}%</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-status-success-foreground">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">{pageData?.trendStable || "Estável"}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </SectionTransition>
      )}
    </PageLayout>
  );
}
