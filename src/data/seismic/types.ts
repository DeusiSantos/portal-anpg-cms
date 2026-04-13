export interface SeismicSurvey {
  id: string;
  name: string;
  year: number;
  basin: string;
  operator: string;
  type: "2d" | "3d" | "4d";
  category: "proprietary" | "multiclient";
  coverage: number;
  coverageUnit: "km" | "km²";
  /** Polyline for 2D lines, polygon boundary for 3D/4D areas */
  coordinates: [number, number][];
}

export const basinColors: Record<string, string> = {
  "Baixo Congo": "#e74c3c",
  "Kwanza": "#3498db",
  "Namibe": "#2ecc71",
  "Cabinda Onshore": "#f39c12",
  "Congo Interior": "#9b59b6",
};
