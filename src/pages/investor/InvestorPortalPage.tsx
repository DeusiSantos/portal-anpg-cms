import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import { 
  Briefcase, FileText, MapPin, TrendingUp, Download, Calendar, ArrowRight, 
  Database, Shield, Users, Building2, BarChart3, Globe2, Lock, CalendarDays, LogOut
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer } from "@/components/layout/StaggerContainer";
import { OpportunitiesDashboard } from "@/components/investor/OpportunitiesDashboard";
import { DocumentCenter } from "@/components/investor/DocumentCenter";
import { MeetingScheduler } from "@/components/investor/MeetingScheduler";
import { useAuth } from "@/contexts/AuthContext";
import { usePageData } from "@/hooks/pages/usePageData";

export default function InvestorPortalPage() {
  const { t } = useTranslation();
  const { user, roles, loading, signOut } = useAuth();
  const { data: pageData } = usePageData("investorPortal");

  // Gate: redirect to login if not authenticated or not an investor/admin
  const roleNames = roles.map((r) => r.role as string);
  const isInvestor = roleNames.includes('investor') || roleNames.includes('admin') || roleNames.includes('gestor_investidores');

  if (!loading && (!user || !isInvestor)) {
    return <Navigate to="/investor-portal/login" replace />;
  }

  const breadcrumbs = [
    { labelKey: "nav.investorPortal" },
  ];

  const portalFeatures = [
    {
      icon: Database,
      titleKey: "investorPortal.features.dataRoom.title",
      descriptionKey: "investorPortal.features.dataRoom.description",
      available: false,
    },
    {
      icon: BarChart3,
      titleKey: "investorPortal.features.dashboard.title",
      descriptionKey: "investorPortal.features.dashboard.description",
      available: true,
    },
    {
      icon: FileText,
      titleKey: "investorPortal.features.interest.title",
      descriptionKey: "investorPortal.features.interest.description",
      available: false,
    },
    {
      icon: Briefcase,
      titleKey: "investorPortal.features.documents.title",
      descriptionKey: "investorPortal.features.documents.description",
      available: true,
    },
    {
      icon: CalendarDays,
      titleKey: "investorPortal.features.meetings.title",
      descriptionKey: "investorPortal.features.meetings.description",
      available: true,
    },
    {
      icon: Shield,
      titleKey: "investorPortal.features.secure.title",
      descriptionKey: "investorPortal.features.secure.description",
      available: false,
    },
  ];

  const investmentHighlights = [
    { value: "47", labelKey: "investorPortal.highlights.blocks" },
    { value: "8B+", labelKey: "investorPortal.highlights.reserves" },
    { value: "15%", labelKey: "investorPortal.highlights.fiscal" },
    { value: "12", labelKey: "investorPortal.highlights.operators" },
  ];

  return (
    <PageLayout
      pageKey="investor-portal"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Briefcase className="w-6 h-6" />}
      breadcrumbs={breadcrumbs}
    >
      {/* Welcome bar */}
      <div className="flex items-center justify-between mb-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">
            {t("investorPortal.welcome", "Bem-vindo ao Portal do Investidor")}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>

      {/* Investment Highlights */}
      <SectionTransition className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {investmentHighlights.map((item, index) => (
            <Card key={index} className="text-center bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <CardContent className="pt-6">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {item.value}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(item.labelKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionTransition>

      {/* Portal Features Overview */}
      <SectionTransition className="mb-16">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">
            {t("investorPortal.featuresLabel")}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t("investorPortal.featuresTitle")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("investorPortal.featuresSubtitle")}
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portalFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`relative overflow-hidden ${!feature.available ? 'opacity-75' : ''}`}
              >
                {!feature.available && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {t("investorPortal.comingSoon")}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">
                    {t(feature.titleKey)}
                  </CardTitle>
                  <CardDescription>
                    {t(feature.descriptionKey)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </StaggerContainer>
      </SectionTransition>

      {/* Opportunities Dashboard Section */}
      <SectionTransition className="mb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-4">
              {t("investorPortal.opportunitiesLabel")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t("investorPortal.opportunitiesTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("investorPortal.opportunitiesSubtitle")}
            </p>
          </div>
          <Button variant="outline" asChild className="mt-4 md:mt-0">
            <Link to="/ep-data/maps">
              {t("investorPortal.viewAllBlocks")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        
        <OpportunitiesDashboard />
      </SectionTransition>

      {/* Document Center Section */}
      <SectionTransition className="mb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-4">
              {t("investorPortal.documentsLabel")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t("investorPortal.documentsTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("investorPortal.documentsSubtitle")}
            </p>
          </div>
        </div>
        
        <DocumentCenter />
      </SectionTransition>

      {/* Meeting Scheduler Section */}
      <SectionTransition className="mb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-4">
              {t("investorPortal.meetingsLabel")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t("investorPortal.meetingsTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("investorPortal.meetingsSubtitle")}
            </p>
          </div>
        </div>
        
        <MeetingScheduler />
      </SectionTransition>

      {/* CTA Section - Register Interest */}
      <SectionTransition>
        <Card className="bg-gradient-to-br from-foreground to-foreground/90 text-primary-foreground overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  {t("investorPortal.ctaBadge")}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  {t("investorPortal.ctaTitle")}
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  {t("investorPortal.ctaDescription")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="lg">
                    {t("investorPortal.ctaRegister")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link to="/contacts">
                      {t("investorPortal.ctaContact")}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Globe2 className="w-8 h-8 text-primary-foreground/80" />
                        <div>
                          <div className="font-semibold text-primary-foreground">10+</div>
                          <div className="text-xs text-primary-foreground/60">{t("investorPortal.stats.basins")}</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary-foreground/80" />
                        <div>
                          <div className="font-semibold text-primary-foreground">20+</div>
                          <div className="text-xs text-primary-foreground/60">{t("investorPortal.stats.partners")}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4 mt-8">
                    <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-primary-foreground/80" />
                        <div>
                          <div className="font-semibold text-primary-foreground">1.1M</div>
                          <div className="text-xs text-primary-foreground/60">{t("investorPortal.stats.production")}</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary-foreground/80" />
                        <div>
                          <div className="font-semibold text-primary-foreground">$50B+</div>
                          <div className="text-xs text-primary-foreground/60">{t("investorPortal.stats.investment")}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SectionTransition>
    </PageLayout>
  );
}
