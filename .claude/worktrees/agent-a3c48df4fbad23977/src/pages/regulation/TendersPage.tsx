import { Globe2, Calendar, FileText, Users, ArrowRight, Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useContentBlocks } from "@/hooks/useCMSData";

export default function TendersPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("tenders");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const introSection = getSection("intro");
  const activeSection = getSection("active");
  const phasesSection = getSection("phases");
  const pastSection = getSection("past");

  const defaultActiveTenders = t("pages.tendersPage.activeTenders", { returnObjects: true }) as Array<{ id: string; title: string; status: string; blocks: number; deadline: string; href: string }>;
  const defaultPhases = t("pages.tendersPage.phases", { returnObjects: true }) as Array<{ title: string; description: string }>;
  const defaultPastTenders = t("pages.tendersPage.pastTenders", { returnObjects: true }) as Array<{ year: string; title: string; blocksOffered: number; blocksAwarded: number; investment: string; href: string }>;

  const activeTenders = activeSection?.items?.length ? activeSection.items : defaultActiveTenders;
  const phases = phasesSection?.items?.length ? phasesSection.items : defaultPhases;
  const pastTenders = pastSection?.items?.length ? pastSection.items : defaultPastTenders;

  return (
    <PageLayout
      pageKey="tenders"
      title={t("pages.tendersPage.title")}
      subtitle={t("pages.tendersPage.subtitle")}
      description={t("pages.tendersPage.description")}
      
      icon={<Globe2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: t("services.regulation.title"), href: "/regulation" },
        { label: t("pages.tendersPage.title") },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">{introSection?.text || t("pages.tendersPage.intro")}</p>
          </div>
        </motion.section>

        {/* Active Tenders */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{activeSection?.title || t("pages.tendersPage.activeTitle")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.isArray(activeTenders) && activeTenders.map((tender, index) => (
              <motion.div key={tender.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                <Link to={tender.href}>
                  <Card className="h-full hover:shadow-elevated transition-all duration-300 group cursor-pointer">
                    <CardHeader className="flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{tender.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{tender.blocks} {t("pages.tendersPage.blocksLabel")}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tender.deadline}</span>
                        </div>
                      </div>
                      <Badge variant={tender.status === "active" ? "default" : "secondary"}>
                        {tender.status === "active" ? t("pages.tendersPage.statusActive") : t("pages.tendersPage.statusOngoing")}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="gap-2 p-0 h-auto text-primary">
                        {t("pages.tendersPage.viewDetails")} <ArrowRight className="w-4 h-4" />
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
          <h2 className="text-2xl font-bold text-foreground mb-2">{phasesSection?.title || t("pages.tendersPage.phasesTitle")}</h2>
          <p className="text-muted-foreground mb-8">{phasesSection?.subtitle || t("pages.tendersPage.phasesSubtitle")}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(phases) && phases.map((phase, index) => (
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
          <h2 className="text-2xl font-bold text-foreground mb-8">{pastSection?.title || t("pages.tendersPage.pastTitle")}</h2>
          <div className="space-y-4">
            {Array.isArray(pastTenders) && pastTenders.map((tender, index) => (
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
                              {tender.blocksOffered} {t("pages.tendersPage.blocksOffered")} • {tender.blocksAwarded} {t("pages.tendersPage.blocksAwarded")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{t("pages.tendersPage.investmentCaptured")}</p>
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
