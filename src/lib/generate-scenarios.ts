import { calculateImpact } from "./calculate-impact";
import type {
  EventInputs,
  MealProfile,
  PrintProfile,
  Scenario,
  TravelMode,
  WasteProfile,
  WaterService,
} from "./types";

type CostLevel = 0 | 1 | 2 | 3;

interface AxisChoice {
  key: string;
  label: string;
  costLevel: CostLevel;
  checklist: string[];
  apply: (inputs: EventInputs) => void;
}

interface Candidate {
  inputs: EventInputs;
  impactTotal: number;
  costLevel: CostLevel;
  changeLabels: string[];
  checklist: string[];
  fingerprint: string;
}

const TRAVEL_OPTIONS: AxisChoice[] = [
  {
    key: "travel_baseline",
    label: "Keep current travel mix",
    costLevel: 0,
    checklist: [],
    apply: () => undefined,
  },
  {
    key: "travel_carpool_push",
    label: "Shift solo driving into carpools",
    costLevel: 0,
    checklist: ["Share a carpool signup link in the event page and reminder email."],
    apply: (inputs) => {
      inputs.travelShares = {
        car: 40,
        carpool: 35,
        transit: 15,
        bike_walk: 10,
      };
    },
  },
  {
    key: "travel_transit_push",
    label: "Prioritize transit and shared rides",
    costLevel: 1,
    checklist: [
      "Publish transit directions and offer a small transit stipend or validated parking tradeoff.",
    ],
    apply: (inputs) => {
      inputs.travelShares = {
        car: 25,
        carpool: 25,
        transit: 35,
        bike_walk: 15,
      };
    },
  },
  {
    key: "travel_active_push",
    label: "Maximize bike, walk, and transit",
    costLevel: 2,
    checklist: [
      "Add bike parking, walking routes, and a no-solo-drive default in registration.",
    ],
    apply: (inputs) => {
      inputs.travelShares = {
        car: 10,
        carpool: 20,
        transit: 40,
        bike_walk: 30,
      };
    },
  },
];

const FOOD_OPTIONS: AxisChoice[] = [
  {
    key: "food_baseline",
    label: "Keep current meal profile",
    costLevel: 0,
    checklist: [],
    apply: () => undefined,
  },
  {
    key: "food_mixed",
    label: "Move catering to a mixed menu",
    costLevel: 0,
    checklist: ["Ask the caterer for a mixed menu with smaller meat portions."],
    apply: (inputs) => {
      inputs.mealProfile = "mixed";
    },
  },
  {
    key: "food_vegetarian",
    label: "Default to vegetarian catering",
    costLevel: 1,
    checklist: ["Make vegetarian the default and offer meat as an opt-in."],
    apply: (inputs) => {
      inputs.mealProfile = "vegetarian";
    },
  },
];

const WATER_OPTIONS: AxisChoice[] = [
  {
    key: "water_baseline",
    label: "Keep current water service",
    costLevel: 0,
    checklist: [],
    apply: () => undefined,
  },
  {
    key: "water_bulk",
    label: "Switch bottled drinks to bulk jugs",
    costLevel: 1,
    checklist: ["Replace single-use bottles with bulk water jugs and compostable cups if needed."],
    apply: (inputs) => {
      inputs.waterService = "bulk_jugs";
    },
  },
  {
    key: "water_refill",
    label: "Add refill stations",
    costLevel: 2,
    checklist: ["Provide refill stations and ask attendees to bring bottles."],
    apply: (inputs) => {
      inputs.waterService = "refill_station";
    },
  },
];

const PRINT_OPTIONS: AxisChoice[] = [
  {
    key: "print_baseline",
    label: "Keep current print profile",
    costLevel: 0,
    checklist: [],
    apply: () => undefined,
  },
  {
    key: "print_limited",
    label: "Cut printing to limited essentials",
    costLevel: 0,
    checklist: ["Print only wayfinding and legal notices; move schedules to QR codes."],
    apply: (inputs) => {
      inputs.printProfile = "limited";
      inputs.printedPagesPerAttendee = Math.min(inputs.printedPagesPerAttendee, 2);
    },
  },
  {
    key: "print_digital",
    label: "Go digital-first",
    costLevel: 1,
    checklist: ["Use a digital program and badge QR codes instead of paper handouts."],
    apply: (inputs) => {
      inputs.printProfile = "digital_first";
      inputs.printedPagesPerAttendee = Math.min(inputs.printedPagesPerAttendee, 1);
    },
  },
];

const WASTE_OPTIONS: AxisChoice[] = [
  {
    key: "waste_baseline",
    label: "Keep current waste profile",
    costLevel: 0,
    checklist: [],
    apply: () => undefined,
  },
  {
    key: "waste_recycling",
    label: "Add recycling stations",
    costLevel: 1,
    checklist: ["Place labeled recycling bins at food and registration areas."],
    apply: (inputs) => {
      inputs.wasteProfile = "recycling";
    },
  },
  {
    key: "waste_compost",
    label: "Add recycling and compost",
    costLevel: 2,
    checklist: ["Contract organics pickup and brief volunteers on sorting."],
    apply: (inputs) => {
      inputs.wasteProfile = "recycling_compost";
    },
  },
];

function cloneInputs(inputs: EventInputs): EventInputs {
  return {
    ...inputs,
    travelShares: { ...inputs.travelShares },
  };
}

function fingerprint(inputs: EventInputs): string {
  return JSON.stringify({
    travelShares: inputs.travelShares,
    mealProfile: inputs.mealProfile,
    waterService: inputs.waterService,
    printProfile: inputs.printProfile,
    printedPagesPerAttendee: inputs.printedPagesPerAttendee,
    wasteProfile: inputs.wasteProfile,
  });
}

function maxCost(levels: CostLevel[]): CostLevel {
  return Math.max(...levels) as CostLevel;
}

function buildCandidates(baseline: EventInputs): Candidate[] {
  const candidates: Candidate[] = [];

  for (const travel of TRAVEL_OPTIONS) {
    for (const food of FOOD_OPTIONS) {
      for (const water of WATER_OPTIONS) {
        for (const print of PRINT_OPTIONS) {
          for (const waste of WASTE_OPTIONS) {
            const choices = [travel, food, water, print, waste];
            const inputs = cloneInputs(baseline);
            for (const choice of choices) {
              choice.apply(inputs);
            }

            const changeLabels = choices
              .filter((choice) => !choice.key.endsWith("_baseline"))
              .map((choice) => choice.label);
            const checklist = choices.flatMap((choice) => choice.checklist);
            const costLevel = maxCost(choices.map((choice) => choice.costLevel));
            const impactTotal = calculateImpact(inputs).totalKgCo2e;

            candidates.push({
              inputs,
              impactTotal,
              costLevel,
              changeLabels:
                changeLabels.length > 0
                  ? changeLabels
                  : ["No operational changes from the current plan"],
              checklist:
                checklist.length > 0
                  ? checklist
                  : ["Re-check assumptions before locking vendors."],
              fingerprint: fingerprint(inputs),
            });
          }
        }
      }
    }
  }

  return candidates;
}

function pickDistinct(
  ranked: Candidate[],
  used: Set<string>,
): Candidate | undefined {
  for (const candidate of ranked) {
    if (!used.has(candidate.fingerprint)) {
      return candidate;
    }
  }
  return ranked[0];
}

function toScenario(
  id: Scenario["id"],
  title: string,
  candidate: Candidate,
): Scenario {
  return {
    id,
    title,
    inputs: candidate.inputs,
    impact: calculateImpact(candidate.inputs),
    estimatedCostLevel: candidate.costLevel,
    changes: candidate.changeLabels,
    checklist: candidate.checklist,
  };
}

export function generateScenarios(baseline: EventInputs): Scenario[] {
  const baselineTotal = calculateImpact(baseline).totalKgCo2e;
  const candidates = buildCandidates(baseline);

  const byLowestImpact = [...candidates].sort(
    (a, b) => a.impactTotal - b.impactTotal || a.costLevel - b.costLevel,
  );

  const byLowestCost = candidates
    .filter((candidate) => candidate.costLevel <= 1)
    .sort(
      (a, b) =>
        baselineTotal - b.impactTotal - (baselineTotal - a.impactTotal) ||
        a.costLevel - b.costLevel ||
        a.impactTotal - b.impactTotal,
    );

  const costPenaltyKg = Math.max(baselineTotal * 0.04, 15);
  const byBalanced = [...candidates].sort((a, b) => {
    const scoreA = baselineTotal - a.impactTotal - a.costLevel * costPenaltyKg;
    const scoreB = baselineTotal - b.impactTotal - b.costLevel * costPenaltyKg;
    return scoreB - scoreA || a.impactTotal - b.impactTotal;
  });

  const used = new Set<string>();
  const lowestImpact = pickDistinct(byLowestImpact, used)!;
  used.add(lowestImpact.fingerprint);

  const lowestCost = pickDistinct(
    byLowestCost.length > 0 ? byLowestCost : byLowestImpact,
    used,
  )!;
  used.add(lowestCost.fingerprint);

  const balanced = pickDistinct(byBalanced, used)!;

  return [
    toScenario("lowest_impact", "Lowest impact", lowestImpact),
    toScenario("lowest_cost", "Lowest-cost improvement", lowestCost),
    toScenario("balanced", "Balanced plan", balanced),
  ];
}

// Re-export axis value types so tests/UI can reference allowed profiles if needed.
export type ScenarioAxisValue =
  | TravelMode
  | MealProfile
  | WaterService
  | PrintProfile
  | WasteProfile;
