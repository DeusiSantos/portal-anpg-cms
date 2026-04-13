import { useEffect, useRef, useState, useMemo } from "react";
import { Map as MapIcon, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { useContentBlocks } from "@/hooks/useCMSData";
import {
  seismic2dSurveys,
  seismic3dSurveys,
  seismic4dSurveys,
  basinColors,
  type SeismicSurvey,
} from "@/data/seismic";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface SeismicMapPageProps {
  type: "2d" | "3d" | "4d";
}

const surveysByType: Record<string, SeismicSurvey[]> = {
  "2d": seismic2dSurveys,
  "3d": seismic3dSurveys,
  "4d": seismic4dSurveys,
};

export default function SeismicMapPage({ type }: SeismicMapPageProps) {
  const { t, i18n } = useTranslation();
  const { data: cmsBlocks } = useContentBlocks(`exploration-seismic-${type}`);
  const intro = cmsBlocks?.find((b) => b.section_key === "intro")?.content;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const isEn = i18n.language === "en";

  const allSurveys = surveysByType[type] || [];
  const allBasins = useMemo(() => [...new Set(allSurveys.map((s) => s.basin))], [allSurveys]);
  const allYears = useMemo(() => {
    const years = allSurveys.map((s) => s.year);
    return [Math.min(...years), Math.max(...years)] as [number, number];
  }, [allSurveys]);

  const [selectedBasins, setSelectedBasins] = useState<Set<string>>(new Set(allBasins));
  const [yearRange, setYearRange] = useState<[number, number]>(allYears);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(["proprietary", "multiclient"]));

  // Reset filters when type changes
  useEffect(() => {
    setSelectedBasins(new Set(allBasins));
    setYearRange(allYears);
    setSelectedCategories(new Set(["proprietary", "multiclient"]));
  }, [type]);

  const filteredSurveys = useMemo(
    () =>
      allSurveys.filter(
        (s) =>
          selectedBasins.has(s.basin) &&
          s.year >= yearRange[0] &&
          s.year <= yearRange[1] &&
          selectedCategories.has(s.category)
      ),
    [allSurveys, selectedBasins, yearRange, selectedCategories]
  );

  const titleKey = `pages.exploration.seismic${type}`;
  const subtitleKey = `pages.exploration.seismic${type}Subtitle`;
  const pageKey = `exploration-seismic-${type}`;

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([-9.0, 11.5], 5);
    mapInstanceRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Legend
    const legend = new L.Control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-legend");
      div.style.cssText =
        "background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.15);font-size:13px;line-height:1.8;";
      let html = `<strong style="margin-bottom:4px;display:block">${isEn ? "Basins" : "Bacias"}</strong>`;
      html += allBasins
        .map(
          (b) =>
            `<span style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:${basinColors[b] || "#8e44ad"};display:inline-block"></span>${b}</span>`
        )
        .join("");
      if (type === "2d") {
        html += `<hr style="margin:6px 0;border-color:#eee"/>`;
        html += `<strong style="margin-bottom:4px;display:block">${isEn ? "Category" : "Categoria"}</strong>`;
        html += `<span style="display:flex;align-items:center;gap:6px"><span style="width:20px;border-top:3px solid #666;display:inline-block"></span>${isEn ? "Proprietary" : "Proprietária"}</span>`;
        html += `<span style="display:flex;align-items:center;gap:6px"><span style="width:20px;border-top:3px dashed #666;display:inline-block"></span>${isEn ? "Multiclient" : "Multicliente"}</span>`;
      }
      div.innerHTML = html;
      return div;
    };
    legend.addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [type, isEn]);

  // Update layers when filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    filteredSurveys.forEach((survey) => {
      const color = basinColors[survey.basin] || "#8e44ad";
      const coords = survey.coordinates as [number, number][];
      let layer: L.Layer;

      if (type === "2d") {
        const dash = survey.category === "multiclient" ? "8 6" : undefined;
        layer = L.polyline(coords, { color, weight: 3, opacity: 0.8, dashArray: dash }).addTo(map);
      } else {
        layer = L.polygon(coords, { color, fillColor: color, fillOpacity: 0.2, weight: 2 }).addTo(map);
      }
      (layer as L.Polyline).bindPopup(buildPopup(survey, isEn));
      layersRef.current.push(layer);
    });
  }, [filteredSurveys, type, isEn]);

  const toggleBasin = (basin: string) => {
    setSelectedBasins((prev) => {
      const next = new Set(prev);
      if (next.has(basin)) next.delete(basin);
      else next.add(basin);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const totalCoverage = filteredSurveys.reduce((sum, s) => sum + s.coverage, 0);
  const unit = type === "2d" ? "km" : "km²";

  return (
    <PageLayout
      pageKey={pageKey}
      titleKey={titleKey}
      subtitleKey={subtitleKey}
      
      icon={<MapIcon className="w-8 h-8 text-primary" />}
      breadcrumbs={[
        { labelKey: "nav.exploration", href: "/exploration" },
        { labelKey: titleKey },
      ]}
    >
      <div className="space-y-8">
        {intro ? (
          <>
            <h2 className="text-2xl font-bold text-foreground">{(intro as any).title}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{(intro as any).body}</p>
          </>
        ) : (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t(`pages.exploration.seismic${type}Content`)}
          </p>
        )}

        {/* Filters */}
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Filter className="w-4 h-4" />
            {isEn ? "Filters" : "Filtros"}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {/* Basin filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {isEn ? "Basins" : "Bacias"}
              </p>
              <div className="flex flex-wrap gap-3">
                {allBasins.map((basin) => (
                  <label key={basin} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedBasins.has(basin)}
                      onCheckedChange={() => toggleBasin(basin)}
                    />
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: basinColors[basin] || "#8e44ad" }}
                      />
                      {basin}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category filter (2D only) */}
            {type === "2d" && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {isEn ? "Category" : "Categoria"}
                </p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedCategories.has("proprietary")}
                      onCheckedChange={() => toggleCategory("proprietary")}
                    />
                    <span className="text-sm text-foreground">{isEn ? "Proprietary" : "Proprietária"}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedCategories.has("multiclient")}
                      onCheckedChange={() => toggleCategory("multiclient")}
                    />
                    <span className="text-sm text-foreground">{isEn ? "Multiclient" : "Multicliente"}</span>
                  </label>
                </div>
              </div>
            )}

            {/* Year range */}
            <div className="space-y-2 min-w-[220px] flex-1 max-w-sm">
              <p className="text-sm font-medium text-muted-foreground">
                {isEn ? "Year Range" : "Intervalo de Anos"}: {yearRange[0]} – {yearRange[1]}
              </p>
              <Slider
                min={allYears[0]}
                max={allYears[1]}
                step={1}
                value={yearRange}
                onValueChange={(v) => setYearRange(v as [number, number])}
                className="py-2"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {isEn
              ? `Showing ${filteredSurveys.length} of ${allSurveys.length} surveys`
              : `A mostrar ${filteredSurveys.length} de ${allSurveys.length} levantamentos`}
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-3xl font-bold text-primary">{filteredSurveys.length}</p>
            <p className="text-sm text-muted-foreground">{isEn ? "Surveys" : "Levantamentos"}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-3xl font-bold text-primary">{totalCoverage.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {isEn ? `Total Coverage (${unit})` : `Cobertura Total (${unit})`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-3xl font-bold text-primary">
              {[...new Set(filteredSurveys.map((s) => s.basin))].length}
            </p>
            <p className="text-sm text-muted-foreground">{isEn ? "Basins Covered" : "Bacias Cobertas"}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-3xl font-bold text-primary">
              {[...new Set(filteredSurveys.map((s) => s.operator))].length}
            </p>
            <p className="text-sm text-muted-foreground">{isEn ? "Operators" : "Operadores"}</p>
          </div>
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          className="w-full h-[500px] lg:h-[600px] rounded-2xl border border-border overflow-hidden shadow-lg"
        />

        {/* Survey table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/70">
              <tr>
                <th className="text-left p-3 font-semibold text-foreground">{isEn ? "Survey" : "Levantamento"}</th>
                <th className="text-left p-3 font-semibold text-foreground">{isEn ? "Year" : "Ano"}</th>
                <th className="text-left p-3 font-semibold text-foreground">{isEn ? "Basin" : "Bacia"}</th>
                <th className="text-left p-3 font-semibold text-foreground">{isEn ? "Operator" : "Operador"}</th>
                {type === "2d" && (
                  <th className="text-left p-3 font-semibold text-foreground">{isEn ? "Category" : "Categoria"}</th>
                )}
                <th className="text-right p-3 font-semibold text-foreground">
                  {isEn ? `Coverage (${unit})` : `Cobertura (${unit})`}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "bg-background" : "bg-secondary/30"}>
                  <td className="p-3 text-foreground font-medium">{s.name}</td>
                  <td className="p-3 text-muted-foreground">{s.year}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: basinColors[s.basin] || "#8e44ad" }}
                      />
                      <span className="text-muted-foreground">{s.basin}</span>
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{s.operator}</td>
                  {type === "2d" && (
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        s.category === "proprietary"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent/50 text-accent-foreground"
                      }`}>
                        {s.category === "proprietary"
                          ? (isEn ? "Proprietary" : "Proprietária")
                          : (isEn ? "Multiclient" : "Multicliente")}
                      </span>
                    </td>
                  )}
                  <td className="p-3 text-right text-muted-foreground">{s.coverage.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}

function buildPopup(survey: SeismicSurvey, isEn: boolean): string {
  const unit = survey.type === "2d" ? "km" : "km²";
  const catLabel = survey.category === "proprietary"
    ? (isEn ? "Proprietary" : "Proprietária")
    : (isEn ? "Multiclient" : "Multicliente");
  return `
    <div style="min-width:200px">
      <strong style="font-size:14px">${survey.name}</strong><br/>
      <span style="color:#666">${isEn ? "Year" : "Ano"}: ${survey.year}</span><br/>
      <span style="color:#666">${isEn ? "Basin" : "Bacia"}: ${survey.basin}</span><br/>
      <span style="color:#666">${isEn ? "Operator" : "Operador"}: ${survey.operator}</span><br/>
      <span style="color:#666">${isEn ? "Category" : "Categoria"}: ${catLabel}</span><br/>
      <span style="color:#666">${isEn ? "Coverage" : "Cobertura"}: ${survey.coverage.toLocaleString()} ${unit}</span>
    </div>
  `;
}
