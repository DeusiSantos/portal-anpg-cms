import { Leaf, Wind, Droplets, TreePine, Sun, Recycle, Shield, Target, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { usePageData } from "@/hooks/pages/usePageData";

const iconMap: Record<string, any> = { Wind, Droplets, TreePine, Recycle, Sun, Leaf, Shield, Target };

export default function SustainabilityPage() {
  const { data: pageData, isLoading } = usePageData("sustainability");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats: Array<{ value: string; label: string; description: string }> = pageData?.stats || [];
  const pillars: Array<{ iconKey: string; title: string; description: string }> = pageData?.pillars || [];
  const initiatives: Array<{ title: string; description: string; status: string }> = pageData?.initiatives || [];
  const sdgGoals: Array<{ number: number; title: string; iconKey: string }> = pageData?.sdgGoals || [];

  return (
    <PageLayout
      pageKey="sustainability"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Leaf className="w-8 h-8 text-primary" />}
      breadcrumbs={[{ label: pageData?.title || "Sustentabilidade" }]}
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

        {/* Environmental Stats */}
        {stats.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                  <Card className="text-center p-6 hover:shadow-elevated transition-all duration-300">
                    <div className="text-3xl font-bold text-status-success-foreground mb-1">{stat.value}</div>
                    <div className="text-foreground font-medium mb-1">{stat.label}</div>
                    <div className="text-muted-foreground text-xs">{stat.description}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Sustainability Pillars */}
        {pillars.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.pillarsTitle || "Pilares da Sustentabilidade"}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pillars.map((pillar, index) => {
                const Icon = iconMap[pillar.iconKey] || Leaf;
                return (
                  <motion.div key={pillar.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
                    <Card className="h-full hover:shadow-elevated transition-all duration-300">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-status-success/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-status-success-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{pillar.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Initiatives */}
        {initiatives.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.initiativesTitle || "Iniciativas em Curso"}</h2>
            <div className="space-y-4">
              {initiatives.map((initiative, index) => (
                <motion.div key={initiative.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}>
                  <Card className="hover:shadow-elevated transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-status-success/10 flex items-center justify-center flex-shrink-0">
                            <Target className="w-5 h-5 text-status-success-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-2">{initiative.title}</h3>
                            <p className="text-muted-foreground text-sm">{initiative.description}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-status-success/10 text-status-success-foreground text-xs font-medium flex-shrink-0">
                          {initiative.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* SDG Alignment */}
        {sdgGoals.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  {pageData?.sdgTitle || "Alinhamento com os ODS"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {pageData?.sdgIntro || "As nossas iniciativas estão alinhadas com os Objectivos de Desenvolvimento Sustentável das Nações Unidas:"}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sdgGoals.map((goal) => {
                    const Icon = iconMap[goal.iconKey] || Sun;
                    return (
                      <div key={goal.number} className="flex items-center gap-3 p-4 rounded-lg bg-background">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          {goal.number}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{goal.title}</p>
                          <p className="text-xs text-muted-foreground">ODS {goal.number}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </div>
    </PageLayout>
  );
}
