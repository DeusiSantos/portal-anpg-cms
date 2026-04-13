import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Droplets,
  Users, Gauge, Layers, Target, Loader2,
  Calendar, Landmark, Cylinder, Activity, Ship, FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { usePetroleumBlockById, statusColors } from "@/hooks/usePetroleumBlocks";
import { useBlockProduction } from "@/hooks/useBlockProduction";
import { useMemo } from "react";

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="p-6 rounded-xl bg-secondary/50 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-primary" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function BlockDetailsPage() {
  const { blockId } = useParams<{ blockId: string }>();
  const { t } = useTranslation();
  const { data: block, isLoading } = usePetroleumBlockById(blockId);
  const { data: production } = useBlockProduction(blockId);

  const annualProduction = useMemo(() => {
    if (!production?.length) return [];
    const byYear = new Map<number, { oil: number[]; gas: number[] }>();
    production.forEach((p) => {
      if (!byYear.has(p.year)) byYear.set(p.year, { oil: [], gas: [] });
      const entry = byYear.get(p.year)!;
      if (p.oil_bpd != null) entry.oil.push(p.oil_bpd);
      if (p.gas_mmscfd != null) entry.gas.push(p.gas_mmscfd);
    });
    return Array.from(byYear.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, v]) => ({
        year,
        oil_bpd: v.oil.length ? Math.round(v.oil.reduce((s, x) => s + x, 0) / v.oil.length) : 0,
        gas_mmscfd: v.gas.length ? Math.round(v.gas.reduce((s, x) => s + x, 0) / v.gas.length * 10) / 10 : 0,
      }));
  }, [production]);

  if (isLoading) {
    return (
      <PageLayout titleKey="pages.blockDetails.title" subtitleKey="pages.blockDetails.subtitle" descriptionKey="pages.blockDetails.description" icon={<MapPin className="w-8 h-8 text-primary" />} breadcrumbs={[{ labelKey: "nav.epData", href: "/ep-data" }, { labelKey: "nav.submenu.epMaps", href: "/ep-data/maps" }]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!block) {
    return (
      <PageLayout titleKey="pages.blockDetails.notFound" subtitleKey="pages.blockDetails.subtitle" descriptionKey="pages.blockDetails.notFoundDesc" icon={<MapPin className="w-8 h-8 text-primary" />} breadcrumbs={[{ labelKey: "nav.epData", href: "/ep-data" }, { labelKey: "nav.submenu.epMaps", href: "/ep-data/maps" }]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">O bloco solicitado não foi encontrado.</p>
          <Link to="/ep-data/maps"><Button variant="default"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao Mapa</Button></Link>
        </div>
      </PageLayout>
    );
  }

  const hasGeology = block.geological_formation || block.reservoir_type || block.discovery_year || block.estimated_reserves_mmboe || block.geological_notes;
  const hasLicense = block.license_start || block.license_end || block.total_wells || block.active_wells || block.fpso_name;

  return (
    <PageLayout
      pageKey="block-details"
      title={block.name}
      subtitle={`Bacia: ${block.basin}`}
      description={`Informações detalhadas sobre o ${block.name}, operado por ${block.operator}.`}
      icon={<MapPin className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.epMaps", href: "/ep-data/maps" },
        { label: block.name },
      ]}
      heroChildren={
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Badge variant="outline" className={`text-sm px-4 py-2 ${statusColors[block.statusKey] || ""}`}>{block.status}</Badge>
          <Badge variant="outline" className="text-sm px-4 py-2 bg-secondary/50 border-border">{block.type}</Badge>
        </div>
      }
    >
      {/* Back Link */}
      <div className="mb-8">
        <Link to="/ep-data/maps" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />Voltar ao Mapa de Concessões
        </Link>
      </div>

      {/* Overview Cards */}
      <SectionTransition>
        <section className="mb-16">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-primary" /></div>
                  <span className="text-sm text-muted-foreground">Operador</span>
                </div>
                <p className="text-xl font-bold text-foreground">{block.operator}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
                  <span className="text-sm text-muted-foreground">Parceiros</span>
                </div>
                <p className="text-xl font-bold text-foreground">{block.partners.length}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Layers className="w-5 h-5 text-primary" /></div>
                  <span className="text-sm text-muted-foreground">Bacia</span>
                </div>
                <p className="text-xl font-bold text-foreground">{block.basin}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Droplets className="w-5 h-5 text-primary" /></div>
                  <span className="text-sm text-muted-foreground">Tipo</span>
                </div>
                <p className="text-xl font-bold text-foreground">{block.type}</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* Technical Specs */}
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Gauge className="w-6 h-6 text-primary" /></div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Especificações Técnicas</h2>
              <p className="text-muted-foreground text-sm">Características geológicas e operacionais</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {block.area_km2 && <InfoCard icon={Layers} label="Área do Bloco" value={`${block.area_km2.toLocaleString()} km²`} />}
            {block.water_depth_m != null && block.water_depth_m > 0 && <InfoCard icon={Droplets} label="Lâmina de Água" value={`${block.water_depth_m.toLocaleString()}m`} />}
            <InfoCard icon={Target} label="Oferta" value={block.offer_type === "permanent_offer" ? "Oferta Permanente" : "Licitação"} />
            {block.discovery_year && <InfoCard icon={Calendar} label="Ano de Descoberta" value={block.discovery_year} />}
            {block.estimated_reserves_mmboe && <InfoCard icon={Cylinder} label="Reservas Estimadas" value={`${block.estimated_reserves_mmboe.toLocaleString()} MMboe`} />}
            {block.total_wells != null && block.total_wells > 0 && <InfoCard icon={Activity} label="Poços (Total / Activos)" value={`${block.total_wells} / ${block.active_wells || 0}`} />}
            {block.fpso_name && <InfoCard icon={Ship} label="FPSO" value={block.fpso_name} />}
          </div>
        </section>
      </SectionTransition>

      {/* Geological Information */}
      {hasGeology && (
        <SectionTransition delay={0.12}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Landmark className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Informação Geológica</h2>
                <p className="text-muted-foreground text-sm">Formação, reservatório e reservas</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {block.geological_formation && (
                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-sm text-muted-foreground">Formação Geológica</span>
                  <p className="text-lg font-semibold text-foreground mt-1">{block.geological_formation}</p>
                </div>
              )}
              {block.reservoir_type && (
                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-sm text-muted-foreground">Tipo de Reservatório</span>
                  <p className="text-lg font-semibold text-foreground mt-1">{block.reservoir_type}</p>
                </div>
              )}
            </div>
            {block.geological_notes && (
              <div className="mt-4 p-6 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Notas Geológicas</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{block.geological_notes}</p>
              </div>
            )}
          </section>
        </SectionTransition>
      )}

      {/* License Information */}
      {hasLicense && (
        <SectionTransition delay={0.14}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Licença e Operação</h2>
                <p className="text-muted-foreground text-sm">Período de concessão e infraestrutura</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {block.license_start && <InfoCard icon={Calendar} label="Início da Licença" value={new Date(block.license_start).toLocaleDateString('pt-AO')} />}
              {block.license_end && <InfoCard icon={Calendar} label="Fim da Licença" value={new Date(block.license_end).toLocaleDateString('pt-AO')} />}
              {block.total_wells != null && block.total_wells > 0 && <InfoCard icon={Activity} label="Total de Poços" value={block.total_wells} />}
              {block.active_wells != null && block.active_wells > 0 && <InfoCard icon={Activity} label="Poços Activos" value={block.active_wells} />}
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Production History */}
      {annualProduction.length > 0 && (
        <SectionTransition delay={0.16}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Activity className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Histórico de Produção</h2>
                <p className="text-muted-foreground text-sm">Produção média anual de petróleo e gás</p>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Oil Production Chart */}
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Petróleo (BPD)</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={annualProduction} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => [`${v.toLocaleString()} BPD`, "Petróleo"]} />
                      <Line type="monotone" dataKey="oil_bpd" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Gas Production Chart */}
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Gás (MMSCF/D)</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={annualProduction} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => [`${v} MMSCF/D`, "Gás"]} />
                      <Line type="monotone" dataKey="gas_mmscfd" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ fill: "hsl(var(--accent-foreground))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Partners & Participation */}
      {block.partners.length > 0 && (
        <SectionTransition delay={0.18}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Consórcio</h2>
                <p className="text-muted-foreground text-sm">Participações no bloco</p>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {block.partners.map((partner, index) => (
                  <div key={partner.name} className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{index + 1}</div>
                        <div>
                          <h3 className="font-semibold text-foreground">{partner.name}</h3>
                          {index === 0 && <span className="text-xs text-primary">Operador</span>}
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-primary">{partner.share}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500" style={{ width: `${partner.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <h3 className="font-semibold text-foreground mb-6">Distribuição de Participações</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={block.partners} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={75} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [`${value}%`, "Participação"]} />
                      <Bar dataKey="share" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Description */}
      {block.description && (
        <SectionTransition delay={0.2}>
          <section className="mb-16">
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground">{block.description}</p>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Back button */}
      <SectionTransition delay={0.25}>
        <div className="flex justify-center">
          <Link to="/ep-data/maps">
            <Button variant="outline" size="lg"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao Mapa de Concessões</Button>
          </Link>
        </div>
      </SectionTransition>
    </PageLayout>
  );
}
