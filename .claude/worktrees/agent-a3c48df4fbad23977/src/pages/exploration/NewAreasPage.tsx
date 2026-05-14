import { Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { useContentBlocks } from "@/hooks/useCMSData";

export default function NewAreasPage() {
  const { t } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks("exploration-new-areas");
  const getSection = (key: string) => cmsBlocks?.find(b => b.section_key === key)?.content;

  return (
    <PageLayout
      pageKey="exploration-new-areas"
      titleKey="pages.exploration.newAreas"
      subtitleKey="pages.exploration.newAreasSubtitle"
      
      icon={<Globe2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.exploration", href: "/exploration" },
        { labelKey: "pages.exploration.newAreas" },
      ]}
    >
      <div className="space-y-12">
        {["intro", "basins", "strategy"].map((key) => {
          const section = getSection(key);
          if (!section) return null;
          return (
            <section key={key}>
              <h2 className="text-2xl font-bold text-foreground mb-4">{section.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">{section.body}</p>
            </section>
          );
        })}
        {!cmsBlocks?.length && (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t("pages.exploration.newAreasContent")}
          </p>
        )}
      </div>
    </PageLayout>
  );
}
