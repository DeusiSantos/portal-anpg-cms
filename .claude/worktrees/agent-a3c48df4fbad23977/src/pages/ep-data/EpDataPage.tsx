import { Database, Layers, Image, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";

export default function EpDataPage() {
  const { t } = useTranslation();

  const dataItems = [
    { icon: Layers, titleKey: "nav.submenu.platformIona", descriptionKey: "nav.submenu.platformIonaDesc", href: "/ep-data/iona" },
    { icon: Image, titleKey: "nav.submenu.oasisImageBank", descriptionKey: "nav.submenu.oasisImageBankDesc", href: "/ep-data/oasis" },
    { icon: Database, titleKey: "nav.submenu.dataPackages", descriptionKey: "nav.submenu.dataPackagesDesc", href: "/ep-data/packages" },
    { icon: Map, titleKey: "nav.submenu.epMaps", descriptionKey: "nav.submenu.epMapsDesc", href: "/ep-data/maps" },
  ];

  return (
    <PageLayout
      pageKey="ep-data"
      titleKey="pages.epData.title"
      subtitleKey="pages.epData.subtitle"
      descriptionKey="pages.epData.description"
      
      icon={<Database className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData" },
      ]}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataItems.map((item) => {
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
