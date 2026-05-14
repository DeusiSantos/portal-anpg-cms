import { MessageSquareQuote, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { usePageData } from "@/hooks/pages/usePageData";
import pcaPhoto from "@/assets/board/paulino-jeronimo-official.png";

export default function PcaMessagePage() {
  const { data: pageData, isLoading } = usePageData("pcaMessage");

  const paragraphs: string[] = pageData?.paragraphs || [];
  const highlights: string[] = pageData?.highlights || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageLayout
      pageKey="pca-message"
      title={pageData?.title || "Mensagem do PCA"}
      subtitle={pageData?.subtitle || "Mensagem do Presidente"}
      description={pageData?.description || ""}
      icon={<MessageSquareQuote className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { label: "Sobre Nós", href: "/about" },
        { label: pageData?.title || "Mensagem do PCA" },
      ]}
    >
      <section className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Photo column */}
          <SectionTransition direction="right" className="lg:col-span-2">
            <div className="sticky top-32">
              <div className="relative rounded-2xl overflow-hidden shadow-card aspect-[2/3]">
                <img
                  src={pcaPhoto}
                  alt="Paulino Jerónimo – Presidente do Conselho de Administração da ANPG"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-foreground">{pageData?.name || "Paulino Jerónimo"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {pageData?.role || "Presidente do Conselho de Administração"}
                </p>
              </div>
            </div>
          </SectionTransition>

          {/* Text column */}
          <SectionTransition delay={0.15} className="lg:col-span-3">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider">
                <span className="w-8 h-px bg-primary" />
                {pageData?.subtitle || "Mensagem do Presidente"}
              </span>

              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-5">
                {paragraphs.map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>

              {/* Highlight block */}
              {highlights.length > 0 && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 mt-8">
                  <div className="space-y-3">
                    {highlights.map((h: string, i: number) => (
                      <p key={i} className="text-foreground font-semibold">{h}</p>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed mt-6">
                {pageData?.closing || ""}
              </p>

              {/* Signature */}
              <div className="pt-8 border-t border-border mt-8">
                <p className="text-foreground font-bold text-lg">{pageData?.name || "Paulino Jerónimo"}</p>
                <p className="text-muted-foreground text-sm">{pageData?.role || "Presidente do Conselho de Administração"}</p>
                <p className="text-muted-foreground text-sm">ANPG</p>
              </div>
            </div>
          </SectionTransition>
        </div>
      </section>
    </PageLayout>
  );
}
