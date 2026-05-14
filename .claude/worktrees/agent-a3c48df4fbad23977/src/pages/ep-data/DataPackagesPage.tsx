import { Database, Package, Archive } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useContentBlocks } from "@/hooks/useCMSData";
import { getIcon } from "@/lib/iconMap";

export default function DataPackagesPage() {
  const { t } = useTranslation();
  const { data: blocks } = useContentBlocks("data-packages");

  const intro = blocks?.find((b) => b.section_key === "intro")?.content;
  const packages = blocks?.find((b) => b.section_key === "packages")?.content;
  const process = blocks?.find((b) => b.section_key === "process")?.content;

  return (
    <PageLayout
      pageKey="data-packages"
      titleKey="pages.dataPackages.title"
      subtitleKey="pages.dataPackages.subtitle"
      descriptionKey="pages.dataPackages.description"
      icon={<Database className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.dataPackages" },
      ]}
    >
      <div className="space-y-16">
        {intro && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-4">{intro.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{intro.description}</p>
          </div>
        )}

        {packages?.items && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{packages.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {packages.items.map((item: any, i: number) => {
                const Icon = getIcon(item.icon) || Package;
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

        {process && (
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-6">{process.title}</h2>
            <ol className="space-y-4 mb-6">
              {process.steps?.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground pt-1">{step}</span>
                </li>
              ))}
            </ol>
            {process.buttonText && (
              <Link to={process.buttonLink || "/contacts"} className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                {process.buttonText}
              </Link>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
