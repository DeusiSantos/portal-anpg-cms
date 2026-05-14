import { Shield, Eye, AlertTriangle, CheckCircle2, ClipboardCheck, FileWarning, HardHat } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { usePageData } from "@/hooks/pages/usePageData";

const areaIcons = [Eye, ClipboardCheck, HardHat, FileWarning];

export default function OversightPage() {
  const { data: pageData } = usePageData("oversight");

  const stats: Array<{ value: string; label: string }> = pageData?.stats || [];
  const areas: Array<{ title: string; description: string }> = pageData?.areas || [];
  const complianceAreas: string[] = pageData?.complianceAreas || [];

  return (
    <PageLayout
      pageKey="oversight"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Shield className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "services.regulation.title", href: "/regulation" },
        { label: pageData?.title || "Fiscalização" },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">{pageData?.intro || ""}</p>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
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
          <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.areasTitle || "Áreas de Fiscalização"}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {areas.map((area, index) => {
              const Icon = areaIcons[index % areaIcons.length];
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
                {pageData?.complianceTitle || "Conformidade Regulatória"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{pageData?.complianceIntro || "As empresas que operam em Angola devem cumprir com os seguintes requisitos:"}</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {complianceAreas.map((area, index) => (
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
                <h3 className="font-semibold text-foreground mb-2">{pageData?.reportingTitle || "Reporte de Incidentes"}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{pageData?.reportingDescription || "As empresas são obrigadas a reportar imediatamente à ANPG qualquer incidente de segurança ou ambiental."}</p>
                <p className="text-sm text-foreground font-medium">{pageData?.emergencyLine || ""}</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </PageLayout>
  );
}
