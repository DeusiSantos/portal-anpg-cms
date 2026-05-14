import { Globe2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";

export default function NewAreasPage() {
  const { data: pageData } = usePageData("exploration");

  return (
    <PageLayout
      pageKey="exploration-new-areas"
      title={pageData?.newAreas}
      subtitle={pageData?.newAreasSubtitle}
      icon={<Globe2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.exploration", href: "/exploration" },
        { label: pageData?.newAreas || "Novas Áreas" },
      ]}
    >
      <div className="space-y-12">
        <p className="text-muted-foreground text-lg leading-relaxed">
          {pageData?.newAreasContent || "A ANPG promove a avaliação contínua de novas áreas com potencial petrolífero, tanto em bacias conhecidas como em fronteiras de exploração."}
        </p>
      </div>
    </PageLayout>
  );
}
