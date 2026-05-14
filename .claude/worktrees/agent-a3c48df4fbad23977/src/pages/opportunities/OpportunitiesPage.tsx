import { Gift, FileCheck, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";

export default function OpportunitiesPage() {
  const { t } = useTranslation();

  const opportunities = [
    {
      icon: FileCheck,
      titleKey: "nav.submenu.tender2025",
      descriptionKey: "nav.submenu.tender2025Desc",
      href: "/opportunities/tender-2025",
    },
    {
      icon: Gift,
      titleKey: "nav.submenu.permanentOffer",
      descriptionKey: "nav.submenu.permanentOfferDesc",
      href: "/opportunities/permanent-offer",
    },
    {
      icon: Archive,
      titleKey: "nav.submenu.tender2023",
      descriptionKey: "nav.submenu.tender2023Desc",
      href: "/opportunities/tender-2023",
    },
  ];

  return (
    <PageLayout
      pageKey="opportunities"
      titleKey="pages.opportunities.title"
      subtitleKey="pages.opportunities.subtitle"
      descriptionKey="pages.opportunities.description"
      
      icon={<Gift className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.opportunities" },
      ]}
    >
      <div className="grid md:grid-cols-3 gap-6">
        {opportunities.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="group p-8 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {t(item.titleKey)}
              </h3>
              <p className="text-muted-foreground">
                {t(item.descriptionKey)}
              </p>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}
