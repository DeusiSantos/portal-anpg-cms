import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Layers, Info, Building2, Droplets, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  usePetroleumBlocks, 
  PetroleumBlock, 
  basinLabels, 
  statusColors, 
  statusLabels 
} from "@/hooks/usePetroleumBlocks";

export function BlocksMap() {
  const { data: allBlocks = [], isLoading } = usePetroleumBlocks();
  const [hoveredBlock, setHoveredBlock] = useState<PetroleumBlock | null>(null);
  const [selectedBasin, setSelectedBasin] = useState<string>("all");

  // Filter to tender blocks only
  const tenderBlocks = useMemo(() => 
    allBlocks.filter(b => b.offer_type === "tender"),
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
    const groups: Record<string, PetroleumBlock[]> = {};
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
        {availableBasins.map((key) => {
          const count = tenderBlocks.filter(b => b.basinKey === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedBasin(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedBasin === key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {basinLabels[key] || key} ({count})
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
                          <MapPin className="w-4 h-4 text-primary" />
                        ) : (
                          <Droplets className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className="font-semibold text-foreground text-sm">{block.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[block.statusKey] || "bg-secondary text-foreground border-border"}`}>
                      {block.status}
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
          Nenhum bloco encontrado.
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Os blocos apresentados são os disponíveis no âmbito da Licitação 2025. Clique em "Ver detalhes" para informações completas sobre cada bloco.
        </p>
      </div>
    </div>
  );
}
