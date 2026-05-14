import type { SeismicSurvey } from "./types";

// ── 2D Proprietária (from official ANPG map "Sísmica 2D Proprietária") ──
export const seismic2dProprietary: SeismicSurvey[] = [
  {
    id: "2dp-001", name: "Lower Congo 2D", year: 1968, basin: "Baixo Congo", operator: "Gulf Oil Corp",
    type: "2d", category: "proprietary", coverage: 1200, coverageUnit: "km",
    coordinates: [[-5.6, 12.0], [-5.9, 12.2], [-6.3, 12.1], [-6.7, 11.9]],
  },
  {
    id: "2dp-002", name: "2D-KONCGG69_BA", year: 1969, basin: "Baixo Congo", operator: "CGG",
    type: "2d", category: "proprietary", coverage: 950, coverageUnit: "km",
    coordinates: [[-5.5, 12.1], [-5.8, 12.3], [-6.1, 12.2], [-6.4, 12.0]],
  },
  {
    id: "2dp-003", name: "2D-KONCGG70_S", year: 1970, basin: "Baixo Congo", operator: "CGG",
    type: "2d", category: "proprietary", coverage: 1100, coverageUnit: "km",
    coordinates: [[-5.7, 11.8], [-6.0, 12.0], [-6.4, 12.1], [-6.8, 11.9]],
  },
  {
    id: "2dp-004", name: "2D-KONCGG72_G", year: 1972, basin: "Baixo Congo", operator: "CGG",
    type: "2d", category: "proprietary", coverage: 800, coverageUnit: "km",
    coordinates: [[-5.4, 12.2], [-5.7, 12.4], [-6.0, 12.3], [-6.3, 12.1]],
  },
  {
    id: "2dp-005", name: "2D-KONCGG73", year: 1973, basin: "Baixo Congo", operator: "CGG",
    type: "2d", category: "proprietary", coverage: 1050, coverageUnit: "km",
    coordinates: [[-5.8, 11.6], [-6.2, 11.8], [-6.6, 12.0], [-7.0, 11.8]],
  },
  {
    id: "2dp-006", name: "2D-KONCGG74", year: 1974, basin: "Baixo Congo", operator: "CGG",
    type: "2d", category: "proprietary", coverage: 900, coverageUnit: "km",
    coordinates: [[-5.6, 11.5], [-6.0, 11.7], [-6.4, 11.9], [-6.8, 11.7]],
  },
  {
    id: "2dp-007", name: "Cabinda Sul 3D", year: 2005, basin: "Cabinda Onshore", operator: "Geophysical Institute of Israel",
    type: "2d", category: "proprietary", coverage: 650, coverageUnit: "km",
    coordinates: [[-5.2, 12.1], [-5.4, 12.3], [-5.6, 12.2], [-5.8, 12.0]],
  },
  {
    id: "2dp-008", name: "Cabinda Norte 2D", year: 2007, basin: "Cabinda Onshore", operator: "Grant Geophysical",
    type: "2d", category: "proprietary", coverage: 780, coverageUnit: "km",
    coordinates: [[-4.5, 12.2], [-4.8, 12.4], [-5.1, 12.3], [-5.4, 12.1]],
  },
  {
    id: "2dp-009", name: "2D-BBCTNG08", year: 2008, basin: "Baixo Congo", operator: "Group Alrosa",
    type: "2d", category: "proprietary", coverage: 1400, coverageUnit: "km",
    coordinates: [[-6.0, 11.0], [-6.4, 11.3], [-6.8, 11.6], [-7.2, 11.4]],
  },
  {
    id: "2dp-010", name: "Angola 2D", year: 2012, basin: "Baixo Congo", operator: "CGG",
    type: "2d", category: "proprietary", coverage: 2200, coverageUnit: "km",
    coordinates: [[-5.3, 10.8], [-5.8, 11.2], [-6.3, 11.6], [-6.8, 11.4], [-7.3, 11.0]],
  },
  {
    id: "2dp-011", name: "Cabinda Centro", year: 2022, basin: "Cabinda Onshore", operator: "BGP",
    type: "2d", category: "proprietary", coverage: 520, coverageUnit: "km",
    coordinates: [[-4.8, 12.2], [-5.0, 12.4], [-5.3, 12.3], [-5.5, 12.1]],
  },
  {
    id: "2dp-012", name: "KON 8", year: 2024, basin: "Baixo Congo", operator: "BGP",
    type: "2d", category: "proprietary", coverage: 1600, coverageUnit: "km",
    coordinates: [[-5.5, 11.2], [-5.9, 11.5], [-6.3, 11.8], [-6.7, 11.6], [-7.1, 11.3]],
  },
  {
    id: "2dp-013", name: "KON 6", year: 2025, basin: "Baixo Congo", operator: "BGP",
    type: "2d", category: "proprietary", coverage: 1800, coverageUnit: "km",
    coordinates: [[-5.4, 11.0], [-5.8, 11.3], [-6.2, 11.6], [-6.6, 11.9], [-7.0, 11.7]],
  },
];

// ── 2D Multicliente (from official ANPG map "Sísmica 2D Multicliente") ──
export const seismic2dMulticlient: SeismicSurvey[] = [
  {
    id: "2dm-001", name: "2D-KONGSI70", year: 1970, basin: "Baixo Congo", operator: "Geophysical Service Inc",
    type: "2d", category: "multiclient", coverage: 750, coverageUnit: "km",
    coordinates: [[-5.7, 11.9], [-6.1, 12.1], [-6.5, 11.9], [-6.9, 11.7]],
  },
  {
    id: "2dm-002", name: "2D-KONGSI71_PGP", year: 1971, basin: "Baixo Congo", operator: "Geophysical Service Inc",
    type: "2d", category: "multiclient", coverage: 680, coverageUnit: "km",
    coordinates: [[-5.9, 11.7], [-6.3, 11.9], [-6.7, 11.8], [-7.1, 11.5]],
  },
  {
    id: "2dm-003", name: "2D-KONGSI82_MCP", year: 1982, basin: "Baixo Congo", operator: "Geophysical Service Inc",
    type: "2d", category: "multiclient", coverage: 1200, coverageUnit: "km",
    coordinates: [[-5.5, 11.4], [-5.9, 11.7], [-6.3, 12.0], [-6.7, 11.8], [-7.1, 11.5]],
  },
  {
    id: "2dm-004", name: "2D-KONCGG83_GLF", year: 1983, basin: "Baixo Congo", operator: "CGG",
    type: "2d", category: "multiclient", coverage: 900, coverageUnit: "km",
    coordinates: [[-5.6, 11.6], [-6.0, 11.8], [-6.4, 11.7], [-6.8, 11.4]],
  },
  {
    id: "2dm-005", name: "A89", year: 1989, basin: "Baixo Congo", operator: "WesternGeco",
    type: "2d", category: "multiclient", coverage: 1500, coverageUnit: "km",
    coordinates: [[-5.3, 11.0], [-5.8, 11.4], [-6.3, 11.8], [-6.8, 11.6], [-7.3, 11.2]],
  },
  {
    id: "2dm-006", name: "NB91", year: 1991, basin: "Namibe", operator: "WesternGeco",
    type: "2d", category: "multiclient", coverage: 1800, coverageUnit: "km",
    coordinates: [[-13.0, 12.0], [-13.5, 12.3], [-14.0, 12.5], [-14.5, 12.3], [-15.0, 12.0]],
  },
  {
    id: "2dm-007", name: "WG96", year: 1996, basin: "Baixo Congo", operator: "WesternGeco",
    type: "2d", category: "multiclient", coverage: 2100, coverageUnit: "km",
    coordinates: [[-5.2, 10.5], [-5.7, 11.0], [-6.2, 11.5], [-6.7, 11.3], [-7.2, 10.8]],
  },
  {
    id: "2dm-008", name: "AWG97", year: 1997, basin: "Kwanza", operator: "Western Geophysical",
    type: "2d", category: "multiclient", coverage: 1350, coverageUnit: "km",
    coordinates: [[-8.5, 12.5], [-9.0, 12.8], [-9.5, 13.0], [-10.0, 12.8], [-10.5, 12.5]],
  },
  {
    id: "2dm-009", name: "AWG99", year: 1999, basin: "Kwanza", operator: "Western Geophysical Co",
    type: "2d", category: "multiclient", coverage: 1600, coverageUnit: "km",
    coordinates: [[-8.8, 12.2], [-9.3, 12.5], [-9.8, 12.8], [-10.3, 12.6], [-10.8, 12.3]],
  },
  {
    id: "2dm-010", name: "CongoSpan II", year: 2007, basin: "Baixo Congo", operator: "GX Technology Corp",
    type: "2d", category: "multiclient", coverage: 3200, coverageUnit: "km",
    coordinates: [[-5.0, 10.0], [-5.5, 10.5], [-6.0, 11.0], [-6.5, 11.5], [-7.0, 11.0], [-7.5, 10.5]],
  },
  {
    id: "2dm-011", name: "2D-BBCTNG07", year: 2007, basin: "Congo Interior", operator: "Tyumenneftegeofizika",
    type: "2d", category: "multiclient", coverage: 950, coverageUnit: "km",
    coordinates: [[-5.0, 13.5], [-5.3, 14.0], [-5.6, 14.5], [-5.9, 14.0]],
  },
  {
    id: "2dm-012", name: "Angola Offshore MC2D", year: 2010, basin: "Kwanza", operator: "PGS",
    type: "2d", category: "multiclient", coverage: 4500, coverageUnit: "km",
    coordinates: [[-7.5, 10.0], [-8.5, 11.0], [-9.5, 12.0], [-10.5, 12.5], [-11.5, 12.0]],
  },
  {
    id: "2dm-013", name: "Southern Angola MC2D", year: 2012, basin: "Namibe", operator: "Geokinetics Inc",
    type: "2d", category: "multiclient", coverage: 3800, coverageUnit: "km",
    coordinates: [[-12.0, 12.5], [-13.0, 12.8], [-14.0, 13.0], [-15.0, 12.5], [-16.0, 12.0]],
  },
  {
    id: "2dm-014", name: "NamibeSPAN", year: 2019, basin: "Namibe", operator: "GX Technology Corp",
    type: "2d", category: "multiclient", coverage: 5000, coverageUnit: "km",
    coordinates: [[-12.5, 11.5], [-13.5, 12.0], [-14.5, 12.5], [-15.5, 12.0], [-16.5, 11.5]],
  },
];

export const seismic2dSurveys: SeismicSurvey[] = [
  ...seismic2dProprietary,
  ...seismic2dMulticlient,
];
