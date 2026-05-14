import { Users, Building2, FileCheck, Award, ClipboardList, ExternalLink, FileText, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { usePageData } from "@/hooks/pages/usePageData";

const iconMap: Record<string, React.ElementType> = { Building2, ClipboardList, Award, CheckCircle2, Users, FileCheck, BarChart3 };

export default function LocalContentPage() {
  const { data: pageData, isLoading } = usePageData("localContent");

  const stats: Array<{ value: string; label: string; iconKey: string }> = pageData?.stats || [];
  const regimes: Array<{ title: string; iconKey: string; color: string; description: string }> = pageData?.regimes || [];
  const registrationSteps: string[] = pageData?.registrationSteps || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageLayout
      pageKey="local-content"
      title={pageData?.title || "Conteúdo Local"}
      subtitle={pageData?.subtitle || "Desenvolvimento Nacional"}
      description={pageData?.description || ""}
      icon={<Users className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: "Oportunidades", href: "/opportunities" },
        { label: pageData?.title || "Conteúdo Local" },
      ]}
    >
      <div className="space-y-16">
        {/* Introduction */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-6">{pageData?.introHeading || "Introdução"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {pageData?.introP1 || ""}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {pageData?.introP2 || ""}
            </p>
          </div>
        </motion.section>

        {/* Statistics */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">{pageData?.statsHeading || "Estatísticas de Registo e Certificação"}</h2>
          <p className="text-muted-foreground mb-8">{pageData?.statsSubheading || "Dados actualizados a Março de 2025"}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = iconMap[stat.iconKey] || Building2;
              return (
                <motion.div key={stat.label || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}>
                  <Card className="text-center p-6 hover:shadow-elevated transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Contracting Regimes */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">{pageData?.regimesHeading || "Regimes de Contratação"}</h2>
          <p className="text-muted-foreground mb-8">{pageData?.regimesSubheading || "O Decreto Presidencial nº 271/20 estabelece 3 Regimes de Contratação"}</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {regimes.map((regime, index) => {
              const Icon = iconMap[regime.iconKey] || CheckCircle2;
              return (
                <motion.div key={regime.title || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
                  <Card className="h-full hover:shadow-elevated transition-all duration-300">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl ${regime.color || "bg-primary/10 text-primary"} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{regime.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{regime.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          <p className="text-muted-foreground mt-8 text-sm">
            {pageData?.regimesFootnote || ""}
          </p>
        </motion.section>

        {/* Supplier Registration */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{pageData?.registrationHeading || "Registo de Fornecedor"}</CardTitle>
                  <p className="text-muted-foreground mt-1">{pageData?.registrationSubheading || "Processo de registo e certificação de empresas"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">{pageData?.registrationStepsHeading || "Etapas do Processo de Registo"}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
                {registrationSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</span>
                    <span className="text-muted-foreground text-xs">{step}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <a href={pageData?.registrationFormUrl || "https://forms.zohopublic.com/anpg/form/CLRegistoFornecedor/formperma/PaYLej_d7dGFaxmudrISHac0UX2LAkar2h7BOarl7J0"} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <FileText className="w-4 h-4" />
                    {pageData?.registrationFormLabel || "Formulário de Registo"}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={pageData?.registrationListsUrl || "https://anpg.co.ao/conteudo-local-lista-de-bens-e-servicos/"} target="_blank" rel="noopener noreferrer" className="gap-2">
                    {pageData?.registrationListsLabel || "Listas de Bens e Serviços"}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Power BI Dashboard */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{pageData?.dashboardHeading || "Dashboard de Empresas Certificadas"}</CardTitle>
                  <p className="text-muted-foreground mt-1">{pageData?.dashboardSubheading || "Consulte as empresas certificadas no âmbito do Conteúdo Local"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-[16/9] w-full bg-secondary/30">
                <iframe
                  title="Dashboard Empresas Certificadas - Conteúdo Local ANPG"
                  src={pageData?.dashboardEmbedUrl || "https://app.powerbi.com/view?r=eyJrIjoiY2Q5ZjRhMzMtZjFlZS00M2M0LWIwMjItNGQwMDkxYTMzNTY5IiwidCI6ImE4YjQ5N2NkLTM1NDQtNDEwZi04NzU2LTIzNTRlYjJkMTUyNyIsImMiOjl9"}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Documentation */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">{pageData?.docsHeading || "Documentação"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{pageData?.docsManualTitle || "Manual de Instrução ao Fornecedor"}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{pageData?.docsManualDescription || "Guia completo com instruções para o processo de registo e certificação de fornecedores."}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={pageData?.docsManualUrl || "https://anpg.co.ao/conteudo-local/"} target="_blank" rel="noopener noreferrer" className="gap-2">
                      {pageData?.docsManualLabel || "Descarregar"}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-status-warning/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-6 h-6 text-status-warning-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{pageData?.docsDecreeTitle || "Decreto Presidencial nº 271/20"}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{pageData?.docsDecreeDescription || "Legislação sobre o conteúdo local no sector petrolífero de Angola."}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={pageData?.docsDecreeUrl || "https://anpg.co.ao/conteudo-local/"} target="_blank" rel="noopener noreferrer" className="gap-2">
                      {pageData?.docsDecreeLabel || "Ver Documento"}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}
