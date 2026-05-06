// src/hooks/useBanners.ts
import api from "@/service/api";
import { useQuery } from "@tanstack/react-query";

function getBannerImageUrl(bannerId: string, fileId: string) {
  return `/api/banner/${bannerId}/attachments/${fileId}`;
}

export function useBanners(pageKey: string) {
  return useQuery({
    queryKey: ["banners", pageKey],
    queryFn: async () => {
      const res = await api.get(`/banner?pageKey=${pageKey}`);

      const data = res.data;

      return data
        .map((item: any) => {
          const banner = item.banner;
          const file = banner.attachments?.[0];

          return {
            id: banner.id,
            pageKey: banner.pageKey?.toLowerCase(),
            titlePt: banner.titlePt,
            subtitlePt: banner.subtitlePt,
            titleEn: banner.titleEn,
            subtitleEn: banner.subtitleEn,
            imageUrl: file
              ? `${api.defaults.baseURL}/api/banner/${banner.id}/attachments/${file.id}`
              : null,
            publicationStatus: banner.publicationStatus,
          };
        })
        .filter(
          (b: any) =>
            b.pageKey === pageKey &&
            b.publicationStatus === "Published"
        );
    },
  });
}