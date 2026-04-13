import type { SeismicSurvey } from "./types";

// ── 4D Seismic Surveys (from official ANPG map "Sísmica 3D/4D Proprietária") ──
export const seismic4dSurveys: SeismicSurvey[] = [
  {
    id: "4d-001", name: "Girassol Complex 4D – Monitor 1", year: 2006, basin: "Baixo Congo", operator: "Total E&P",
    type: "4d", category: "proprietary", coverage: 967, coverageUnit: "km²",
    coordinates: [[-7.1, 10.6], [-7.1, 11.0], [-7.5, 11.0], [-7.5, 10.6], [-7.1, 10.6]],
  },
  {
    id: "4d-002", name: "Dália 4D – Monitor 1", year: 2009, basin: "Baixo Congo", operator: "Total E&P",
    type: "4d", category: "proprietary", coverage: 890, coverageUnit: "km²",
    coordinates: [[-7.3, 10.4], [-7.3, 10.7], [-7.6, 10.7], [-7.6, 10.4], [-7.3, 10.4]],
  },
  {
    id: "4d-003", name: "Girassol Complex 4D – Monitor 2", year: 2012, basin: "Baixo Congo", operator: "WesternGeco",
    type: "4d", category: "proprietary", coverage: 967, coverageUnit: "km²",
    coordinates: [[-7.1, 10.6], [-7.1, 11.0], [-7.5, 11.0], [-7.5, 10.6], [-7.1, 10.6]],
  },
  {
    id: "4d-004", name: "BBLT 4D", year: 2013, basin: "Baixo Congo", operator: "BP Angola",
    type: "4d", category: "proprietary", coverage: 1500, coverageUnit: "km²",
    coordinates: [[-7.5, 10.2], [-7.5, 10.7], [-8.0, 10.7], [-8.0, 10.2], [-7.5, 10.2]],
  },
  {
    id: "4d-005", name: "Pazflor 4D", year: 2015, basin: "Baixo Congo", operator: "Total E&P",
    type: "4d", category: "proprietary", coverage: 820, coverageUnit: "km²",
    coordinates: [[-7.2, 10.8], [-7.2, 11.1], [-7.5, 11.1], [-7.5, 10.8], [-7.2, 10.8]],
  },
  {
    id: "4d-006", name: "CLOV 4D", year: 2017, basin: "Baixo Congo", operator: "PGS",
    type: "4d", category: "proprietary", coverage: 1650, coverageUnit: "km²",
    coordinates: [[-6.9, 10.9], [-6.9, 11.3], [-7.3, 11.3], [-7.3, 10.9], [-6.9, 10.9]],
  },
  {
    id: "4d-007", name: "Dália 4D – Monitor 2", year: 2019, basin: "Baixo Congo", operator: "Total E&P",
    type: "4d", category: "proprietary", coverage: 890, coverageUnit: "km²",
    coordinates: [[-7.3, 10.4], [-7.3, 10.7], [-7.6, 10.7], [-7.6, 10.4], [-7.3, 10.4]],
  },
  {
    id: "4d-008", name: "Block 32 4D", year: 2019, basin: "Kwanza", operator: "PGS",
    type: "4d", category: "proprietary", coverage: 883, coverageUnit: "km²",
    coordinates: [[-8.4, 10.1], [-8.4, 10.5], [-8.8, 10.5], [-8.8, 10.1], [-8.4, 10.1]],
  },
  {
    id: "4d-009", name: "Block 15 4D", year: 2021, basin: "Baixo Congo", operator: "Eni Angola",
    type: "4d", category: "proprietary", coverage: 1800, coverageUnit: "km²",
    coordinates: [[-6.6, 10.9], [-6.6, 11.4], [-7.1, 11.4], [-7.1, 10.9], [-6.6, 10.9]],
  },
  {
    id: "4d-010", name: "Girassol Complex 4D – Monitor 3", year: 2023, basin: "Baixo Congo", operator: "TotalEnergies",
    type: "4d", category: "proprietary", coverage: 967, coverageUnit: "km²",
    coordinates: [[-7.1, 10.6], [-7.1, 11.0], [-7.5, 11.0], [-7.5, 10.6], [-7.1, 10.6]],
  },
  {
    id: "4d-011", name: "Kaombo 4D", year: 2022, basin: "Baixo Congo", operator: "TotalEnergies",
    type: "4d", category: "proprietary", coverage: 1450, coverageUnit: "km²",
    coordinates: [[-7.6, 10.0], [-7.6, 10.5], [-8.1, 10.5], [-8.1, 10.0], [-7.6, 10.0]],
  },
  {
    id: "4d-012", name: "Greater Plutonio 4D", year: 2020, basin: "Baixo Congo", operator: "BP Angola",
    type: "4d", category: "proprietary", coverage: 1100, coverageUnit: "km²",
    coordinates: [[-7.6, 10.3], [-7.6, 10.7], [-8.0, 10.7], [-8.0, 10.3], [-7.6, 10.3]],
  },
];
