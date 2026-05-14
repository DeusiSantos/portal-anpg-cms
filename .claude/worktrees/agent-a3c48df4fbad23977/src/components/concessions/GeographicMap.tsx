import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { PetroleumBlock, statusLabels } from "@/hooks/usePetroleumBlocks";

const STATUS_COLORS: Record<string, string> = {
  production: "#22c55e",
  exploration: "#3b82f6",
  development: "#f59e0b",
  available: "#ef4444",
  awarded: "#8b5cf6",
  negotiating: "#f97316",
};

function createColoredIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -35],
  });
}

interface Props {
  blocks: PetroleumBlock[];
}

export function GeographicMap({ blocks }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  const mappable = useMemo(
    () => blocks.filter((b) => b.lat != null && b.lng != null),
    [blocks]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-10, 14],
      zoom: 5,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mappable.length === 0) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const markers: L.Marker[] = [];

    mappable.forEach((block) => {
      const color = STATUS_COLORS[block.statusKey] || "#6b7280";
      const marker = L.marker([block.lat!, block.lng!], {
        icon: createColoredIcon(color),
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:13px;">
          <h3 style="font-weight:700;font-size:15px;margin:0 0 6px;">${block.name}</h3>
          <p style="color:#555;margin:2px 0;"><strong>Bacia:</strong> ${block.basin}</p>
          <p style="color:#555;margin:2px 0;"><strong>Operador:</strong> ${block.operator}</p>
          <p style="margin:8px 0 6px;">
            <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;color:#fff;background:${color};">
              ${block.status}
            </span>
          </p>
          <a href="/ep-data/blocks/${block.id}" style="color:#2563eb;font-size:12px;font-weight:500;text-decoration:none;">
            Ver Detalhes →
          </a>
        </div>
      `);

      markers.push(marker);
    });

    // Fit bounds
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [30, 30] });
    }
  }, [mappable, navigate]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[600px] w-full rounded-2xl border border-border"
        style={{ zIndex: 0 }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-background/95 backdrop-blur border border-border rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-foreground mb-2">Legenda</p>
        <div className="space-y-1.5">
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">
                {statusLabels[key] || key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
