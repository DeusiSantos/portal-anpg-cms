import { Scale, FileCheck, Shield, Globe2, BookOpen, Gavel, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { usePageData } from "@/hooks/pages/usePageData";

const iconComponents: Record<string, React.ElementType> = {
  FileCheck, Shield, Globe2,
};

export default function RegulationPage() {
  const { data: pageData, isLoading } = usePageData("regulation");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const regulatoryAreas: Array<{ icon: string; title: string; description: string; href: string }> = pageData?.regulatoryAreas || [];
  const legalFramework: Array<{ title: string; reference: string; description: string }> = pageData?.legalFramework || [];
  const principles: string[] = pageData?.principles || [];

  return (
    <PageLayout
      pageKey="regulation"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Scale className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: pageData?.title || "Regulação" },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        {pageData?.intro && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {pageData.intro}
              </p>
            </div>
          </motion.section>
        )}

        {/* Regulatory Areas */}
        {regulatoryAreas.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.areasTitle || "Áreas de Actuação"}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {regulatoryAreas.map((area, index) => {
                const IconComp = iconComponents[area.icon] || FileCheck;
                return (
                  <motion.div key={area.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                    <Link to={area.href}>
                      <Card className="h-full hover:shadow-elevated transition-all duration-300 group cursor-pointer">
                        <CardHeader>
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                            <IconComp className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {area.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {area.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Legal Framework */}
        {legalFramework.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-foreground mb-2">{pageData?.legalFrameworkTitle || "Quadro Legal"}</h2>
            <p className="text-muted-foreground mb-8">{pageData?.legalFrameworkSubtitle || "Principais instrumentos legais que regem o sector petrolífero angolano"}</p>

            <div className="grid md:grid-cols-2 gap-6">
              {legalFramework.map((law, index) => (
                <motion.div key={law.reference} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
                  <Card className="hover:shadow-elevated transition-all duration-300">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{law.title}</h3>
                        <p className="text-primary text-sm font-medium mb-2">{law.reference}</p>
                        <p className="text-muted-foreground text-sm">{law.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Principles */}
        {principles.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="bg-secondary/30">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{pageData?.principlesTitle || "Princípios Regulatórios"}</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {principles.map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </div>
    </PageLayout>
  );
}
