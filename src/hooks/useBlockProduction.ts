import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlockProductionEntry {
  year: number;
  month: number | null;
  oil_bpd: number | null;
  gas_mmscfd: number | null;
}

export function useBlockProduction(blockId: string | undefined) {
  return useQuery({
    queryKey: ["block_production", blockId],
    queryFn: async () => {
      if (!blockId) return [];
      const { data, error } = await supabase
        .from("production_statistics")
        .select("year, month, oil_production_bpd, gas_production_mmscfd")
        .eq("block_id", blockId)
        .order("year")
        .order("month");

      if (error) throw error;
      return (data || []).map((r) => ({
        year: r.year,
        month: r.month,
        oil_bpd: r.oil_production_bpd ? Number(r.oil_production_bpd) : null,
        gas_mmscfd: r.gas_production_mmscfd ? Number(r.gas_production_mmscfd) : null,
      })) as BlockProductionEntry[];
    },
    enabled: !!blockId,
  });
}
