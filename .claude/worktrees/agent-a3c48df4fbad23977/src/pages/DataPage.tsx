import { BarChart3, Database, FileText, Map, Download, TrendingUp, PieChart, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useContentBlocks } from "@/hooks/useCMSData";

const resourceIcons = [Map, Database, FileText, TrendingUp];

export default function DataPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("data");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const introSection = getSection("intro");
  const metricsSection = getSection("metrics");
  const resourcesSection = getSection("resources");
  const publicationsSection = getSection("publications");
  const dashboardSection = getSection("dashboard");

  const defaultMetrics = t("pages.dataPage.metrics", { returnObjects: true }) as Array<{ value: string; label: string; description: string }>;
  const defaultResources = t("pages.dataPage.resources", { returnObjects: true }) as Array<{ title: string; description: string; href: string }>;
  const defaultPublications = t("pages.dataPage.publications", { returnObjects: true }) as Array<{ title: string; type: string; date: string }>;

  const metrics = metricsSection?.items?.length ? metricsSection.items : defaultMetrics;
  const resources = resourcesSection?.items?.length ? resourcesSection.items : defaultResources;
  const publications = publicationsSection?.items?.length ? publicationsSection.items : defaultPublications;

  return (
    <PageLayout
      pageKey="data"
      title={t("pages.dataPage.title")}
      subtitle={t("pages.dataPage.subtitle")}
      description={t("pages.dataPage.description")}
      
      icon={<BarChart3 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: t("pages.dataPage.title") },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">{introSection?.text || t("pages.dataPage.intro")}</p>
          </div>
        </motion.section>

        {/* Key Metrics */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.isArray(metrics) && metrics.map((metric, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                <Card className="text-center p-6 hover:shadow-elevated transition-all duration-300">
                  <div className="text-3xl font-bold text-primary mb-1">{metric.value}</div>
                  <div className="text-foreground font-medium mb-1">{metric.label}</div>
                  <div className="text-muted-foreground text-xs">{metric.description}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Data Resources */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{resourcesSection?.title || t("pages.dataPage.resourcesTitle")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.isArray(resources) && resources.map((resource, index) => {
              const Icon = resourceIcons[index] || FileText;
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
                  <Link to={resource.href}>
                    <Card className="h-full hover:shadow-elevated transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{resource.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{resource.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Publications */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">{publicationsSection?.title || t("pages.dataPage.publicationsTitle")}</h2>
            <Button variant="outline" asChild>
              <Link to="/media">{t("pages.dataPage.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {Array.isArray(publications) && publications.map((pub, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}>
                <Card className="hover:shadow-elevated transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{pub.title}</h3>
                        <p className="text-muted-foreground text-xs">{pub.type} • {pub.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Dashboard Preview */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="bg-foreground text-primary-foreground overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{dashboardSection?.title || t("pages.dataPage.dashboardTitle")}</h3>
                    <p className="text-primary-foreground/70">{dashboardSection?.description || t("pages.dataPage.dashboardDescription")}</p>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/production">{t("pages.dataPage.dashboardCta")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </PageLayout>
  );
}
