export type TravelMode = "car" | "carpool" | "transit" | "bike_walk";
export type MealProfile = "meat_heavy" | "mixed" | "vegetarian";
export type WaterService = "single_use" | "bulk_jugs" | "refill_station";
export type PrintProfile = "paper_heavy" | "limited" | "digital_first";
export type WasteProfile = "landfill" | "recycling" | "recycling_compost";

export interface EventInputs {
  name: string;
  eventType: string;
  attendees: number;
  durationHours: number;
  averageRoundTripMiles: number;
  travelShares: Record<TravelMode, number>;
  mealsPerAttendee: number;
  mealProfile: MealProfile;
  waterService: WaterService;
  printedPagesPerAttendee: number;
  printProfile: PrintProfile;
  wasteKg: number;
  wasteProfile: WasteProfile;
  electricityKwh: number;
  budgetFlexibility: "none" | "low" | "moderate";
}

export interface Factor {
  id: string;
  category: "travel" | "food" | "materials" | "waste" | "energy";
  unit: string;
  kgCo2ePerUnit: number;
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
  note: string;
}

export interface CategoryImpact {
  category: Factor["category"];
  kgCo2e: number;
  explanation: string;
  factorIds: string[];
}

export interface ImpactResult {
  totalKgCo2e: number;
  perAttendeeKgCo2e: number;
  categories: CategoryImpact[];
  warnings: string[];
}

export interface Scenario {
  id: "lowest_impact" | "lowest_cost" | "balanced";
  title: string;
  inputs: EventInputs;
  impact: ImpactResult;
  estimatedCostLevel: 0 | 1 | 2 | 3;
  changes: string[];
  checklist: string[];
}
