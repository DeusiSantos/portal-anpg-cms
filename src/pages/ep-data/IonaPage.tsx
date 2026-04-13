import { Layers, Database, Map, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useContentBlocks } from "@/hooks/useCMSData";
import { getIcon } from "@/lib/iconMap";

export default function IonaPage() {
  const { t } = useTranslation();
  const { data: blocks } = useContentBlocks("iona");

  const intro = blocks?.find((b) => b.section_key === "intro")?.content;
  const features = blocks?.find((b) => b.section_key === "features")?.content;
  const access = blocks?.find((b) => b.section_key === "access")?.content;

  return (
    <PageLayout
      pageKey="iona"
      titleKey="pages.iona.title"
      subtitleKey="pages.iona.subtitle"
      descriptionKey="pages.iona.description"
      icon={<Layers className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.platformIona" },
      ]}
    >
      <div className="space-y-16">
        {/* Intro */}
        {intro && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-4">{intro.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{intro.description}</p>
          </div>
        )}

        {/* Features */}
        {features?.items && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">{features.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.items.map((item: any, i: number) => {
                const Icon = getIcon(item.icon) || Database;
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
        {access && (
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">{access.title}</h2>
            <p className="text-muted-foreground mb-4">{access.description}</p>
            {access.email && (
              <p className="text-sm text-muted-foreground mb-6">
                Email: <a href={`mailto:${access.email}`} className="text-primary hover:underline">{access.email}</a>
              </p>
            )}
            {access.buttonText && (
              <Link to={access.buttonLink || "/contacts"} className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                {access.buttonText}
              </Link>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
