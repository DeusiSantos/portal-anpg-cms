import { Globe2, Calendar, ArrowRight, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { usePageData } from "@/hooks/pages/usePageData";

export default function TendersPage() {
  const { data: pageData } = usePageData("tendersPage");

  const activeTenders: Array<{ id: string; title: string; status: string; blocks: number; deadline: string; href: string }> = pageData?.activeTenders || [];
  const phases: Array<{ title: string; description: string }> = pageData?.phases || [];
  const pastTenders: Array<{ year: string; title: string; blocksOffered: number; blocksAwarded: number; investment: string; href: string }> = pageData?.pastTenders || [];

  return (
    <PageLayout
      pageKey="tenders"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Globe2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "services.regulation.title", href: "/regulation" },
        { label: pageData?.title || "Licitações" },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">{pageData?.intro || ""}</p>
          </div>
        </motion.section>

        {/* Active Tenders */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.activeTitle || "Licitações Activas"}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeTenders.map((tender, index) => (
              <motion.div key={tender.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                <Link to={tender.href}>
                  <Card className="h-full hover:shadow-elevated transition-all duration-300 group cursor-pointer">
                    <CardHeader className="flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{tender.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{tender.blocks} {pageData?.blocksLabel || "blocos"}</span>
                          {tender.deadline && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tender.deadline}</span>}
                        </div>
                      </div>
                      <Badge variant={tender.status === "active" || tender.status === "Em curso" ? "default" : "secondary"}>
                        {tender.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="gap-2 p-0 h-auto text-primary">
                        {pageData?.viewDetails || "Ver detalhes"} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tender Phases */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">{pageData?.phasesTitle || "Fases Típicas de uma Licitação"}</h2>
          <p className="text-muted-foreground mb-8">{pageData?.phasesSubtitle || "Como funciona o processo de concurso"}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases.map((phase, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold flex-shrink-0">{index + 1}</div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{phase.title}</h3>
                        <p className="text-muted-foreground text-sm">{phase.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Past Tenders */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.pastTitle || "Licitações Anteriores"}</h2>
          <div className="space-y-4">
            {pastTenders.map((tender, index) => (
              <motion.div key={tender.year} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}>
                <Link to={tender.href}>
                  <Card className="hover:shadow-elevated transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tender.title}</h3>
                            <p className="text-muted-foreground text-sm">
                              {tender.blocksOffered} {pageData?.blocksOffered || "Blocos oferecidos"} • {tender.blocksAwarded} {pageData?.blocksAwarded || "Blocos adjudicados"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{pageData?.investmentCaptured || "Investimento captado"}</p>
                            <p className="text-lg font-semibold text-primary">{tender.investment}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}
