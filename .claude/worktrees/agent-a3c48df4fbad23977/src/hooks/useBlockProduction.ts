import { useQuery } from "@tanstack/react-query";
import api from "@/service/api";

/** Pontos anuais para gráficos (valores médios diários derivados dos totais anuais da API). */
export interface BlockProductionYear {
  year: number;
  oil_bpd: number;
  gas_mmscfd: number;
}

interface ProductionHistoryDto {
  year: number;
  totalOilBbl: number | null;
  totalGasMcf: number | null;
}

interface ProductionHistoryPaged {
  items: ProductionHistoryDto[];
}

export function useBlockProduction(blockId: string | undefined) {
  return useQuery({
    queryKey: ["block_production", blockId],
    queryFn: async () => {
      if (!blockId) return [];
      const res = await api.get<ProductionHistoryPaged>("/production-history", {
        params: {
          Page: 1,
          PageSize: 200,
          OilBlockId: blockId,
          IsActive: true,
        },
      });
      const items = res.data.items ?? [];
      return items
        .slice()
        .sort((a, b) => a.year - b.year)
        .map((row): BlockProductionYear => ({
          year: row.year,
          oil_bpd:
            row.totalOilBbl != null ? Math.round(row.totalOilBbl / 365) : 0,
          gas_mmscfd:
            row.totalGasMcf != null
              ? Number((row.totalGasMcf / 365 / 1000).toFixed(4))
              : 0,
        }));
    },
    enabled: !!blockId,
    staleTime: 5 * 60 * 1000,
  });
}
