import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Droplets, Filter, Search, ChevronDown, Info, ExternalLink, Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  usePetroleumBlocks, 
  PetroleumBlock, 
  basinLabels, 
  typeLabels, 
  statusLabels, 
  statusColors 
} from "@/hooks/usePetroleumBlocks";

interface ConcessionsMapProps {
  onBlockSelect?: (block: PetroleumBlock | null) => void;
}

export function ConcessionsMap({ onBlockSelect }: ConcessionsMapProps) {
  const BLOCKS_PER_PAGE = 12;
  const { data: blocks = [], isLoading } = usePetroleumBlocks();
  const [selectedBasin, setSelectedBasin] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<PetroleumBlock | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Derive available filter options from data
  const availableBasins = useMemo(() => {
    const basins = [...new Set(blocks.map(b => b.basinKey))];
    return basins.sort();
  }, [blocks]);

  const availableTypes = useMemo(() => {
    const types = [...new Set(blocks.map(b => b.typeKey))];
    return types.sort();
  }, [blocks]);

  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(blocks.map(b => b.statusKey))];
    return statuses.sort();
  }, [blocks]);

  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const matchesBasin = selectedBasin === "all" || block.basinKey === selectedBasin;
      const matchesType = selectedType === "all" || block.typeKey === selectedType;
      const matchesStatus = selectedStatus === "all" || block.statusKey === selectedStatus;
      const matchesSearch = 
        block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.partners.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesBasin && matchesType && matchesStatus && matchesSearch;
    });
  }, [blocks, selectedBasin, selectedType, selectedStatus, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBasin, selectedType, selectedStatus, searchQuery]);

  const totalPages = Math.ceil(filteredBlocks.length / BLOCKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BLOCKS_PER_PAGE;
  const paginatedBlocks = filteredBlocks.slice(startIndex, startIndex + BLOCKS_PER_PAGE);

  const stats = useMemo(() => {
    const production = blocks.filter(b => b.statusKey === "production").length;
    const exploration = blocks.filter(b => b.statusKey === "exploration").length;
    const available = blocks.filter(b => b.statusKey === "available").length;
    const operators = [...new Set(blocks.map(b => b.operator))].length;
    
    return { production, exploration, available, operators };
  }, [blocks]);

  const handleBlockClick = (block: PetroleumBlock) => {
    setSelectedBlock(block);
    onBlockSelect?.(block);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">A carregar blocos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/20">
          <p className="text-2xl font-bold text-status-success-foreground">{stats.production}</p>
          <p className="text-sm text-muted-foreground">Em Produção</p>
        </div>
        <div className="p-4 rounded-xl bg-status-info/10 border border-status-info/20">
          <p className="text-2xl font-bold text-status-info-foreground">{stats.exploration}</p>
          <p className="text-sm text-muted-foreground">Em Exploração</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-2xl font-bold text-primary">{stats.available}</p>
          <p className="text-sm text-muted-foreground">Disponíveis</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary border border-border">
          <p className="text-2xl font-bold text-foreground">{stats.operators}</p>
          <p className="text-sm text-muted-foreground">Operadores</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar blocos, operadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                {/* Basin Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Bacia</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton active={selectedBasin === "all"} onClick={() => setSelectedBasin("all")}>
                      Todas
                    </FilterButton>
                    {availableBasins.map((key) => (
                      <FilterButton
                        key={key}
                        active={selectedBasin === key}
                        onClick={() => setSelectedBasin(key)}
                      >
                        {basinLabels[key] || key}
                      </FilterButton>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Tipo</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton active={selectedType === "all"} onClick={() => setSelectedType("all")}>
                      Todos
                    </FilterButton>
                    {availableTypes.map((key) => (
                      <FilterButton
                        key={key}
                        active={selectedType === key}
                        onClick={() => setSelectedType(key)}
                      >
                        {typeLabels[key] || key}
                      </FilterButton>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Estado</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton active={selectedStatus === "all"} onClick={() => setSelectedStatus("all")}>
                      Todos
                    </FilterButton>
                    {availableStatuses.map((key) => (
                      <FilterButton
                        key={key}
                        active={selectedStatus === key}
                        onClick={() => setSelectedStatus(key)}
                      >
                        {statusLabels[key] || key}
                      </FilterButton>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        A mostrar <strong className="text-foreground">{Math.min(startIndex + 1, filteredBlocks.length)}-{Math.min(startIndex + BLOCKS_PER_PAGE, filteredBlocks.length)}</strong> de {filteredBlocks.length} blocos
      </p>

      {/* Blocks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedBlocks.map((block) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
              selectedBlock?.id === block.id
                ? "bg-primary/10 border-primary shadow-lg"
                : "bg-secondary/50 border-border hover:border-primary/30 hover:shadow-md"
            }`}
            onClick={() => handleBlockClick(block)}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {block.typeKey === "onshore" ? (
                    <MapPin className="w-5 h-5 text-primary" />
                  ) : (
                    <Droplets className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{block.name}</h3>
                  <p className="text-xs text-muted-foreground">{block.basin}</p>
                </div>
              </div>
              <Badge variant="outline" className={statusColors[block.statusKey] || "bg-secondary text-foreground border-border"}>
                {block.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operador</span>
                <span className="font-medium text-foreground">{block.operator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="text-foreground">{block.type}</span>
              </div>
              {block.area_km2 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área</span>
                  <span className="text-foreground">{block.area_km2.toLocaleString()} km²</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parceiros</span>
                <span className="text-foreground">{block.partners.length}</span>
              </div>
            </div>

            {/* Mini partners list */}
            {block.partners.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex flex-wrap gap-1">
                  {block.partners.slice(0, 3).map((partner) => (
                    <span
                      key={partner.name}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                    >
                      {partner.name} ({partner.share}%)
                    </span>
                  ))}
                  {block.partners.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      +{block.partners.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {filteredBlocks.length === 0 && (
        <div className="text-center py-12">
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum bloco encontrado com os filtros seleccionados.</p>
        </div>
      )}

      {/* Selected Block Details Dialog */}
      <Dialog open={!!selectedBlock} onOpenChange={(open) => { if (!open) setSelectedBlock(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedBlock && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-foreground">{selectedBlock.name}</DialogTitle>
                      <p className="text-sm text-muted-foreground">{selectedBlock.basin}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusColors[selectedBlock.statusKey] || ""}>
                    {selectedBlock.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Operador</p>
                    <p className="font-semibold text-foreground">{selectedBlock.operator}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-semibold text-foreground">{selectedBlock.type}</p>
                  </div>
                </div>

                {selectedBlock.area_km2 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Área</p>
                      <p className="font-semibold text-foreground">{selectedBlock.area_km2.toLocaleString()} km²</p>
                    </div>
                    {selectedBlock.water_depth_m != null && selectedBlock.water_depth_m > 0 && (
                      <div className="p-4 rounded-xl bg-secondary/50">
                        <p className="text-sm text-muted-foreground">Lâmina de Água</p>
                        <p className="font-semibold text-foreground">{selectedBlock.water_depth_m.toLocaleString()}m</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedBlock.partners.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Participações</h3>
                    <div className="space-y-2">
                      {selectedBlock.partners.map((partner) => (
                        <div key={partner.name} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-foreground">{partner.name}</span>
                              <span className="text-sm font-medium text-primary">{partner.share}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                style={{ width: `${partner.share}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <Link
                  to={`/ep-data/blocks/${selectedBlock.id}`}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-center flex items-center justify-center gap-2"
                >
                  Ver Detalhes
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
      }`}
    >
      {children}
    </button>
  );
}
