import { Layers, Download, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { usePageData } from "@/hooks/pages/usePageData";
import { seismic2dSurveys, seismic3dSurveys, seismic4dSurveys } from "@/data/seismic";

const pdfDownloads = [
  { label: "Sísmica 2D Proprietária", href: "/documents/seismic/sismica-2d-proprietaria.pdf" },
  { label: "Sísmica 2D Multicliente", href: "/documents/seismic/sismica-2d-multicliente.pdf" },
  { label: "Sísmica 3D/4D Proprietária", href: "/documents/seismic/sismica-3d-4d-proprietaria.pdf" },
];

export default function SeismicCampaignsPage() {
  const { data: pageData } = usePageData("exploration");

  const stats = useMemo(() => {
    const all2d = seismic2dSurveys;
    const all3d = seismic3dSurveys;
    const all4d = seismic4dSurveys;
    const allSurveys = [...all2d, ...all3d, ...all4d];
    const basins = [...new Set(allSurveys.map(s => s.basin))];
    const operators = [...new Set(allSurveys.map(s => s.operator))];
    const total2dKm = all2d.reduce((s, v) => s + v.coverage, 0);
    const total3dKm2 = all3d.reduce((s, v) => s + v.coverage, 0);
    const total4dKm2 = all4d.reduce((s, v) => s + v.coverage, 0);
    const yearMin = Math.min(...allSurveys.map(s => s.year));
    const yearMax = Math.max(...allSurveys.map(s => s.year));

    return { count2d: all2d.length, count3d: all3d.length, count4d: all4d.length, total: allSurveys.length, basins: basins.length, operators: operators.length, total2dKm, total3dKm2, total4dKm2, yearMin, yearMax };
  }, []);

  const recentSurveys = useMemo(() => {
    const all = [...seismic2dSurveys, ...seismic3dSurveys, ...seismic4dSurveys];
    return all.filter(s => s.year >= 2019).sort((a, b) => b.year - a.year);
  }, []);

  return (
    <PageLayout
      pageKey="exploration-seismic-campaigns"
      title={pageData?.seismicCampaigns}
      subtitle={pageData?.seismicCampaignsSubtitle}
      icon={<Layers className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.exploration", href: "/exploration" },
        { label: pageData?.seismicCampaigns || "Campanhas Sísmicas" },
      ]}
    >
      <div className="space-y-12">
        <p className="text-muted-foreground text-lg leading-relaxed">
          {pageData?.seismicCampaignsContent || "A ANPG coordena e supervisiona as campanhas de aquisição de dados sísmicos em Angola, garantindo a qualidade e a integridade dos dados recolhidos."}
        </p>

        {/* Stats */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Estatísticas de Campanhas</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: stats.total, label: "Total de Levantamentos" },
              { value: stats.count2d, label: "Levantamentos 2D" },
              { value: stats.count3d, label: "Levantamentos 3D" },
              { value: stats.count4d, label: "Levantamentos 4D" },
              { value: `${stats.total2dKm.toLocaleString()} km`, label: "Cobertura 2D" },
              { value: `${stats.total3dKm2.toLocaleString()} km²`, label: "Cobertura 3D" },
              { value: `${stats.total4dKm2.toLocaleString()} km²`, label: "Cobertura 4D" },
              { value: `${stats.yearMin}–${stats.yearMax}`, label: "Período" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
                <p className="text-2xl font-bold text-primary">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Surveys */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Campanhas Recentes (2019–2025)</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/70">
                <tr>
                  <th className="text-left p-3 font-semibold text-foreground">Levantamento</th>
                  <th className="text-left p-3 font-semibold text-foreground">Ano</th>
                  <th className="text-left p-3 font-semibold text-foreground">Tipo</th>
                  <th className="text-left p-3 font-semibold text-foreground">Bacia</th>
                  <th className="text-left p-3 font-semibold text-foreground">Operador</th>
                  <th className="text-right p-3 font-semibold text-foreground">Cobertura</th>
                </tr>
              </thead>
              <tbody>
                {recentSurveys.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-background" : "bg-secondary/30"}>
                    <td className="p-3 text-foreground font-medium">{s.name}</td>
                    <td className="p-3 text-muted-foreground">{s.year}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary uppercase">
                        {s.type}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{s.basin}</td>
                    <td className="p-3 text-muted-foreground">{s.operator}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      {s.coverage.toLocaleString()} {s.coverageUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PDF Downloads */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Descarregar Mapas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pdfDownloads.map((pdf) => (
              <a
                key={pdf.href}
                href={pdf.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors"
              >
                <Download className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground font-medium text-sm">{pdf.label}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
