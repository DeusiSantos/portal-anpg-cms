import { BarChart3, TrendingUp, TrendingDown, Fuel, Droplets, Factory, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { useContentBlocks } from "@/hooks/useCMSData";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from "recharts";


// Default data fallbacks
const defaultHistoricalProduction = [
  { year: "2018", oil: 1534, gas: 245 },
  { year: "2019", oil: 1398, gas: 268 },
  { year: "2020", oil: 1276, gas: 289 },
  { year: "2021", oil: 1124, gas: 312 },
  { year: "2022", oil: 1162, gas: 345 },
  { year: "2023", oil: 1098, gas: 378 },
  { year: "2024", oil: 1142, gas: 412 },
];

const defaultMonthlyProduction = [
  { month: "Jan", production: 1156 },
  { month: "Fev", production: 1143 },
  { month: "Mar", production: 1168 },
  { month: "Abr", production: 1132 },
  { month: "Mai", production: 1145 },
  { month: "Jun", production: 1158 },
  { month: "Jul", production: 1172 },
  { month: "Ago", production: 1165 },
  { month: "Set", production: 1148 },
  { month: "Out", production: 1139 },
  { month: "Nov", production: 1152 },
  { month: "Dez", production: 1142 },
];

const defaultProductionByOperator = [
  { name: "TotalEnergies", value: 28, barrels: 320 },
  { name: "Chevron", value: 22, barrels: 251 },
  { name: "ExxonMobil", value: 18, barrels: 205 },
  { name: "Azule Energy", value: 15, barrels: 171 },
  { name: "ENI", value: 10, barrels: 114 },
  { name: "Outros", value: 7, barrels: 81 },
];

const defaultProductionByBasin = [
  { basin: "Bacia do Congo", production: 612, percentage: 54 },
  { basin: "Bacia do Kwanza", production: 298, percentage: 26 },
  { basin: "Bacia do Namibe", production: 148, percentage: 13 },
  { basin: "Onshore", production: 84, percentage: 7 },
];

const getDefaultKeyStats = (t: (key: string) => string) => [
  { icon: "fuel", value: "1.14", suffix: "M bbl/dia", label: t("pages.production.defaultStats.oilProduction"), change: 4.0 },
  { icon: "gas", value: "412", suffix: "MMscf/dia", label: t("pages.production.defaultStats.gasProduction"), change: 9.0 },
  { icon: "blocks", value: "47", label: t("pages.production.defaultStats.activeBlocks") },
  { icon: "operators", value: "15", label: t("pages.production.defaultStats.intlOperators") },
];

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
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("production");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const statsSection = getSection("stats");
  const keyStats = statsSection?.items?.length ? statsSection.items : getDefaultKeyStats(t);

  const historicalSection = getSection("historical");
  const historicalProduction = historicalSection?.data?.length ? historicalSection.data : defaultHistoricalProduction;

  const monthlySection = getSection("monthly");
  const monthlyProduction = monthlySection?.data?.length ? monthlySection.data : defaultMonthlyProduction;

  const operatorSection = getSection("operators");
  const productionByOperator = operatorSection?.data?.length ? operatorSection.data : defaultProductionByOperator;

  const basinSection = getSection("basins");
  const productionByBasin = basinSection?.data?.length ? basinSection.data : defaultProductionByBasin;

  return (
    <PageLayout
      pageKey="production"
      titleKey="pages.production.title"
      subtitleKey="pages.production.subtitle"
      descriptionKey="pages.production.description"
      
      icon={<BarChart3 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.production" },
      ]}
    >
      {/* Key Statistics */}
      <SectionTransition>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider">
              <span className="w-8 h-px bg-primary" />
              {statsSection?.label || t("pages.production.keyIndicators")}
            </span>
          </div>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyStats.map((stat: any, i: number) => (
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
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                  {historicalSection?.title || t("pages.production.historicalTitle")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {historicalSection?.subtitle || t("pages.production.historicalSubtitle")}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{t("pages.production.oilLabel")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                  <span className="text-muted-foreground">{t("pages.production.gasLabel")}</span>
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
                  <Area type="monotone" dataKey="oil" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOil)" strokeWidth={2} name={t("pages.production.oilName")} />
                  <Area type="monotone" dataKey="gas" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorGas)" strokeWidth={2} name={t("pages.production.gasName")} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Monthly Production & Operators */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {monthlySection?.title || t("pages.production.monthlyTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {monthlySection?.subtitle || t("pages.production.monthlySubtitle")}
              </p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyProduction} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[1100, 1200]} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value) => [`${value} kbbl/dia`, t("pages.production.productionLabel")]} />
                    <Bar dataKey="production" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t("pages.production.productionLabel")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {operatorSection?.title || t("pages.production.operatorTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {operatorSection?.subtitle || t("pages.production.operatorSubtitle")}
              </p>
              <div className="h-[280px] flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={productionByOperator} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {productionByOperator.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: any) => [`${value}%`, t("pages.production.quotaLabel")]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {productionByOperator.map((operator: any, index: number) => (
                    <div key={operator.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-muted-foreground truncate flex-1">{operator.name}</span>
                      <span className="font-medium text-foreground">{operator.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Production by Basin */}
      <SectionTransition delay={0.3}>
        <section className="mb-16">
          <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {basinSection?.title || t("pages.production.basinTitle")}
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              {basinSection?.subtitle || t("pages.production.basinSubtitle")}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {productionByBasin.map((basin: any, index: number) => (
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

      {/* Data Table */}
      <SectionTransition delay={0.4}>
        <section>
          <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-1">{t("pages.production.tableTitle")}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t("pages.production.tableSubtitle")}</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">{t("pages.production.tableOperator")}</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">{t("pages.production.tableProduction")}</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">{t("pages.production.tableQuota")}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">{t("pages.production.tableTrend")}</th>
                  </tr>
                </thead>
                <tbody>
                  {productionByOperator.map((operator: any, index: number) => (
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
                          <span className="text-sm">{t("pages.production.trendStable")}</span>
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
    </PageLayout>
  );
}
