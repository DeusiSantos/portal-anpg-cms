import { Shield, Eye, AlertTriangle, CheckCircle2, ClipboardCheck, FileWarning, HardHat } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useContentBlocks } from "@/hooks/useCMSData";

const areaIcons = [Eye, ClipboardCheck, HardHat, FileWarning];

export default function OversightPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("oversight");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const introSection = getSection("intro");
  const statsSection = getSection("stats");
  const areasSection = getSection("areas");
  const complianceSection = getSection("compliance");
  const reportingSection = getSection("reporting");

  const defaultStats = t("pages.oversight.stats", { returnObjects: true }) as Array<{ value: string; label: string }>;
  const defaultAreas = t("pages.oversight.areas", { returnObjects: true }) as Array<{ title: string; description: string }>;
  const defaultComplianceAreas = t("pages.oversight.complianceAreas", { returnObjects: true }) as string[];

  const stats = statsSection?.items?.length ? statsSection.items : defaultStats;
  const areas = areasSection?.items?.length ? areasSection.items : defaultAreas;
  const complianceAreas = complianceSection?.items?.length ? complianceSection.items : defaultComplianceAreas;

  return (
    <PageLayout
      pageKey="oversight"
      title={t("pages.oversight.title")}
      subtitle={t("pages.oversight.subtitle")}
      description={t("pages.oversight.description")}
      
      icon={<Shield className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: t("services.regulation.title"), href: "/regulation" },
        { label: t("pages.oversight.title") },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">{introSection?.text || t("pages.oversight.intro")}</p>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.isArray(stats) && stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                <Card className="text-center p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Oversight Areas */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{areasSection?.title || t("pages.oversight.areasTitle")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.isArray(areas) && areas.map((area, index) => {
              const Icon = areaIcons[index] || Eye;
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
                  <Card className="h-full hover:shadow-elevated transition-all duration-300">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{area.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{area.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Compliance Areas */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                {complianceSection?.title || t("pages.oversight.complianceTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{complianceSection?.intro || t("pages.oversight.complianceIntro")}</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Array.isArray(complianceAreas) && complianceAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-background text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-foreground">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Reporting */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="border-status-warning/30 bg-status-warning/5">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-status-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-status-warning-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">{reportingSection?.title || t("pages.oversight.reportingTitle")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{reportingSection?.description || t("pages.oversight.reportingDescription")}</p>
                <p className="text-sm text-foreground font-medium">{reportingSection?.emergencyLine || t("pages.oversight.emergencyLine")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </PageLayout>
  );
}
