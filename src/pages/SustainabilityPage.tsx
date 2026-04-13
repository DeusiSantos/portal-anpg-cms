import { Leaf, Wind, Droplets, TreePine, Sun, Recycle, Shield, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useContentBlocks } from "@/hooks/useCMSData";

const iconMap: Record<string, any> = { Wind, Droplets, TreePine, Recycle, Sun, Leaf, Shield, Target };

const defaultPillars = [
  { iconKey: "Wind", title: "Transição Energética", description: "Apoio ao desenvolvimento de fontes de energia renovável e diversificação da matriz energética nacional." },
  { iconKey: "Droplets", title: "Gestão de Recursos Hídricos", description: "Monitorização e protecção dos recursos hídricos nas áreas de operação petrolífera." },
  { iconKey: "TreePine", title: "Biodiversidade", description: "Preservação dos ecossistemas e habitats naturais nas zonas de exploração e produção." },
  { iconKey: "Recycle", title: "Economia Circular", description: "Promoção de práticas de reutilização e reciclagem na indústria petrolífera." },
];

const defaultStats = [
  { value: "30%", label: "Redução de Emissões", description: "Meta para 2030" },
  { value: "Zero", label: "Flaring Rotineiro", description: "Objectivo até 2030" },
  { value: "100%", label: "Monitorização", description: "Cobertura ambiental" },
  { value: "50+", label: "Projectos", description: "Iniciativas ambientais activas" },
];

const defaultInitiatives = [
  { title: "Programa de Redução de Emissões", description: "Implementação de tecnologias para captura e redução de gases de efeito estufa nas operações petrolíferas.", status: "Em curso" },
  { title: "Eliminação do Flaring", description: "Projectos de aproveitamento do gás associado para geração de energia e outras aplicações.", status: "Em curso" },
  { title: "Monitorização Ambiental Contínua", description: "Sistema de monitorização em tempo real da qualidade do ar, água e solo nas áreas de operação.", status: "Activo" },
  { title: "Reabilitação de Áreas Degradadas", description: "Programas de recuperação ambiental em áreas afectadas por operações petrolíferas passadas.", status: "Em curso" },
];

const defaultSdgGoals = [
  { number: 7, title: "Energia Limpa", iconKey: "Sun" },
  { number: 13, title: "Acção Climática", iconKey: "Wind" },
  { number: 14, title: "Vida Aquática", iconKey: "Droplets" },
  { number: 15, title: "Vida Terrestre", iconKey: "TreePine" },
];

export default function SustainabilityPage() {
  const { t } = useTranslation();

  // Fetch all content blocks for this page
  const { data: cmsBlocks } = useContentBlocks("sustainability");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const pillarsData = getSection("pillars");
  const statsData = getSection("stats");
  const initiativesData = getSection("initiatives");
  const sdgData = getSection("sdg");
  const introData = getSection("intro");

  const pillars = pillarsData?.items?.length ? pillarsData.items : defaultPillars;
  const stats = statsData?.items?.length ? statsData.items : defaultStats;
  const initiatives = initiativesData?.items?.length ? initiativesData.items : defaultInitiatives;
  const sdgGoals = sdgData?.items?.length ? sdgData.items : defaultSdgGoals;

  return (
    <PageLayout
      pageKey="sustainability"
      title={t("services.sustainability.title")}
      subtitle={t("services.label")}
      description={t("services.sustainability.description")}
      
      icon={<Leaf className="w-8 h-8 text-primary" />}
      breadcrumbs={[{ label: t("services.sustainability.title") }]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {introData?.text || "A ANPG está comprometida com a promoção de práticas ambientalmente responsáveis no sector petrolífero. Trabalhamos para garantir que o desenvolvimento dos recursos energéticos de Angola seja realizado de forma sustentável, protegendo o ambiente e contribuindo para a transição energética global."}
            </p>
          </div>
        </motion.section>

        {/* Environmental Stats */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat: any, index: number) => (
              <motion.div key={stat.label || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                <Card className="text-center p-6 hover:shadow-elevated transition-all duration-300">
                  <div className="text-3xl font-bold text-status-success-foreground mb-1">{stat.value}</div>
                  <div className="text-foreground font-medium mb-1">{stat.label}</div>
                  <div className="text-muted-foreground text-xs">{stat.description}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Sustainability Pillars */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{pillarsData?.heading || "Pilares da Sustentabilidade"}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((pillar: any, index: number) => {
              const Icon = iconMap[pillar.iconKey] || Leaf;
              return (
                <motion.div key={pillar.title || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
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

        {/* Initiatives */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{initiativesData?.heading || "Iniciativas em Curso"}</h2>
          <div className="space-y-4">
            {initiatives.map((initiative: any, index: number) => (
              <motion.div key={initiative.title || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}>
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

        {/* SDG Alignment */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                {sdgData?.heading || "Alinhamento com os ODS"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {sdgData?.description || "As nossas iniciativas estão alinhadas com os Objectivos de Desenvolvimento Sustentável das Nações Unidas:"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sdgGoals.map((goal: any) => {
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
      </div>
    </PageLayout>
  );
}
