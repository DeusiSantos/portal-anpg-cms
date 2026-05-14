import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Layers, 
  ArrowRight, 
  Filter,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StaggerContainer } from "@/components/layout/StaggerContainer";

interface OpportunityBlock {
  id: string;
  name: string;
  basin: string;
  type: "shallow" | "deep" | "ultra-deep" | "onshore";
  area: string;
  depth: string;
  status: "available" | "under-evaluation" | "tender-2025";
  tender?: string;
}

const availableBlocks: OpportunityBlock[] = [
  // Tender 2025 Blocks - Kwanza Basin
  { id: "KON-1", name: "Bloco KON-1", basin: "kwanza", type: "deep", area: "2,150 km²", depth: "500-2,000m", status: "tender-2025", tender: "Licitação 2025" },
  { id: "KON-2", name: "Bloco KON-2", basin: "kwanza", type: "deep", area: "1,920 km²", depth: "800-2,500m", status: "tender-2025", tender: "Licitação 2025" },
  { id: "KON-3", name: "Bloco KON-3", basin: "kwanza", type: "ultra-deep", area: "2,340 km²", depth: "1,200-3,000m", status: "tender-2025", tender: "Licitação 2025" },
  
  // Tender 2025 Blocks - Benguela Basin
  { id: "BEN-1", name: "Bloco BEN-1", basin: "benguela", type: "deep", area: "3,200 km²", depth: "400-1,200m", status: "tender-2025", tender: "Licitação 2025" },
  { id: "BEN-2", name: "Bloco BEN-2", basin: "benguela", type: "deep", area: "2,850 km²", depth: "600-1,600m", status: "tender-2025", tender: "Licitação 2025" },
  { id: "BEN-4", name: "Bloco BEN-4", basin: "benguela", type: "shallow", area: "3,100 km²", depth: "500-1,400m", status: "tender-2025", tender: "Licitação 2025" },
  
  // Permanent Offer Blocks
  { id: "CON-5", name: "Bloco CON-5", basin: "congo", type: "shallow", area: "1,800 km²", depth: "200-800m", status: "available" },
  { id: "CON-7", name: "Bloco CON-7", basin: "congo", type: "deep", area: "2,400 km²", depth: "1,000-2,200m", status: "available" },
  { id: "NAM-2", name: "Bloco NAM-2", basin: "namibe", type: "deep", area: "2,100 km²", depth: "600-1,800m", status: "available" },
  
  // Under Evaluation
  { id: "BEN-3", name: "Bloco BEN-3", basin: "benguela", type: "deep", area: "2,680 km²", depth: "800-2,000m", status: "under-evaluation" },
];

const basins = [
  { key: "all", label: "Todas as Bacias" },
  { key: "kwanza", label: "Bacia do Kwanza" },
  { key: "benguela", label: "Bacia de Benguela" },
  { key: "congo", label: "Bacia do Congo" },
  { key: "namibe", label: "Bacia do Namibe" },
];

const types = [
  { key: "all", label: "Todos os Tipos" },
  { key: "shallow", label: "Águas Rasas" },
  { key: "deep", label: "Águas Profundas" },
  { key: "ultra-deep", label: "Águas Ultra-Profundas" },
  { key: "onshore", label: "Onshore" },
];

const statuses = [
  { key: "all", label: "Todos" },
  { key: "tender-2025", label: "Licitação 2025" },
  { key: "available", label: "Oferta Permanente" },
  { key: "under-evaluation", label: "Em Avaliação" },
];

export function OpportunitiesDashboard() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBasin, setSelectedBasin] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredBlocks = availableBlocks.filter(block => {
    const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          block.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBasin = selectedBasin === "all" || block.basin === selectedBasin;
    const matchesType = selectedType === "all" || block.type === selectedType;
    const matchesStatus = selectedStatus === "all" || block.status === selectedStatus;
    
    return matchesSearch && matchesBasin && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string, tender?: string) => {
    switch (status) {
      case "tender-2025":
        return <Badge variant="default" className="bg-primary">{tender}</Badge>;
      case "available":
        return <Badge variant="secondary">Oferta Permanente</Badge>;
      case "under-evaluation":
        return <Badge variant="outline">Em Avaliação</Badge>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "shallow": return "Águas Rasas";
      case "deep": return "Águas Profundas";
      case "ultra-deep": return "Ultra-Profundas";
      case "onshore": return "Onshore";
      default: return type;
    }
  };

  const getBasinLabel = (basin: string) => {
    switch (basin) {
      case "kwanza": return "Kwanza";
      case "benguela": return "Benguela";
      case "congo": return "Congo";
      case "namibe": return "Namibe";
      default: return basin;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("investorPortal.searchBlocks")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedBasin} onValueChange={setSelectedBasin}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Bacia" />
                </SelectTrigger>
                <SelectContent>
                  {basins.map(basin => (
                    <SelectItem key={basin.key} value={basin.key}>
                      {basin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{availableBlocks.filter(b => b.status === "tender-2025").length}</div>
            <div className="text-xs text-muted-foreground">Licitação 2025</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-secondary/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{availableBlocks.filter(b => b.status === "available").length}</div>
            <div className="text-xs text-muted-foreground">Oferta Permanente</div>
          </CardContent>
        </Card>
        <Card className="bg-muted border-muted-foreground/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{availableBlocks.filter(b => b.status === "under-evaluation").length}</div>
            <div className="text-xs text-muted-foreground">Em Avaliação</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredBlocks.length}</div>
            <div className="text-xs text-muted-foreground">Total Filtrado</div>
          </CardContent>
        </Card>
      </div>

      {/* Blocks Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlocks.map((block) => (
          <Card key={block.id} className="group hover:border-primary/30 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {block.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    Bacia de {getBasinLabel(block.basin)}
                  </CardDescription>
                </div>
                {getStatusBadge(block.status, block.tender)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Área:</span>
                    <span className="ml-2 font-medium">{block.area}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profundidade:</span>
                    <span className="ml-2 font-medium">{block.depth}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Layers className="w-3 h-3 mr-1" />
                    {getTypeLabel(block.type)}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 group-hover:bg-primary/10"
                  asChild
                >
                  <Link to={`/ep-data/blocks/${block.id.toLowerCase()}`}>
                    {t("investorPortal.viewDetails")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </StaggerContainer>

      {filteredBlocks.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t("investorPortal.noResults")}
            </h3>
            <p className="text-muted-foreground">
              {t("investorPortal.adjustFilters")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
