import { Compass, Layers, Database, Globe2, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";

export default function ExplorationPage() {
  const { t } = useTranslation();

  const items = [
    { icon: Layers, titleKey: "pages.exploration.seismicCampaigns", descriptionKey: "pages.exploration.seismicCampaignsDesc", href: "/exploration/seismic-campaigns" },
    { icon: Database, titleKey: "pages.exploration.processing", descriptionKey: "pages.exploration.processingDesc", href: "/exploration/processing" },
    { icon: Globe2, titleKey: "pages.exploration.newAreas", descriptionKey: "pages.exploration.newAreasDesc", href: "/exploration/new-areas" },
    { icon: Map, titleKey: "pages.exploration.seismic2d", descriptionKey: "pages.exploration.seismic2dDesc", href: "/exploration/seismic-2d" },
    { icon: Map, titleKey: "pages.exploration.seismic3d", descriptionKey: "pages.exploration.seismic3dDesc", href: "/exploration/seismic-3d" },
    { icon: Map, titleKey: "pages.exploration.seismic4d", descriptionKey: "pages.exploration.seismic4dDesc", href: "/exploration/seismic-4d" },
  ];

  return (
    <PageLayout
      pageKey="exploration"
      titleKey="pages.exploration.title"
      subtitleKey="pages.exploration.subtitle"
      
      icon={<Compass className="w-8 h-8 text-primary" />}
      breadcrumbs={[{ labelKey: "nav.exploration" }]}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="group p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {t(item.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(item.descriptionKey)}
              </p>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}
