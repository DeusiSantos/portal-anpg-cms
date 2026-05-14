import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ShieldCheck, Lock, Mail, Loader2 } from "lucide-react";
import { usePageData } from "@/hooks/pages/usePageData";

const featureIcons = [ShieldCheck, Lock, Mail];

export default function WhistleblowerPage() {
  const { data: pageData, isLoading } = usePageData("whistleblower");

  const features: Array<{ key: string; title: string; desc: string }> = pageData?.features || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageLayout
      pageKey="whistleblower"
      title={pageData?.title || "Canal de Denúncias"}
      subtitle={pageData?.subtitle || "Transparência e Integridade"}
      description={pageData?.description || ""}
      breadcrumbs={[
        { label: pageData?.title || "Canal de Denúncias" },
      ]}
    >
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <SectionTransition>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {features.map((item, i) => {
                const Icon = featureIcons[i % featureIcons.length];
                return (
                  <div key={item.key || i} className="bg-card border border-border rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </SectionTransition>

          <SectionTransition delay={0.2}>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-5">
              <p>{pageData?.p1 || ""}</p>
              <p>{pageData?.p2 || ""}</p>
              <p>{pageData?.p3 || ""}</p>
            </div>
          </SectionTransition>

          <SectionTransition delay={0.3}>
            <div className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-10">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {pageData?.howToTitle || "Como Submeter uma Denúncia"}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Email:</strong> {pageData?.email || ""}</p>
                <p><strong className="text-foreground">{pageData?.phonelabel || "Telefone"}:</strong> {pageData?.phone || ""}</p>
                <p className="text-sm italic">{pageData?.disclaimer || ""}</p>
              </div>
            </div>
          </SectionTransition>
        </div>
      </section>
    </PageLayout>
  );
}
