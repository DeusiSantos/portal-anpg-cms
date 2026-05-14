import { Gift, FileCheck, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";

const iconMap: Record<string, React.ElementType> = { Gift, FileCheck, Archive };

export default function OpportunitiesPage() {
  const { data: pageData } = usePageData("opportunities");

  const items: Array<{ icon: string; title: string; description: string; href: string }> = pageData?.items || [];

  return (
    <PageLayout
      pageKey="opportunities"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Gift className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.opportunities" },
      ]}
    >
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || Gift;
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
                {item.title}
              </h3>
              <p className="text-muted-foreground">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}
