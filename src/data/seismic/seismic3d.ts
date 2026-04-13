import type { SeismicSurvey } from "./types";

// ── 3D Seismic Surveys (from official ANPG map "Sísmica 3D/4D Proprietária") ──
export const seismic3dSurveys: SeismicSurvey[] = [
  // Baixo Congo Basin — deep water blocks
  {
    id: "3d-001", name: "Block 0 3D", year: 1993, basin: "Baixo Congo", operator: "Chevron",
    type: "3d", category: "proprietary", coverage: 2800, coverageUnit: "km²",
    coordinates: [[-5.3, 11.8], [-5.3, 12.3], [-5.8, 12.3], [-5.8, 11.8], [-5.3, 11.8]],
  },
  {
    id: "3d-002", name: "Block 1 3D", year: 1994, basin: "Baixo Congo", operator: "Chevron",
    type: "3d", category: "proprietary", coverage: 1500, coverageUnit: "km²",
    coordinates: [[-5.8, 11.5], [-5.8, 12.0], [-6.2, 12.0], [-6.2, 11.5], [-5.8, 11.5]],
  },
  {
    id: "3d-003", name: "Block 2 3D", year: 1995, basin: "Baixo Congo", operator: "Total E&P",
    type: "3d", category: "proprietary", coverage: 1200, coverageUnit: "km²",
    coordinates: [[-6.0, 11.3], [-6.0, 11.7], [-6.4, 11.7], [-6.4, 11.3], [-6.0, 11.3]],
  },
  {
    id: "3d-004", name: "Block 3 3D", year: 1996, basin: "Baixo Congo", operator: "Sonangol P&P",
    type: "3d", category: "proprietary", coverage: 1800, coverageUnit: "km²",
    coordinates: [[-6.2, 11.0], [-6.2, 11.5], [-6.7, 11.5], [-6.7, 11.0], [-6.2, 11.0]],
  },
  {
    id: "3d-005", name: "Block 14 MC3D", year: 2013, basin: "Baixo Congo", operator: "PGS",
    type: "3d", category: "proprietary", coverage: 3698, coverageUnit: "km²",
    coordinates: [[-6.0, 11.0], [-6.0, 11.7], [-6.7, 11.7], [-6.7, 11.0], [-6.0, 11.0]],
  },
  {
    id: "3d-006", name: "Block 15 3D Phase I", year: 1995, basin: "Baixo Congo", operator: "WesternGeco",
    type: "3d", category: "proprietary", coverage: 2100, coverageUnit: "km²",
    coordinates: [[-6.5, 10.8], [-6.5, 11.3], [-7.0, 11.3], [-7.0, 10.8], [-6.5, 10.8]],
  },
  {
    id: "3d-007", name: "Block 15 3D Phase II", year: 1996, basin: "Baixo Congo", operator: "WesternGeco",
    type: "3d", category: "proprietary", coverage: 1900, coverageUnit: "km²",
    coordinates: [[-6.6, 10.9], [-6.6, 11.4], [-7.1, 11.4], [-7.1, 10.9], [-6.6, 10.9]],
  },
  {
    id: "3d-008", name: "Block 15 3D Phase III", year: 1997, basin: "Baixo Congo", operator: "WesternGeco",
    type: "3d", category: "proprietary", coverage: 2400, coverageUnit: "km²",
    coordinates: [[-6.7, 10.7], [-6.7, 11.2], [-7.2, 11.2], [-7.2, 10.7], [-6.7, 10.7]],
  },
  {
    id: "3d-009", name: "Block 15 3D Phase IV", year: 1998, basin: "Baixo Congo", operator: "WesternGeco",
    type: "3d", category: "proprietary", coverage: 2200, coverageUnit: "km²",
    coordinates: [[-6.8, 10.6], [-6.8, 11.1], [-7.3, 11.1], [-7.3, 10.6], [-6.8, 10.6]],
  },
  {
    id: "3d-010", name: "Block 15 3D Phase V", year: 1999, basin: "Baixo Congo", operator: "WesternGeco",
    type: "3d", category: "proprietary", coverage: 2600, coverageUnit: "km²",
    coordinates: [[-6.4, 10.5], [-6.4, 11.0], [-7.0, 11.0], [-7.0, 10.5], [-6.4, 10.5]],
  },
  {
    id: "3d-011", name: "Block 15/06 3D", year: 2006, basin: "Baixo Congo", operator: "Eni Angola",
    type: "3d", category: "proprietary", coverage: 3500, coverageUnit: "km²",
    coordinates: [[-6.8, 10.8], [-6.8, 11.5], [-7.4, 11.5], [-7.4, 10.8], [-6.8, 10.8]],
  },
  {
    id: "3d-012", name: "Block 16 South 3D", year: 1997, basin: "Baixo Congo", operator: "WesternGeco",
    type: "3d", category: "proprietary", coverage: 183, coverageUnit: "km²",
    coordinates: [[-7.0, 11.2], [-7.0, 11.4], [-7.2, 11.4], [-7.2, 11.2], [-7.0, 11.2]],
  },
  {
    id: "3d-013", name: "Block 17 3D", year: 2002, basin: "Baixo Congo", operator: "PGS",
    type: "3d", category: "proprietary", coverage: 685, coverageUnit: "km²",
    coordinates: [[-7.0, 10.5], [-7.0, 10.9], [-7.4, 10.9], [-7.4, 10.5], [-7.0, 10.5]],
  },
  {
    id: "3d-014", name: "Block 17 Extension 3D", year: 2008, basin: "Baixo Congo", operator: "CGG",
    type: "3d", category: "proprietary", coverage: 1200, coverageUnit: "km²",
    coordinates: [[-7.2, 10.3], [-7.2, 10.8], [-7.6, 10.8], [-7.6, 10.3], [-7.2, 10.3]],
  },
  {
    id: "3d-015", name: "Block 18 3D", year: 2000, basin: "Baixo Congo", operator: "CGG",
    type: "3d", category: "proprietary", coverage: 510, coverageUnit: "km²",
    coordinates: [[-7.4, 10.2], [-7.4, 10.6], [-7.7, 10.6], [-7.7, 10.2], [-7.4, 10.2]],
  },
  {
    id: "3d-016", name: "Block 18 Extension 3D", year: 2005, basin: "Baixo Congo", operator: "BP Angola",
    type: "3d", category: "proprietary", coverage: 1800, coverageUnit: "km²",
    coordinates: [[-7.5, 10.0], [-7.5, 10.5], [-8.0, 10.5], [-8.0, 10.0], [-7.5, 10.0]],
  },
  {
    id: "3d-017", name: "Block 31 3D", year: 2003, basin: "Baixo Congo", operator: "BP Angola",
    type: "3d", category: "proprietary", coverage: 5500, coverageUnit: "km²",
    coordinates: [[-7.8, 9.8], [-7.8, 10.5], [-8.5, 10.5], [-8.5, 9.8], [-7.8, 9.8]],
  },
  {
    id: "3d-018", name: "Block 31/14 3D", year: 2021, basin: "Baixo Congo", operator: "PGS",
    type: "3d", category: "proprietary", coverage: 3000, coverageUnit: "km²",
    coordinates: [[-6.5, 10.5], [-6.5, 11.2], [-7.2, 11.2], [-7.2, 10.5], [-6.5, 10.5]],
  },
  // Kwanza Basin
  {
    id: "3d-019", name: "Block 20 3D", year: 2010, basin: "Kwanza", operator: "Sonangol P&P",
    type: "3d", category: "proprietary", coverage: 4100, coverageUnit: "km²",
    coordinates: [[-9.0, 12.2], [-9.0, 12.8], [-9.6, 12.8], [-9.6, 12.2], [-9.0, 12.2]],
  },
  {
    id: "3d-020", name: "Block 21 3D", year: 2006, basin: "Kwanza", operator: "Cobalt International",
    type: "3d", category: "proprietary", coverage: 5200, coverageUnit: "km²",
    coordinates: [[-8.5, 11.5], [-8.5, 12.2], [-9.2, 12.2], [-9.2, 11.5], [-8.5, 11.5]],
  },
  {
    id: "3d-021", name: "Block 22 3D", year: 2008, basin: "Kwanza", operator: "Repsol",
    type: "3d", category: "proprietary", coverage: 3800, coverageUnit: "km²",
    coordinates: [[-9.2, 11.8], [-9.2, 12.5], [-9.8, 12.5], [-9.8, 11.8], [-9.2, 11.8]],
  },
  {
    id: "3d-022", name: "Block 32 3D", year: 2005, basin: "Kwanza", operator: "Total E&P",
    type: "3d", category: "proprietary", coverage: 6200, coverageUnit: "km²",
    coordinates: [[-8.3, 10.0], [-8.3, 10.7], [-9.0, 10.7], [-9.0, 10.0], [-8.3, 10.0]],
  },
  {
    id: "3d-023", name: "Block 33 3D", year: 2007, basin: "Kwanza", operator: "Sonangol P&P",
    type: "3d", category: "proprietary", coverage: 4800, coverageUnit: "km²",
    coordinates: [[-8.8, 10.5], [-8.8, 11.2], [-9.5, 11.2], [-9.5, 10.5], [-8.8, 10.5]],
  },
  {
    id: "3d-024", name: "Block 48 3D", year: 2018, basin: "Kwanza", operator: "Eni Angola",
    type: "3d", category: "proprietary", coverage: 4300, coverageUnit: "km²",
    coordinates: [[-10.0, 11.5], [-10.0, 12.2], [-10.7, 12.2], [-10.7, 11.5], [-10.0, 11.5]],
  },
  {
    id: "3d-025", name: "Kwanza Sul 3D", year: 2010, basin: "Kwanza", operator: "Cobalt International",
    type: "3d", category: "proprietary", coverage: 7800, coverageUnit: "km²",
    coordinates: [[-9.5, 11.0], [-9.5, 12.0], [-10.5, 12.0], [-10.5, 11.0], [-9.5, 11.0]],
  },
  // Namibe Basin
  {
    id: "3d-026", name: "Namibe Offshore 3D", year: 2015, basin: "Namibe", operator: "Repsol",
    type: "3d", category: "proprietary", coverage: 5000, coverageUnit: "km²",
    coordinates: [[-14.0, 11.5], [-14.0, 12.2], [-14.8, 12.2], [-14.8, 11.5], [-14.0, 11.5]],
  },
  {
    id: "3d-027", name: "Namibe Sul 3D", year: 2023, basin: "Namibe", operator: "Sonangol P&P",
    type: "3d", category: "proprietary", coverage: 3900, coverageUnit: "km²",
    coordinates: [[-15.0, 11.2], [-15.0, 11.9], [-15.7, 11.9], [-15.7, 11.2], [-15.0, 11.2]],
  },
  // Cabinda Onshore
  {
    id: "3d-028", name: "Cabinda Norte 3D", year: 2022, basin: "Cabinda Onshore", operator: "Azule Energy",
    type: "3d", category: "proprietary", coverage: 2800, coverageUnit: "km²",
    coordinates: [[-5.0, 12.0], [-5.0, 12.4], [-5.4, 12.4], [-5.4, 12.0], [-5.0, 12.0]],
  },
  {
    id: "3d-029", name: "Block 14 K MC3D", year: 2015, basin: "Baixo Congo", operator: "PGS",
    type: "3d", category: "proprietary", coverage: 4200, coverageUnit: "km²",
    coordinates: [[-5.8, 10.8], [-5.8, 11.5], [-6.5, 11.5], [-6.5, 10.8], [-5.8, 10.8]],
  },
  {
    id: "3d-030", name: "Block 17/06 3D", year: 2010, basin: "Baixo Congo", operator: "Total E&P",
    type: "3d", category: "proprietary", coverage: 2900, coverageUnit: "km²",
    coordinates: [[-7.3, 10.2], [-7.3, 10.7], [-7.8, 10.7], [-7.8, 10.2], [-7.3, 10.2]],
  },
  {
    id: "3d-031", name: "Block 34 3D", year: 2011, basin: "Kwanza", operator: "Sonangol P&P",
    type: "3d", category: "proprietary", coverage: 3200, coverageUnit: "km²",
    coordinates: [[-9.8, 11.0], [-9.8, 11.6], [-10.4, 11.6], [-10.4, 11.0], [-9.8, 11.0]],
  },
  {
    id: "3d-032", name: "Block 35 3D", year: 2012, basin: "Kwanza", operator: "Eni Angola",
    type: "3d", category: "proprietary", coverage: 2700, coverageUnit: "km²",
    coordinates: [[-10.2, 11.3], [-10.2, 11.9], [-10.7, 11.9], [-10.7, 11.3], [-10.2, 11.3]],
  },
  {
    id: "3d-033", name: "Block 36 3D", year: 2013, basin: "Namibe", operator: "Repsol",
    type: "3d", category: "proprietary", coverage: 3500, coverageUnit: "km²",
    coordinates: [[-12.5, 12.0], [-12.5, 12.6], [-13.1, 12.6], [-13.1, 12.0], [-12.5, 12.0]],
  },
  {
    id: "3d-034", name: "Block 37 3D", year: 2014, basin: "Namibe", operator: "Sonangol P&P",
    type: "3d", category: "proprietary", coverage: 4100, coverageUnit: "km²",
    coordinates: [[-13.0, 11.5], [-13.0, 12.2], [-13.7, 12.2], [-13.7, 11.5], [-13.0, 11.5]],
  },
  {
    id: "3d-035", name: "Block 38 3D", year: 2016, basin: "Namibe", operator: "ExxonMobil",
    type: "3d", category: "proprietary", coverage: 3600, coverageUnit: "km²",
    coordinates: [[-13.5, 11.8], [-13.5, 12.4], [-14.1, 12.4], [-14.1, 11.8], [-13.5, 11.8]],
  },
  {
    id: "3d-036", name: "Block 39 3D", year: 2017, basin: "Namibe", operator: "BP Angola",
    type: "3d", category: "proprietary", coverage: 2900, coverageUnit: "km²",
    coordinates: [[-14.5, 11.5], [-14.5, 12.0], [-15.0, 12.0], [-15.0, 11.5], [-14.5, 11.5]],
  },
  {
    id: "3d-037", name: "Block 40 3D", year: 2019, basin: "Namibe", operator: "Total E&P",
    type: "3d", category: "proprietary", coverage: 3300, coverageUnit: "km²",
    coordinates: [[-15.2, 11.0], [-15.2, 11.6], [-15.8, 11.6], [-15.8, 11.0], [-15.2, 11.0]],
  },
  {
    id: "3d-038", name: "Block 46 3D", year: 2020, basin: "Kwanza", operator: "Total E&P",
    type: "3d", category: "proprietary", coverage: 5100, coverageUnit: "km²",
    coordinates: [[-9.0, 10.8], [-9.0, 11.5], [-9.7, 11.5], [-9.7, 10.8], [-9.0, 10.8]],
  },
  {
    id: "3d-039", name: "Block 47 3D", year: 2021, basin: "Kwanza", operator: "Eni Angola",
    type: "3d", category: "proprietary", coverage: 4600, coverageUnit: "km²",
    coordinates: [[-9.5, 10.5], [-9.5, 11.2], [-10.2, 11.2], [-10.2, 10.5], [-9.5, 10.5]],
  },
  {
    id: "3d-040", name: "Block 49 3D", year: 2022, basin: "Namibe", operator: "Sonangol P&P",
    type: "3d", category: "proprietary", coverage: 3100, coverageUnit: "km²",
    coordinates: [[-12.0, 12.2], [-12.0, 12.8], [-12.6, 12.8], [-12.6, 12.2], [-12.0, 12.2]],
  },
];
