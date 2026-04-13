import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PetroleumBlock {
  id: string;
  name: string;
  basin: string;
  basinKey: string;
  type: string;
  typeKey: string;
  operator: string;
  partners: { name: string; share: number }[];
  status: string;
  statusKey: string;
  area_km2: number | null;
  water_depth_m: number | null;
  offer_type: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  discovery_year: number | null;
  geological_formation: string | null;
  reservoir_type: string | null;
  estimated_reserves_mmboe: number | null;
  license_start: string | null;
  license_end: string | null;
  total_wells: number | null;
  active_wells: number | null;
  fpso_name: string | null;
  geological_notes: string | null;
}

function toBasinKey(basin: string): string {
  const map: Record<string, string> = {
    "Baixo Congo": "baixo-congo",
    "Kwanza": "kwanza",
    "Benguela": "benguela",
    "Namibe": "namibe",
    "Cabinda": "cabinda",
    "Congo Onshore": "congo-onshore",
    "Kwanza Onshore": "kwanza-onshore",
  };
  return map[basin] || basin.toLowerCase().replace(/\s+/g, "-");
}

function toTypeKey(depth_category: string | null): string {
  const map: Record<string, string> = {
    "Onshore": "onshore",
    "Shallow Water": "shallow",
    "Deepwater": "deep",
    "Ultra-Deepwater": "ultra-deep",
  };
  return depth_category ? (map[depth_category] || "deep") : "deep";
}

function toStatusKey(status: string | null): string {
  const map: Record<string, string> = {
    "producing": "production",
    "exploration": "exploration",
    "development": "development",
    "available": "available",
    "awarded": "awarded",
    "negotiating": "negotiating",
  };
  return status ? (map[status] || status) : "available";
}

export const basinLabels: Record<string, string> = {
  "baixo-congo": "Baixo Congo",
  "kwanza": "Kwanza",
  "benguela": "Benguela",
  "namibe": "Namibe",
  "cabinda": "Cabinda",
  "congo-onshore": "Congo Onshore",
  "kwanza-onshore": "Kwanza Onshore",
};

export const typeLabels: Record<string, string> = {
  "onshore": "Onshore",
  "shallow": "Águas Rasas",
  "deep": "Águas Profundas",
  "ultra-deep": "Águas Ultra-Profundas",
};

export const statusLabels: Record<string, string> = {
  "production": "Produção",
  "exploration": "Exploração",
  "development": "Desenvolvimento",
  "available": "Disponível",
  "awarded": "Adjudicado",
  "negotiating": "Em Negociação",
};

export const statusColors: Record<string, string> = {
  production: "bg-status-success/20 text-status-success-foreground border-status-success/30",
  exploration: "bg-status-info/20 text-status-info-foreground border-status-info/30",
  development: "bg-status-warning/20 text-status-warning-foreground border-status-warning/30",
  available: "bg-primary/20 text-primary border-primary/30",
  awarded: "bg-accent/20 text-accent-foreground border-accent/30",
  negotiating: "bg-status-warning/20 text-status-warning-foreground border-status-warning/30",
};

export function usePetroleumBlocks() {
  return useQuery({
    queryKey: ["petroleum_blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("petroleum_blocks")
        .select("*")
        .order("block_name");

      if (error) throw error;
      return data;
    },
    select: (data) =>
      data.map((b): PetroleumBlock => {
        const consortium = (b.consortium as any[] | null) || [];
        return {
          id: b.id,
          name: b.block_name,
          basin: b.basin || "N/A",
          basinKey: toBasinKey(b.basin || ""),
          type: typeLabels[toTypeKey(b.depth_category)] || b.depth_category || "N/A",
          typeKey: toTypeKey(b.depth_category),
          operator: b.operator || "ANPG",
          partners: consortium.map((c: any) => ({
            name: c.company || "",
            share: c.share || 0,
          })),
          status: statusLabels[toStatusKey(b.status)] || b.status || "Disponível",
          statusKey: toStatusKey(b.status),
          area_km2: b.area_km2 ? Number(b.area_km2) : null,
          water_depth_m: b.water_depth_m,
          offer_type: b.offer_type,
          description: b.description,
          lat: (b.coordinates as any)?.lat ?? null,
          lng: (b.coordinates as any)?.lng ?? null,
          discovery_year: b.discovery_year,
          geological_formation: b.geological_formation,
          reservoir_type: b.reservoir_type,
          estimated_reserves_mmboe: b.estimated_reserves_mmboe ? Number(b.estimated_reserves_mmboe) : null,
          license_start: b.license_start,
          license_end: b.license_end,
          total_wells: b.total_wells,
          active_wells: b.active_wells,
          fpso_name: b.fpso_name,
          geological_notes: b.geological_notes,
        };
      }),
  });
}

export function usePetroleumBlockById(blockId: string | undefined) {
  return useQuery({
    queryKey: ["petroleum_block", blockId],
    queryFn: async () => {
      if (!blockId) return null;
      const { data, error } = await supabase
        .from("petroleum_blocks")
        .select("*")
        .eq("id", blockId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const consortium = (data.consortium as any[] | null) || [];
      return {
        id: data.id,
        name: data.block_name,
        basin: data.basin || "N/A",
        basinKey: toBasinKey(data.basin || ""),
        type: typeLabels[toTypeKey(data.depth_category)] || data.depth_category || "N/A",
        typeKey: toTypeKey(data.depth_category),
        operator: data.operator || "ANPG",
        partners: consortium.map((c: any) => ({
          name: c.company || "",
          share: c.share || 0,
        })),
        status: statusLabels[toStatusKey(data.status)] || data.status || "Disponível",
        statusKey: toStatusKey(data.status),
        area_km2: data.area_km2 ? Number(data.area_km2) : null,
        water_depth_m: data.water_depth_m,
        offer_type: data.offer_type,
        description: data.description,
        lat: (data.coordinates as any)?.lat ?? null,
        lng: (data.coordinates as any)?.lng ?? null,
        discovery_year: data.discovery_year,
        geological_formation: data.geological_formation,
        reservoir_type: data.reservoir_type,
        estimated_reserves_mmboe: data.estimated_reserves_mmboe ? Number(data.estimated_reserves_mmboe) : null,
        license_start: data.license_start,
        license_end: data.license_end,
        total_wells: data.total_wells,
        active_wells: data.active_wells,
        fpso_name: data.fpso_name,
        geological_notes: data.geological_notes,
      } as PetroleumBlock;
    },
    enabled: !!blockId,
  });
}
