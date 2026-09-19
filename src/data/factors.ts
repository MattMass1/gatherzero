import type { Factor } from "../lib/types";

/**
 * Prototype estimates based on published conversion factors and organizer-provided
 * assumptions. Results are intended for scenario comparison, not formal carbon accounting.
 */
export const PROTOTYPE_DISCLAIMER =
  "Prototype estimates based on published conversion factors and organizer-provided assumptions. Results are intended for scenario comparison, not formal carbon accounting.";

/**
 * Single source of truth for GatherZero conversion factors.
 * The impact engine must look up values here — do not hardcode kgCO2e elsewhere.
 */
export const FACTORS: Factor[] = [
  // --- Travel (kg CO2e per passenger-mile) ---
  {
    id: "travel_car",
    category: "travel",
    unit: "kgCO2e / passenger-mile",
    kgCo2ePerUnit: 0.404,
    sourceName: "US EPA — Greenhouse Gas Emissions from a Typical Passenger Vehicle",
    sourceUrl:
      "https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle",
    sourceVersion: "EPA, updated 2024 (≈404 g CO2 per mile, single occupant)",
    note: "Assumes one occupant in an average US gasoline passenger vehicle. Ignores cold starts, congestion, and EV mix.",
  },
  {
    id: "travel_carpool",
    category: "travel",
    unit: "kgCO2e / passenger-mile",
    kgCo2ePerUnit: 0.162,
    sourceName: "US EPA passenger-vehicle factor ÷ assumed 2.5 occupancy",
    sourceUrl:
      "https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle",
    sourceVersion: "Derived from EPA 2024 vehicle factor / 2.5 riders",
    note: "Simple occupancy split of the EPA car factor. Real carpools vary by vehicle and load factor.",
  },
  {
    id: "travel_transit",
    category: "travel",
    unit: "kgCO2e / passenger-mile",
    kgCo2ePerUnit: 0.089,
    sourceName: "US EPA — Emission Factors for Greenhouse Gas Inventories (bus)",
    sourceUrl: "https://www.epa.gov/climateleadership/ghg-emission-factors-hub",
    sourceVersion: "EPA GHG Emission Factors Hub, 2024 (bus passenger-mile order of magnitude)",
    note: "Uses a simplified bus passenger-mile intensity. Local rail/bus grids differ widely.",
  },
  {
    id: "travel_bike_walk",
    category: "travel",
    unit: "kgCO2e / passenger-mile",
    kgCo2ePerUnit: 0,
    sourceName: "Prototype policy — direct operational emissions excluded",
    sourceUrl: "https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle",
    sourceVersion: "GatherZero prototype rule v1",
    note: "Direct tailpipe emissions set to zero for bike/walk. Does not include food-energy or infrastructure.",
  },

  // --- Food (kg CO2e per meal) ---
  {
    id: "food_meat_heavy",
    category: "food",
    unit: "kgCO2e / meal",
    kgCo2ePerUnit: 2.5,
    sourceName: "Our World in Data — Environmental Impacts of Food (Poore & Nemecek synthesis)",
    sourceUrl: "https://ourworldindata.org/environmental-impacts-of-food",
    sourceVersion: "OWID food impacts overview (meal-scale approximation)",
    note: "Rounded meal proxy for a meat-forward plate. Not a recipe-level LCA.",
  },
  {
    id: "food_mixed",
    category: "food",
    unit: "kgCO2e / meal",
    kgCo2ePerUnit: 1.5,
    sourceName: "Our World in Data — Environmental Impacts of Food",
    sourceUrl: "https://ourworldindata.org/environmental-impacts-of-food",
    sourceVersion: "OWID food impacts overview (meal-scale approximation)",
    note: "Midpoint meal proxy between meat-heavy and vegetarian event catering.",
  },
  {
    id: "food_vegetarian",
    category: "food",
    unit: "kgCO2e / meal",
    kgCo2ePerUnit: 0.7,
    sourceName: "Our World in Data — Environmental Impacts of Food",
    sourceUrl: "https://ourworldindata.org/environmental-impacts-of-food",
    sourceVersion: "OWID food impacts overview (meal-scale approximation)",
    note: "Vegetarian meal proxy. Vegan vs dairy-inclusive menus will differ.",
  },

  // --- Materials: water service (kg CO2e per attendee-serving) ---
  {
    id: "water_single_use",
    category: "materials",
    unit: "kgCO2e / attendee-serving",
    kgCo2ePerUnit: 0.082,
    sourceName: "PET bottle LCA literature summarized via EPA waste/materials context",
    sourceUrl: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data",
    sourceVersion: "Order-of-magnitude PET single-serve proxy for prototype",
    note: "Represents a bottled drink serving. Brand, size, and recycled content change results.",
  },
  {
    id: "water_bulk_jugs",
    category: "materials",
    unit: "kgCO2e / attendee-serving",
    kgCo2ePerUnit: 0.02,
    sourceName: "Derived reduction vs single-use PET (shared bulk containers)",
    sourceUrl: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data",
    sourceVersion: "GatherZero prototype derived factor v1",
    note: "Assumes shared jugs amortize packaging across many servings. Transport still matters.",
  },
  {
    id: "water_refill_station",
    category: "materials",
    unit: "kgCO2e / attendee-serving",
    kgCo2ePerUnit: 0.005,
    sourceName: "Derived low packaging intensity for tap/refill service",
    sourceUrl: "https://www.epa.gov/watersense",
    sourceVersion: "GatherZero prototype derived factor v1",
    note: "Near-zero packaging proxy for refill. Excludes cup manufacturing if disposables are still used.",
  },

  // --- Materials: print (kg CO2e per printed page) ---
  {
    id: "print_page",
    category: "materials",
    unit: "kgCO2e / page",
    kgCo2ePerUnit: 0.0047,
    sourceName: "Environmental Paper Network / common office-paper intensity proxies",
    sourceUrl: "https://environmentalpaper.org/",
    sourceVersion: "Office paper per-page order of magnitude for prototype",
    note: "Per sheet of office paper. Print profile in the engine scales how many effective pages count.",
  },

  // --- Waste (kg CO2e per kg waste managed) ---
  {
    id: "waste_landfill",
    category: "waste",
    unit: "kgCO2e / kg waste",
    kgCo2ePerUnit: 0.57,
    sourceName: "US EPA WARM — mixed MSW landfill (simplified)",
    sourceUrl: "https://www.epa.gov/warm",
    sourceVersion: "EPA WARM conceptual intensity (prototype simplification)",
    note: "Mixed waste to landfill proxy. Composition and methane capture change outcomes a lot.",
  },
  {
    id: "waste_recycling",
    category: "waste",
    unit: "kgCO2e / kg waste",
    kgCo2ePerUnit: 0.21,
    sourceName: "US EPA WARM — recycling pathway (simplified credit-aware proxy)",
    sourceUrl: "https://www.epa.gov/warm",
    sourceVersion: "EPA WARM conceptual intensity (prototype simplification)",
    note: "Assumes recyclable-heavy stream. Contamination and local markets are not modeled.",
  },
  {
    id: "waste_recycling_compost",
    category: "waste",
    unit: "kgCO2e / kg waste",
    kgCo2ePerUnit: 0.12,
    sourceName: "US EPA WARM — recycling + compost diversion (simplified)",
    sourceUrl: "https://www.epa.gov/warm",
    sourceVersion: "EPA WARM conceptual intensity (prototype simplification)",
    note: "Best-case diversion proxy when organics and recyclables are separated well.",
  },

  // --- Energy (kg CO2e per kWh) ---
  {
    id: "energy_grid_electricity",
    category: "energy",
    unit: "kgCO2e / kWh",
    kgCo2ePerUnit: 0.39,
    sourceName: "US EPA eGRID — US average electricity CO2e intensity",
    sourceUrl: "https://www.epa.gov/egrid",
    sourceVersion: "eGRID US average order of magnitude (recent annual summary)",
    note: "National average grid mix. A specific venue zip code can be much cleaner or dirtier.",
  },
];

export const FACTORS_BY_ID: Record<string, Factor> = Object.fromEntries(
  FACTORS.map((factor) => [factor.id, factor]),
);

export function getFactor(id: string): Factor {
  const factor = FACTORS_BY_ID[id];
  if (!factor) {
    throw new Error(`Unknown factor id: ${id}`);
  }
  return factor;
}

/** Print profiles scale effective pages counted from organizer-reported pages. */
export const PRINT_PROFILE_MULTIPLIER = {
  paper_heavy: 1,
  limited: 0.5,
  digital_first: 0.15,
} as const;

/** Water service assumes one drink serving per attendee for the event duration proxy. */
export const WATER_FACTOR_IDS = {
  single_use: "water_single_use",
  bulk_jugs: "water_bulk_jugs",
  refill_station: "water_refill_station",
} as const;

export const MEAL_FACTOR_IDS = {
  meat_heavy: "food_meat_heavy",
  mixed: "food_mixed",
  vegetarian: "food_vegetarian",
} as const;

export const TRAVEL_FACTOR_IDS = {
  car: "travel_car",
  carpool: "travel_carpool",
  transit: "travel_transit",
  bike_walk: "travel_bike_walk",
} as const;

export const WASTE_FACTOR_IDS = {
  landfill: "waste_landfill",
  recycling: "waste_recycling",
  recycling_compost: "waste_recycling_compost",
} as const;

export const ENERGY_FACTOR_ID = "energy_grid_electricity";
export const PRINT_FACTOR_ID = "print_page";
