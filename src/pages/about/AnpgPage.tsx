import { Building2, Users, Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { BoardOrgChart } from "@/components/about/BoardOrgChart";
import { InstitutionalContent } from "@/components/about/InstitutionalContent";
import { useContentBlocks } from "@/hooks/useCMSData";
import offshoreImage from "@/assets/angola-flag.jpg";

function SectionDivider({ label, icon: Icon }: { label?: string; icon?: typeof Building2 }) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/60" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-background px-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export default function AnpgPage() {
  const { t } = useTranslation();
  const { data: blocks } = useContentBlocks("anpg");

  const getSection = (key: string) => blocks?.find(b => b.section_key === key)?.content;

  const intro = getSection("intro");

  return (
    <PageLayout
      pageKey="anpg"
      titleKey="pages.anpg.title"
      subtitleKey="pages.anpg.subtitle"
      descriptionKey="pages.anpg.description"
      
      icon={<Building2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.aboutUs", href: "/about" },
        { labelKey: "nav.submenu.anpg" },
      ]}
    >
      {/* Introduction */}
      <SectionTransition>
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3 space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {intro?.intro || t("pages.anpg.content.intro")}
              </p>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {intro?.role || t("pages.anpg.content.role")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {intro?.vision || t("pages.anpg.content.vision")}
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden shadow-card aspect-[4/3]">
                <img
                  src={intro?.image || offshoreImage}
                  alt="Plataforma Petrolífera Offshore em Angola"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Divider: Intro → Board */}
      <SectionTransition delay={0.05}>
        <SectionDivider label={t("pages.anpg.board.title")} icon={Users} />
      </SectionTransition>

      {/* Board of Directors */}
      <SectionTransition delay={0.1}>
        <section className="py-12">
          <BoardOrgChart />
        </section>
      </SectionTransition>

      {/* Divider: Board → Institutional */}
      <SectionTransition delay={0.2}>
        <SectionDivider label={t("pages.anpg.institutional.purpose.title")} icon={Landmark} />
      </SectionTransition>

      {/* Institutional Content */}
      <SectionTransition delay={0.3}>
        <section className="pt-12">
          <InstitutionalContent cmsBlocks={blocks} />
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
