import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Droplets,
  Users, Gauge, Layers, Target, Loader2,
  Calendar, Landmark, Cylinder, Activity, Ship, FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "@/service/api";
import { useBlockProduction } from "@/hooks/useBlockProduction";

// Tipos da API
interface Basin {
  id: string;
  name: string;
  isActive: boolean;
}

interface OilBlockState {
  id: string;
  name: string;
  isActive: boolean;
}

interface Operator {
  id: string;
  name: string;
  isActive: boolean;
}

interface GeologicalFormation {
  id: string;
  name: string;
  isActive: boolean;
}

interface ReservoirType {
  id: string;
  name: string;
  isActive: boolean;
}

interface OilBlock {
  id: string;
  name: string;
  basinId: string;
  basinName: string;
  oilBlockStateId: string;
  oilBlockStateName: string;
  operatorId: string;
  operatorName: string;
  areaKm2: number;
  waterDepthMeters: number;
  description: string;
  discoveryYear: number;
  estimatedReservesMMboe: number;
  geologicalFormationId: string;
  geologicalFormationName: string;
  reservoirTypeId: string;
  reservoirTypeName: string;
  licenseStartDate: string;
  licenseEndDate: string;
  totalWells: number;
  activeWells: number;
  fpsoName: string;
  geologicalNotes: string;
  isActive: boolean;
  createdAt: string;
}

// Mapeamentos
const statusColors: Record<string, string> = {
  "Disponível": "bg-status-success/20 text-status-success border-status-success/30",
  "Licenciado": "bg-status-info/20 text-status-info border-status-info/30",
  "Exploração": "bg-status-warning/20 text-status-warning border-status-warning/30",
  "Produção": "bg-primary/20 text-primary border-primary/30",
  "Devolvido": "bg-status-neutral/20 text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  "Disponível": "Disponível",
  "Licenciado": "Licenciado",
  "Exploração": "Exploração",
  "Produção": "Produção",
  "Devolvido": "Devolvido",
};

// Função para determinar tipo baseado na profundidade da água
const getBlockType = (waterDepthMeters: number): string => {
  if (waterDepthMeters > 0) {
    if (waterDepthMeters < 500) return "Offshore - Águas Rasas";
    if (waterDepthMeters < 1500) return "Offshore - Águas Profundas";
    return "Offshore - Águas Ultra-Profundas";
  }
  return "Onshore";
};

// Função para obter oferta
const getOfferType = (stateName: string): string => {
  if (stateName === "Disponível") return "Oferta Permanente";
  return "Licitação";
};

// Hook para buscar bloco por ID
function usePetroleumBlockById(blockId: string | undefined) {
  return useQuery({
    queryKey: ["oil-block", blockId],
    queryFn: async () => {
      if (!blockId) throw new Error("Block ID is required");
      const response = await api.get<OilBlock>(`/operations/oil-blocks/${blockId}`);
      return response.data;
    },
    enabled: !!blockId,
    staleTime: 5 * 60 * 1000,
  });
}

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

  const annualProduction = production || [];

  if (isLoading) {
    return (
      <PageLayout 
        titleKey="pages.blockDetails.title" 
        subtitleKey="pages.blockDetails.subtitle" 
        descriptionKey="pages.blockDetails.description" 
        icon={<MapPin className="w-8 h-8 text-primary" />} 
        breadcrumbs={[
          { labelKey: "nav.epData", href: "/ep-data" }, 
          { labelKey: "nav.submenu.epMaps", href: "/ep-data/maps" }
        ]}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!block) {
    return (
      <PageLayout 
        titleKey="pages.blockDetails.notFound" 
        subtitleKey="pages.blockDetails.subtitle" 
        descriptionKey="pages.blockDetails.notFoundDesc" 
        icon={<MapPin className="w-8 h-8 text-primary" />} 
        breadcrumbs={[
          { labelKey: "nav.epData", href: "/ep-data" }, 
          { labelKey: "nav.submenu.epMaps", href: "/ep-data/maps" }
        ]}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">O bloco solicitado não foi encontrado.</p>
          <Link to="/ep-data/maps">
            <Button variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Mapa
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const blockType = getBlockType(block.waterDepthMeters);
  const hasGeology = block.geologicalFormationName || block.reservoirTypeName || block.discoveryYear || block.estimatedReservesMMboe || block.geologicalNotes;
  const hasLicense = block.licenseStartDate || block.licenseEndDate || block.totalWells || block.activeWells || block.fpsoName;

  return (
    <PageLayout
      pageKey="block-details"
      title={block.name}
      subtitle={`Bacia: ${block.basinName}`}
      description={`Informações detalhadas sobre o ${block.name}, operado por ${block.operatorName}.`}
      icon={<MapPin className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.epData", href: "/ep-data" },
        { labelKey: "nav.submenu.epMaps", href: "/ep-data/maps" },
        { label: block.name },
      ]}
      heroChildren={
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Badge variant="outline" className={`text-sm px-4 py-2 ${statusColors[block.oilBlockStateName] || ""}`}>
            {statusLabels[block.oilBlockStateName] || block.oilBlockStateName}
          </Badge>
          <Badge variant="outline" className="text-sm px-4 py-2 bg-secondary/50 border-border">
            {blockType}
          </Badge>
          <Badge variant="outline" className="text-sm px-4 py-2 bg-secondary/50 border-border">
            {getOfferType(block.oilBlockStateName)}
          </Badge>
        </div>
      }
    >
      {/* Back Link */}
      <div className="mb-8">
        <Link to="/ep-data/maps" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Mapa de Concessões
        </Link>
      </div>

      {/* Overview Cards */}
      <SectionTransition>
        <section className="mb-16">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Operador</span>
                </div>
                <p className="text-xl font-bold text-foreground">{block.operatorName}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Bacia</span>
                </div>
                <p className="text-xl font-bold text-foreground">{block.basinName}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Tipo</span>
                </div>
                <p className="text-xl font-bold text-foreground">{blockType}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Oferta</span>
                </div>
                <p className="text-xl font-bold text-foreground">{getOfferType(block.oilBlockStateName)}</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>
      </SectionTransition>

      {/* Technical Specs */}
      <SectionTransition delay={0.1}>
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Especificações Técnicas</h2>
              <p className="text-muted-foreground text-sm">Características geológicas e operacionais</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {block.areaKm2 > 0 && (
              <InfoCard icon={Layers} label="Área do Bloco" value={`${block.areaKm2.toLocaleString()} km²`} />
            )}
            {block.waterDepthMeters > 0 && (
              <InfoCard icon={Droplets} label="Lâmina de Água" value={`${block.waterDepthMeters.toLocaleString()} m`} />
            )}
            {block.discoveryYear > 0 && (
              <InfoCard icon={Calendar} label="Ano de Descoberta" value={block.discoveryYear} />
            )}
            {block.estimatedReservesMMboe > 0 && (
              <InfoCard icon={Cylinder} label="Reservas Estimadas" value={`${block.estimatedReservesMMboe.toLocaleString()} MMboe`} />
            )}
            {block.totalWells > 0 && (
              <InfoCard icon={Activity} label="Poços (Total / Activos)" value={`${block.totalWells} / ${block.activeWells || 0}`} />
            )}
            {block.fpsoName && block.fpsoName !== "12" && (
              <InfoCard icon={Ship} label="FPSO" value={block.fpsoName} />
            )}
          </div>
        </section>
      </SectionTransition>

      {/* Geological Information */}
      {hasGeology && (
        <SectionTransition delay={0.12}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Informação Geológica</h2>
                <p className="text-muted-foreground text-sm">Formação, reservatório e reservas</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {block.geologicalFormationName && (
                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-sm text-muted-foreground">Formação Geológica</span>
                  <p className="text-lg font-semibold text-foreground mt-1">{block.geologicalFormationName}</p>
                </div>
              )}
              {block.reservoirTypeName && (
                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-sm text-muted-foreground">Tipo de Reservatório</span>
                  <p className="text-lg font-semibold text-foreground mt-1">{block.reservoirTypeName}</p>
                </div>
              )}
            </div>
            {block.geologicalNotes && (
              <div className="mt-4 p-6 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Notas Geológicas</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{block.geologicalNotes}</p>
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
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Licença e Operação</h2>
                <p className="text-muted-foreground text-sm">Período de concessão e infraestrutura</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {block.licenseStartDate && (
                <InfoCard 
                  icon={Calendar} 
                  label="Início da Licença" 
                  value={new Date(block.licenseStartDate).toLocaleDateString('pt-PT')} 
                />
              )}
              {block.licenseEndDate && (
                <InfoCard 
                  icon={Calendar} 
                  label="Fim da Licença" 
                  value={new Date(block.licenseEndDate).toLocaleDateString('pt-PT')} 
                />
              )}
              {block.totalWells > 0 && (
                <InfoCard icon={Activity} label="Total de Poços" value={block.totalWells} />
              )}
              {block.activeWells > 0 && (
                <InfoCard icon={Activity} label="Poços Activos" value={block.activeWells} />
              )}
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Production History - Placeholder */}
      {annualProduction.length > 0 && (
        <SectionTransition delay={0.16}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Histórico de Produção</h2>
                <p className="text-muted-foreground text-sm">Produção média anual de petróleo e gás</p>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Petróleo (BPD)</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={annualProduction} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="oil_bpd" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Gás (MMSCF/D)</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={annualProduction} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="gas_mmscfd" stroke="hsl(var(--accent-foreground))" strokeWidth={2} />
                    </LineChart>
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
              <p className="text-sm text-muted-foreground whitespace-pre-line">{block.description}</p>
            </div>
          </section>
        </SectionTransition>
      )}

      {/* Back button */}
      <SectionTransition delay={0.25}>
        <div className="flex justify-center">
          <Link to="/ep-data/maps">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Mapa de Concessões
            </Button>
          </Link>
        </div>
      </SectionTransition>
    </PageLayout>
  );
}