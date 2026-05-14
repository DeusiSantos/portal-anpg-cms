import { Building2, Users, Landmark, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { BoardOrgChart, BoardData, BoardMember } from "@/components/about/BoardOrgChart";
import { InstitutionalContent } from "@/components/about/InstitutionalContent";
import { usePageData } from "@/hooks/pages/usePageData";
import { useBoardMembers } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { data: pageData, isLoading: pageLoading } = usePageData("anpg");
  const { data: apiMembers, isLoading: membersLoading } = useBoardMembers();

  if (pageLoading) {
    return (
      <PageLayout
        pageKey="anpg"
        title="ANPG"
        subtitle="Agência Nacional de Petróleo, Gás e Biocombustíveis"
        icon={<Building2 className="w-8 h-8 text-primary" />}
        breadcrumbs={[
          { label: pageData?.breadcrumbAbout || "Sobre nós", href: "/about" },
          { label: "ANPG" },
        ]}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  const content = pageData?.content || {};
  const staticBoard = pageData?.board || {};
  const institutional = pageData?.institutional;

  // Mapear membros da API para o formato do BoardOrgChart
  const apiBoardData: BoardData | null = apiMembers && apiMembers.length > 0 ? {
    title: staticBoard.title,
    supervision: staticBoard.supervision,
    members: apiMembers.map((m): BoardMember => ({
      id: m.id,
      slug: m.slug,
      name: m.full_name,
      role: m.title,
      pelouro: m.role,
      photoUrl: m.photo_url || undefined,
      isPCA: m.title.toLowerCase().includes("presidente"),
      email: m.email || undefined,
      phone: m.phone || undefined,
      biography: m.bio,
      institutionalMessage: m.message,
    })),
  } : null;

  // API tem prioridade; fallback para JSON estático
  const boardData: BoardData = apiBoardData || staticBoard;

  return (
    <PageLayout
      pageKey="anpg"
      title={pageData?.title || "ANPG"}
      subtitle={pageData?.subtitle || "Agência Nacional de Petróleo, Gás e Biocombustíveis"}
      description={pageData?.description || ""}
      icon={<Building2 className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: "Sobre nós", href: "/about" },
        { label: pageData?.breadcrumbLabel || "ANPG" },
      ]}
    >
      {/* Introduction */}
      <SectionTransition>
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3 space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {content.intro}
              </p>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {content.role}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {content.vision}
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden shadow-card aspect-[4/3]">
                <img
                  src={offshoreImage}
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
        <SectionDivider
          label={staticBoard.title || "Conselho de Administração"}
          icon={Users}
        />
      </SectionTransition>

      {/* Board of Directors */}
      <SectionTransition delay={0.1}>
        <section className="py-12">
          {membersLoading ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Skeleton className="w-64 h-32 rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            </div>
          ) : (
            <BoardOrgChart boardData={boardData} />
          )}
        </section>
      </SectionTransition>

      {/* Divider: Board → Institutional */}
      <SectionTransition delay={0.2}>
        <SectionDivider
          label={institutional?.purpose?.title || "Propósito Institucional"}
          icon={Landmark}
        />
      </SectionTransition>

      {/* Institutional Content */}
      <SectionTransition delay={0.3}>
        <section className="pt-12">
          <InstitutionalContent institutional={institutional} />
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
