import { Compass, Layers, Database, Globe2, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";

const iconMap: Record<string, React.ElementType> = { Compass, Layers, Database, Globe2, Map };

export default function ExplorationPage() {
  const { data: pageData } = usePageData("exploration");

  const items: Array<{ icon: string; title: string; description: string; href: string }> = pageData?.items || [];

  return (
    <PageLayout
      pageKey="exploration"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      icon={<Compass className="w-8 h-8 text-primary" />}
      breadcrumbs={[{ labelKey: "nav.exploration" }]}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || Compass;
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
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}
