import { History, TrendingDown, Calendar, BarChart3, Download, Fuel, Droplets } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { useContentBlocks } from "@/hooks/useCMSData";
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

// Historical production data (numeric, not translatable)
const longTermProduction = [
  { year: "1978", oil: 135 }, { year: "1980", oil: 150 }, { year: "1985", oil: 230 },
  { year: "1990", oil: 475 }, { year: "1995", oil: 646 }, { year: "1998", oil: 735 },
  { year: "2000", oil: 746 }, { year: "2002", oil: 905 }, { year: "2005", oil: 1254 },
  { year: "2007", oil: 1723 }, { year: "2008", oil: 1875 }, { year: "2009", oil: 1784 },
  { year: "2010", oil: 1758 }, { year: "2012", oil: 1720 }, { year: "2014", oil: 1653 },
  { year: "2015", oil: 1767 }, { year: "2016", oil: 1722 }, { year: "2017", oil: 1632 },
  { year: "2018", oil: 1534 }, { year: "2019", oil: 1398 }, { year: "2020", oil: 1276 },
  { year: "2021", oil: 1124 }, { year: "2022", oil: 1162 }, { year: "2023", oil: 1098 },
  { year: "2024", oil: 1142 }, { year: "2025", oil: 1003 },
];

const productionByDecade = [
  { decade: "1970s", avgProduction: 135, peakYear: "1979", peak: 145 },
  { decade: "1980s", avgProduction: 285, peakYear: "1989", peak: 455 },
  { decade: "1990s", avgProduction: 598, peakYear: "1999", peak: 752 },
  { decade: "2000s", avgProduction: 1456, peakYear: "2008", peak: 1875 },
  { decade: "2010s", avgProduction: 1584, peakYear: "2015", peak: 1767 },
  { decade: "2020s", avgProduction: 1134, peakYear: "2022", peak: 1162 },
];

const monthlyData2024 = [
  { month: "Jan 2024", oil: 1156, gas: 68.5 }, { month: "Fev 2024", oil: 1143, gas: 67.8 },
  { month: "Mar 2024", oil: 1168, gas: 69.2 }, { month: "Abr 2024", oil: 1132, gas: 66.9 },
  { month: "Mai 2024", oil: 1145, gas: 68.1 }, { month: "Jun 2024", oil: 1158, gas: 69.8 },
  { month: "Jul 2024", oil: 1172, gas: 70.5 }, { month: "Ago 2024", oil: 1165, gas: 71.2 },
  { month: "Set 2024", oil: 1148, gas: 70.8 }, { month: "Out 2024", oil: 1139, gas: 71.5 },
  { month: "Nov 2024", oil: 1152, gas: 71.8 }, { month: "Dez 2024", oil: 1142, gas: 72.1 },
  { month: "Jan 2025", oil: 1025, gas: 71.4 }, { month: "Fev 2025", oil: 1018, gas: 71.2 },
  { month: "Mar 2025", oil: 1012, gas: 71.5 }, { month: "Abr 2025", oil: 1008, gas: 71.8 },
  { month: "Mai 2025", oil: 1005, gas: 71.6 }, { month: "Jun 2025", oil: 1003, gas: 71.9 },
];

export default function ProductionHistoryPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("production-history");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const milestonesSection = getSection("milestones");
  const ctaSection = getSection("cta");

  const defaultMilestones = t("pages.productionHistoryContent.milestones", { returnObjects: true }) as Array<{ year: string; title: string; description: string }>;
  const milestones = milestonesSection?.items?.length ? milestonesSection.items : defaultMilestones;
  const s = (key: string) => t(`pages.productionHistoryContent.statsLabels.${key}`);

  return (
    <PageLayout
      pageKey="production-history"
      titleKey="pages.productionHistory.title"
      subtitleKey="pages.productionHistory.subtitle"
      descriptionKey="pages.productionHistory.description"
      
      icon={<History className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.production", href: "/production" },
        { labelKey: "nav.submenu.productionHistory" },
      ]}
      heroChildren={
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="hero" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {t("pages.productionHistoryContent.downloadReport")}
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
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{t("pages.productionHistoryContent.longTermTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("pages.productionHistoryContent.longTermSubtitle")}</p>
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
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value: number) => [`${value} kbbl/dia`, t("pages.productionHistoryContent.chartLabels.production")]} />
                  <Area type="monotone" dataKey="oil" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOilHistory)" strokeWidth={2} name={t("pages.productionHistoryContent.chartLabels.oil")} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
              <TrendingDown className="w-5 h-5 text-status-warning flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-status-warning">Nota:</strong> {t("pages.productionHistoryContent.declineNote")}
              </p>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Monthly Production Chart */}
      <SectionTransition delay={0.15}>
        <section className="mb-16">
          <div className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{t("pages.productionHistoryContent.monthlyTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("pages.productionHistoryContent.monthlySubtitle")}</p>
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
                  <Bar yAxisId="left" dataKey="oil" fill="hsl(var(--primary))" name={t("pages.productionHistoryContent.chartLabels.oil")} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="gas" fill="hsl(var(--chart-2))" name={t("pages.productionHistoryContent.chartLabels.gas")} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Production by Decade */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("pages.productionHistoryContent.decadeTitle")}</h2>
              <p className="text-muted-foreground text-sm">{t("pages.productionHistoryContent.decadeSubtitle")}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productionByDecade.map((decade) => (
              <div key={decade.decade} className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{decade.decade}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {t("pages.productionHistoryContent.decadeLabels.peak")}: {decade.peakYear}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("pages.productionHistoryContent.decadeLabels.average")}</span>
                    <span className="font-semibold text-foreground">{decade.avgProduction} kbbl/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("pages.productionHistoryContent.decadeLabels.peak")}</span>
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

      {/* Timeline */}
      <SectionTransition delay={0.25}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("pages.productionHistoryContent.milestonesTitle")}</h2>
              <p className="text-muted-foreground text-sm">{t("pages.productionHistoryContent.milestonesSubtitle")}</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {Array.isArray(milestones) && milestones.map((milestone, index) => (
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

      {/* CTA */}
      <SectionTransition delay={0.3}>
        <section>
          <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-8 md:p-12 text-primary-foreground text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{ctaSection?.title || t("pages.productionHistoryContent.ctaTitle")}</h3>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">{ctaSection?.description || t("pages.productionHistoryContent.ctaDescription")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/production">{t("pages.productionHistoryContent.ctaDashboard")}</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground" asChild>
                <Link to="/ep-data">{t("pages.productionHistoryContent.ctaData")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
