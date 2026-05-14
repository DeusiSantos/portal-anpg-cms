import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Layers, Info, Building2, Droplets, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/service/api";

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

interface OilBlocksResponse {
  items: OilBlock[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FormattedPetroleumBlock {
  id: string;
  name: string;
  basinKey: string;
  basinName: string;
  typeKey: "offshore" | "onshore";
  type: string;
  statusKey: string;
  status: string;
  operator: string;
  area_km2: number;
  waterDepth: number;
  description: string;
  discoveryYear: number;
  estimatedReservesMMboe: number;
  geologicalFormation: string;
  reservoirType: string;
  licenseStart: string;
  licenseEnd: string;
  totalWells: number;
  activeWells: number;
  fpsoName: string;
  geologicalNotes: string;
}

// Mapeamentos
const basinLabels: Record<string, string> = {
  "Baixo Congo": "Baixo Congo",
  "Kwanza": "Kwanza",
  "Benguela": "Benguela",
  "Namibe": "Namibe",
  "Congo": "Congo",
  "Cabinda": "Cabinda",
};

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
const getBlockType = (waterDepthMeters: number): { key: "offshore" | "onshore"; label: string } => {
  if (waterDepthMeters > 0) {
    if (waterDepthMeters < 500) return { key: "offshore", label: "Offshore - Águas Rasas" };
    if (waterDepthMeters < 1500) return { key: "offshore", label: "Offshore - Águas Profundas" };
    return { key: "offshore", label: "Offshore - Águas Ultra-Profundas" };
  }
  return { key: "onshore", label: "Onshore" };
};

// Função para buscar blocos
function usePetroleumBlocks() {
  return useQuery({
    queryKey: ["petroleum-blocks-map"],
    queryFn: async () => {
      const response = await api.get<OilBlocksResponse>('/operations/oil-blocks', {
        params: { Page: 1, PageSize: 100 }
      });
      
      const blocks: OilBlock[] = response.data.items;
      
      // Filtrar apenas blocos ativos
      const activeBlocks = blocks.filter(block => block.isActive === true);
      
      // Formatar blocos para o formato esperado
      const formattedBlocks: FormattedPetroleumBlock[] = activeBlocks.map(block => {
        const type = getBlockType(block.waterDepthMeters);
        
        return {
          id: block.id,
          name: block.name,
          basinKey: block.basinName,
          basinName: block.basinName,
          typeKey: type.key,
          type: type.label,
          statusKey: block.oilBlockStateName,
          status: block.oilBlockStateName,
          operator: block.operatorName || "",
          area_km2: block.areaKm2,
          waterDepth: block.waterDepthMeters,
          description: block.description || "",
          discoveryYear: block.discoveryYear,
          estimatedReservesMMboe: block.estimatedReservesMMboe,
          geologicalFormation: block.geologicalFormationName || "",
          reservoirType: block.reservoirTypeName || "",
          licenseStart: block.licenseStartDate,
          licenseEnd: block.licenseEndDate,
          totalWells: block.totalWells,
          activeWells: block.activeWells,
          fpsoName: block.fpsoName || "",
          geologicalNotes: block.geologicalNotes || "",
        };
      });
      
      return formattedBlocks;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function BlocksMap() {
  const { data: allBlocks = [], isLoading } = usePetroleumBlocks();
  const [hoveredBlock, setHoveredBlock] = useState<FormattedPetroleumBlock | null>(null);
  const [selectedBasin, setSelectedBasin] = useState<string>("all");

  // Filter to tender blocks only (available for tender)
  const tenderBlocks = useMemo(() => 
    allBlocks.filter(b => b.statusKey === "Disponível"),
    [allBlocks]
  );

  // Get unique basins from tender blocks
  const availableBasins = useMemo(() => {
    const basins = [...new Set(tenderBlocks.map(b => b.basinKey))];
    return basins.sort();
  }, [tenderBlocks]);

  const filteredBlocks = useMemo(() => 
    selectedBasin === "all" 
      ? tenderBlocks 
      : tenderBlocks.filter(b => b.basinKey === selectedBasin),
    [tenderBlocks, selectedBasin]
  );

  // Group by basin for display
  const groupedByBasin = useMemo(() => {
    const groups: Record<string, FormattedPetroleumBlock[]> = {};
    filteredBlocks.forEach(block => {
      if (!groups[block.basinKey]) groups[block.basinKey] = [];
      groups[block.basinKey].push(block);
    });
    return groups;
  }, [filteredBlocks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">A carregar blocos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedBasin("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedBasin === "all"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          Todas as Bacias ({tenderBlocks.length})
        </button>
        {availableBasins.map((basin) => {
          const count = tenderBlocks.filter(b => b.basinKey === basin).length;
          return (
            <button
              key={basin}
              onClick={() => setSelectedBasin(basin)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedBasin === basin
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {basinLabels[basin] || basin} ({count})
            </button>
          );
        })}
      </div>

      {/* Blocks by Basin */}
      <div className="space-y-8">
        {Object.entries(groupedByBasin).map(([basinKey, blocks]) => (
          <div key={basinKey}>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-foreground">{basinLabels[basinKey] || basinKey}</h4>
              <span className="text-sm text-muted-foreground">({blocks.length} blocos)</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {blocks.map((block) => (
                <motion.div
                  key={block.id}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredBlock?.id === block.id
                      ? "bg-primary/10 border-primary/50 shadow-md"
                      : "bg-secondary/50 border-border hover:border-primary/30"
                  }`}
                  onMouseEnter={() => setHoveredBlock(block)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {block.typeKey === "onshore" ? (
                          <Building2 className="w-4 h-4 text-primary" />
                        ) : (
                          <Droplets className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className="font-semibold text-foreground text-sm">{block.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[block.statusKey] || "bg-secondary text-foreground border-border"}`}>
                      {statusLabels[block.statusKey] || block.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Tipo</span>
                      <span className="text-foreground">{block.type}</span>
                    </div>
                    {block.operator && (
                      <div className="flex justify-between">
                        <span>Operador</span>
                        <span className="text-foreground">{block.operator}</span>
                      </div>
                    )}
                    {block.area_km2 && (
                      <div className="flex justify-between">
                        <span>Área</span>
                        <span className="text-foreground">{block.area_km2.toLocaleString()} km²</span>
                      </div>
                    )}
                    {block.waterDepth > 0 && (
                      <div className="flex justify-between">
                        <span>Prof. Água</span>
                        <span className="text-foreground">{block.waterDepth.toLocaleString()} m</span>
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/ep-data/blocks/${block.id}`}
                    className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver detalhes <ExternalLink className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum bloco disponível para licitação no momento.
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Os blocos apresentados são os disponíveis para licitação. Clique em "Ver detalhes" para informações completas sobre cada bloco.
        </p>
      </div>
    </div>
  );
}