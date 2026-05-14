import { Layers, Database, Map, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";

const iconMap: Record<string, React.ElementType> = { Layers, Database, Map, FileText };

export default function IonaPage() {
  const { data: pageData } = usePageData("iona");

  const features: Array<{ icon: string; title: string; description: string }> = pageData?.features || [];

  return (
    <PageLayout
      pageKey="iona"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Layers className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.platformIona" },
      ]}
    >
      <div className="space-y-16">
        {/* Intro */}
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">{pageData?.introTitle || ""}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{pageData?.introDescription || ""}</p>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.featuresTitle || "Funcionalidades"}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((item, i) => {
                const Icon = iconMap[item.icon] || Database;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-secondary/50 border border-border">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Access */}
        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <h2 className="text-2xl font-bold text-foreground mb-4">{pageData?.accessTitle || "Como Aceder"}</h2>
          <p className="text-muted-foreground mb-4">{pageData?.accessDescription || ""}</p>
          {pageData?.accessEmail && (
            <p className="text-sm text-muted-foreground mb-6">
              Email: <a href={`mailto:${pageData.accessEmail}`} className="text-primary hover:underline">{pageData.accessEmail}</a>
            </p>
          )}
          {pageData?.accessButtonText && (
            <Link to={pageData?.accessButtonLink || "/contacts"} className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {pageData.accessButtonText}
            </Link>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
