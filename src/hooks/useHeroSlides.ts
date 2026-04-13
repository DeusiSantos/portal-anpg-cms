import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroSlideData {
  image: string;
  title_pt?: string;
  title_en?: string;
  subtitle_pt?: string;
  subtitle_en?: string;
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("page_key", "home")
        .eq("section_key", "hero-slide")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      if (!data?.length) return [];

      return data.map((block) => {
        const content = block.content as Record<string, any>;
        return {
          image: content.image || "",
          title_pt: content.title_pt,
          title_en: content.title_en,
          subtitle_pt: content.subtitle_pt,
          subtitle_en: content.subtitle_en,
        } as HeroSlideData;
      });
    },
  });
}
