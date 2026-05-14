import { Database, Package, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";

const iconMap: Record<string, React.ElementType> = { Database, Package, Archive };

export default function DataPackagesPage() {
  const { data: pageData } = usePageData("dataPackages");

  const packages: Array<{ icon: string; title: string; description: string; price?: string }> = pageData?.packages || [];
  const processSteps: string[] = pageData?.processSteps || [];

  return (
    <PageLayout
      pageKey="data-packages"
      title={pageData?.title}
      subtitle={pageData?.subtitle}
      description={pageData?.description}
      icon={<Database className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.dataPackages" },
      ]}
    >
      <div className="space-y-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">{pageData?.introTitle || ""}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{pageData?.introDescription || ""}</p>
        </div>

        {packages.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{pageData?.packagesTitle || "Pacotes Disponíveis"}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {packages.map((item, i) => {
                const Icon = iconMap[item.icon] || Package;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-secondary/50 border border-border">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    {item.price && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{item.price}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {processSteps.length > 0 && (
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-6">{pageData?.processTitle || "Como Adquirir"}</h2>
            <ol className="space-y-4 mb-6">
              {processSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground pt-1">{step}</span>
                </li>
              ))}
            </ol>
            {pageData?.processButtonText && (
              <Link to={pageData?.processButtonLink || "/contacts"} className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                {pageData.processButtonText}
              </Link>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
