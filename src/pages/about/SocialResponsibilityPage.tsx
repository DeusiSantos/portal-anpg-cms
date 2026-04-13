import { 
  Heart, 
  GraduationCap, 
  Leaf, 
  Users, 
  Shield, 
  Target,
  BookOpen,
  Briefcase,
  Trophy,
  Palette,
  Scale,
  Building2,
  Handshake
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { useContentBlocks } from "@/hooks/useCMSData";
import chevronLogo from "@/assets/partners/chevron.png";
import totalLogo from "@/assets/partners/totalenergies.png";
import essoLogo from "@/assets/partners/esso.png";
import eniLogo from "@/assets/partners/eni.svg";
import bpLogo from "@/assets/partners/bp.png";
import sonangolLogo from "@/assets/partners/sonangol.svg";

const iconMap: Record<string, React.ElementType> = {
  education: GraduationCap,
  training: BookOpen,
  health: Shield,
  economic: Briefcase,
  social: Users,
  sports: Trophy,
  culture: Palette,
  environment: Leaf,
};

const defaultAreas = [
  { key: "education", icon: "education", title: "Promoção da Educação", description: "Construção, reabilitação e apetrechamento de escolas do I e II Ciclos que já beneficiaram mais de 6 milhões de alunos em todo o país." },
  { key: "training", icon: "training", title: "Formação Profissional", description: "Apoio à construção de centros de formação técnico-profissionais e programas de capacitação aos docentes, contribuindo para o combate ao analfabetismo." },
  { key: "health", icon: "health", title: "Saúde", description: "Construção, reabilitação e apetrechamento de hospitais e centros de saúde, além de apoio a programas de capacitação e formação de médicos." },
  { key: "economic", icon: "economic", title: "Desenvolvimento Económico", description: "Empoderamento do género feminino, orientação sócio-profissional de jovens e colaboração com comunidades locais na criação de valor compartilhado." },
  { key: "social", icon: "social", title: "Acção Social", description: "Apoio a orfanatos, igrejas e outras camadas da sociedade com carências, promovendo a inclusão social através da identificação das reais necessidades." },
  { key: "sports", icon: "sports", title: "Desporto", description: "Apoio a clubes locais e massificação do desporto escolar, promovendo a saúde e integração social através de actividades desportivas." },
  { key: "culture", icon: "culture", title: "Cultura", description: "Valorização e preservação do património cultural angolano, apoiando iniciativas artísticas e eventos culturais nas comunidades." },
  { key: "environment", icon: "environment", title: "Ambiente", description: "Projectos de reflorestação, protecção de ecossistemas e conservação de espécies terrestres e marinhas em risco de extinção." },
];

const partnerLogos: Record<string, string> = {
  "Chevron": chevronLogo,
  "TotalEnergies": totalLogo,
  "Esso": essoLogo,
  "Eni": eniLogo,
  "BP": bpLogo,
  "Sonangol P&P": sonangolLogo,
};

const defaultPartners = [
  { name: "Chevron", blocks: "Bloco 0" },
  { name: "TotalEnergies", blocks: "Blocos 17 e 32" },
  { name: "Esso", blocks: "Bloco 15" },
  { name: "Eni", blocks: "Bloco 15/06" },
  { name: "BP", blocks: "Blocos 18 e 31" },
  { name: "Sonangol P&P", blocks: "Vários blocos" },
];

const defaultSdgGoals = [
  { number: 1, name: "Erradicação da Pobreza" },
  { number: 3, name: "Saúde e Bem-Estar" },
  { number: 4, name: "Educação de Qualidade" },
  { number: 5, name: "Igualdade de Género" },
  { number: 8, name: "Trabalho Digno e Crescimento Económico" },
  { number: 13, name: "Acção Climática" },
  { number: 14, name: "Vida na Água" },
  { number: 15, name: "Vida Terrestre" },
];

const defaultImpactStats = [
  { value: "6M+", label: "Alunos Beneficiados", icon: "education" },
  { value: "18", label: "Províncias Abrangidas", icon: "economic" },
  { value: "50+", label: "Escolas Construídas", icon: "training" },
  { value: "20+", label: "Centros de Saúde", icon: "health" },
];

const statIconMap: Record<string, React.ElementType> = {
  education: GraduationCap,
  economic: Building2,
  training: BookOpen,
  health: Shield,
};

export default function SocialResponsibilityPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("social-responsibility");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  const statsData = getSection("stats");
  const impactStats = statsData?.items?.length ? statsData.items : defaultImpactStats;

  const areasData = getSection("areas");
  const areas = areasData?.items?.length ? areasData.items : defaultAreas;

  const partnersData = getSection("partners");
  const partners = partnersData?.items?.length ? partnersData.items : defaultPartners;

  const sdgData = getSection("sdg");
  const sdgGoals = sdgData?.items?.length ? sdgData.items : defaultSdgGoals;

  const introData = getSection("intro");
  const objectivesData = getSection("objectives");

  return (
    <PageLayout
      pageKey="social-responsibility"
      titleKey="pages.socialResponsibility.title"
      subtitleKey="pages.socialResponsibility.subtitle"
      descriptionKey="pages.socialResponsibility.description"
      
      icon={<Heart className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.aboutUs", href: "/about" },
        { labelKey: "nav.submenu.socialResponsibility" },
      ]}
    >
      {/* Impact Stats */}
      <SectionTransition>
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {impactStats.map((stat: any, index: number) => {
              const Icon = statIconMap[stat.icon] || GraduationCap;
              return (
                <div
                  key={index}
                  className="bg-secondary/50 border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>

      {/* Introduction */}
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {introData?.title || "Introdução"}
            </h2>
          </div>
          <div className="max-w-4xl space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {introData?.p1 || "A responsabilidade social do sector petrolífero é um pilar fundamental para o desenvolvimento sócio-económico do país. A Agência Nacional de Petróleo, Gás e Biocombustíveis desenvolve, em conjunto com os parceiros, actividades para apoiar e impulsionar iniciativas sociais que estejam alinhadas às directrizes do Executivo, visando criar oportunidades de crescimento sustentável e integrado das comunidades."}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {introData?.p2 || "A estratégia consiste em implementar projectos que ajudem a melhorar a qualidade de vida das populações, com foco no crescimento sócio-económico e na integração na sociedade, promovendo a inclusão social através de apoio e identificação das suas reais necessidades."}
            </p>
          </div>
        </section>
      </SectionTransition>

      {/* Mission & Objectives */}
      <SectionTransition delay={0.15}>
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{objectivesData?.objectivesTitle || "Objectivos"}</h3>
              </div>
              <ul className="space-y-4">
                {(objectivesData?.objectivesList || [
                  "Congregar os parceiros do sector petrolífero na execução de estratégias e acções para a implementação de projectos de Responsabilidade Social.",
                  "Garantir o desenvolvimento sustentável das comunidades através da implementação de projectos sociais mensuráveis e auto-sustentáveis.",
                ]).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary/50 border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{objectivesData?.missionTitle || "Nossa Missão"}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {objectivesData?.missionP1 || "O Conselho de Administração da ANPG define e implementa a Estratégia de Responsabilidade Social, de forma a potencializar as acções sociais em conjunto com os seus parceiros, tendo por objectivo a promoção, o fortalecimento e a defesa dos direitos sociais."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {objectivesData?.missionP2 || "É levar o maior recurso do País a todas as comunidades, para que todos os angolanos usufruam dos benefícios através da construção de infra-estruturas, doação de bens e apoio de projectos com programas de desenvolvimento económico."}
              </p>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Areas of Focus */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {areasData?.title || "Áreas de Actuação"}
            </h2>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {areas.map((area: any) => {
              const Icon = iconMap[area.icon || area.key] || Users;
              return (
                <StaggerItem key={area.key}>
                  <div className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{area.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* Legal Framework & SDGs */}
      <SectionTransition delay={0.25}>
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {sdgData?.legalTitle || "Enquadramento Legal"}
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-4xl">
              {sdgData?.legalText || "A Lei n.º 10/04, de 12 de Novembro, Lei das Actividades Petrolíferas, alterada pela Lei 5/19 de 18 de Abril, nos seus Artigos 83º e 84º, estabelece que uma parcela do bónus entregue ao Estado em decorrência dos Contratos Petrolíferos celebrados deve ser aplicada em projectos sociais."}
            </p>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {sdgData?.sdgTitle || "Objectivos de Desenvolvimento Sustentável (ODS) Alinhados"}
              </h3>
              <div className="flex flex-wrap gap-3">
                {sdgGoals.map((goal: any) => (
                  <div
                    key={goal.number}
                    className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 flex items-center gap-2"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {goal.number}
                    </span>
                    <span className="text-sm text-foreground">{goal.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Partners */}
      <SectionTransition delay={0.3}>
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Handshake className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {partnersData?.title || "Parceiros do Sector"}
            </h2>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            {partnersData?.description || "A ANPG trabalha em conjunto com os principais operadores do sector petrolífero angolano para implementar projectos de responsabilidade social em todo o país."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((partner: any) => {
              const logo = partnerLogos[partner.name] || partner.logo;
              return (
                <div
                  key={partner.name}
                  className="bg-secondary/50 border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center"
                >
                  {logo ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-background flex items-center justify-center mx-auto mb-3 border border-border">
                      <img src={logo} alt={partner.name} className="w-12 h-12 object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground text-sm mb-1">{partner.name}</h4>
                  <span className="text-xs text-muted-foreground">{partner.blocks}</span>
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
