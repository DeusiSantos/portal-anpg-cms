import { Scale, FileCheck, Shield, Globe2, BookOpen, Gavel } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useContentBlocks } from "@/hooks/useCMSData";

const defaultRegulatoryAreas = [
  { icon: "FileCheck", titleKey: "services.licensing.title", descriptionKey: "services.licensing.description", href: "/regulation/licensing" },
  { icon: "Shield", titleKey: "services.oversight.title", descriptionKey: "services.oversight.description", href: "/regulation/oversight" },
  { icon: "Globe2", titleKey: "services.tenders.title", descriptionKey: "services.tenders.description", href: "/regulation/tenders" },
];

const defaultLegalFramework = [
  { title: "Lei das Actividades Petrolíferas", reference: "Lei nº 10/04", description: "Quadro legal base para as actividades de pesquisa, desenvolvimento, produção e comercialização de petróleo." },
  { title: "Decreto Presidencial ANPG", reference: "Decreto nº 49/19", description: "Criação e estatutos da Agência Nacional de Petróleo, Gás e Biocombustíveis." },
  { title: "Regulamento de Conteúdo Local", reference: "Decreto nº 271/20", description: "Legislação sobre o conteúdo local no sector petrolífero de Angola." },
  { title: "Regulamento de Segurança", reference: "Decreto nº 38/09", description: "Normas de segurança para operações petrolíferas." },
];

const defaultPrinciples = [
  "Transparência e previsibilidade nas decisões regulatórias",
  "Equidade no tratamento de todos os operadores",
  "Eficiência na gestão dos recursos naturais",
  "Protecção ambiental e segurança operacional",
  "Promoção do desenvolvimento económico e social",
];

const iconComponents: Record<string, React.ElementType> = {
  FileCheck, Shield, Globe2,
};

export default function RegulationPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("regulation");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const introSection = getSection("intro");
  const areasSection = getSection("areas");
  const legalSection = getSection("legal");
  const principlesSection = getSection("principles");

  const regulatoryAreas = areasSection?.items?.length ? areasSection.items : defaultRegulatoryAreas;
  const legalFramework = legalSection?.items?.length ? legalSection.items : defaultLegalFramework;
  const principles = principlesSection?.items?.length ? principlesSection.items : defaultPrinciples;

  return (
    <PageLayout
      pageKey="regulation"
      title={t("services.regulation.title")}
      subtitle={t("services.label")}
      description={t("services.regulation.description")}
      
      icon={<Scale className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: t("services.regulation.title") },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {introSection?.text || "A ANPG é responsável pelo desenvolvimento e aplicação do quadro regulatório do sector energético angolano. A nossa missão é garantir que todas as actividades petrolíferas sejam conduzidas de acordo com as melhores práticas internacionais, promovendo a transparência, a eficiência e a sustentabilidade do sector."}
            </p>
          </div>
        </motion.section>

        {/* Regulatory Areas */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-foreground mb-8">{areasSection?.title || "Áreas de Actuação"}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {regulatoryAreas.map((area: any, index: number) => {
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
                          {area.title || t(area.titleKey)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {area.description || t(area.descriptionKey)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Legal Framework */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">{legalSection?.title || "Quadro Legal"}</h2>
          <p className="text-muted-foreground mb-8">{legalSection?.subtitle || "Principais instrumentos legais que regem o sector petrolífero angolano"}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {legalFramework.map((law: any, index: number) => (
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

        {/* Principles */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="bg-secondary/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Gavel className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{principlesSection?.title || "Princípios Regulatórios"}</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    {principles.map((item: string, i: number) => (
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
      </div>
    </PageLayout>
  );
}
