import { FileCheck, ClipboardList, FileText, CheckCircle2, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { usePageData } from "@/hooks/pages/usePageData";

const licenseIcons = [ClipboardList, FileText, CheckCircle2];

export default function LicensingPage() {
  const { data: pageData } = usePageData("licensing");

  const licenseTypes: Array<{ title: string; description: string; duration: string }> = pageData?.licenseTypes || [];
  const processSteps: Array<{ title: string; description: string }> = pageData?.processSteps || [];

  return (
    <PageLayout
      pageKey="licensing"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<FileCheck className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "services.regulation.title", href: "/regulation" },
        { label: pageData?.title || "Licenciamento" },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {pageData?.intro || ""}
            </p>
          </div>
        </motion.section>

        {/* License Types */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.licenseTypesTitle || "Tipos de Licença"}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {licenseTypes.map((license, index) => {
              const Icon = licenseIcons[index % licenseIcons.length];
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                  <Card className="h-full hover:shadow-elevated transition-all duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{license.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">{license.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">{license.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Process Steps */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">{pageData?.processTitle || "Processo de Licenciamento"}</h2>
          <p className="text-muted-foreground mb-8">{pageData?.processSubtitle || "Como obter uma licença petrolífera em Angola"}</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="bg-foreground text-primary-foreground">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{pageData?.ctaTitle || "Precisa de uma Licença?"}</h3>
                    <p className="text-primary-foreground/70">{pageData?.ctaDescription || "Entre em contacto com a nossa equipa de licenciamento para obter orientação sobre o processo."}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="heroOutline" asChild>
                    <Link to="/opportunities">{pageData?.ctaOpportunities || "Ver Oportunidades"}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/contacts">{pageData?.ctaContact || "Contactar ANPG"}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </PageLayout>
  );
}
