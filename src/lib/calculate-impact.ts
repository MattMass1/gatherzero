import {
  ENERGY_FACTOR_ID,
  MEAL_FACTOR_IDS,
  PRINT_FACTOR_ID,
  PRINT_PROFILE_MULTIPLIER,
  TRAVEL_FACTOR_IDS,
  WASTE_FACTOR_IDS,
  WATER_FACTOR_IDS,
  getFactor,
} from "../data/factors";
import type {
  CategoryImpact,
  EventInputs,
  Factor,
  ImpactResult,
  TravelMode,
} from "./types";

function roundKg(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function categoryImpact(
  category: Factor["category"],
  kgCo2e: number,
  explanation: string,
  factorIds: string[],
): CategoryImpact {
  return {
    category,
    kgCo2e: roundKg(kgCo2e),
    explanation,
    factorIds,
  };
}

function travelImpact(inputs: EventInputs): CategoryImpact {
  const modes = Object.keys(TRAVEL_FACTOR_IDS) as TravelMode[];
  const factorIds: string[] = [];
  let total = 0;

  for (const mode of modes) {
    const share = inputs.travelShares[mode] / 100;
    if (share <= 0) continue;
    const factorId = TRAVEL_FACTOR_IDS[mode];
    const factor = getFactor(factorId);
    factorIds.push(factorId);
    total +=
      inputs.attendees *
      inputs.averageRoundTripMiles *
      share *
      factor.kgCo2ePerUnit;
  }

  if (factorIds.length === 0) {
    factorIds.push(TRAVEL_FACTOR_IDS.bike_walk);
  }

  return categoryImpact(
    "travel",
    total,
    `Attendee travel across reported modes for ${inputs.averageRoundTripMiles} average round-trip miles.`,
    factorIds,
  );
}

function foodImpact(inputs: EventInputs): CategoryImpact {
  const factorId = MEAL_FACTOR_IDS[inputs.mealProfile];
  const factor = getFactor(factorId);
  const meals = inputs.attendees * inputs.mealsPerAttendee;
  const total = meals * factor.kgCo2ePerUnit;

  return categoryImpact(
    "food",
    total,
    `${meals} meals using the ${inputs.mealProfile.replace("_", " ")} profile.`,
    [factorId],
  );
}

function materialsImpact(inputs: EventInputs): CategoryImpact {
  const waterFactorId = WATER_FACTOR_IDS[inputs.waterService];
  const waterFactor = getFactor(waterFactorId);
  // Prototype: drink servings track with catering. No meals ⇒ no water materials.
  const drinkServings =
    inputs.mealsPerAttendee > 0 ? inputs.attendees : 0;
  const waterTotal = drinkServings * waterFactor.kgCo2ePerUnit;

  const printFactor = getFactor(PRINT_FACTOR_ID);
  const multiplier = PRINT_PROFILE_MULTIPLIER[inputs.printProfile];
  const effectivePages =
    inputs.attendees * inputs.printedPagesPerAttendee * multiplier;
  const printTotal = effectivePages * printFactor.kgCo2ePerUnit;

  return categoryImpact(
    "materials",
    waterTotal + printTotal,
    `Water service (${inputs.waterService.replaceAll("_", " ")}) plus ${inputs.printProfile.replaceAll("_", " ")} printing.`,
    [waterFactorId, PRINT_FACTOR_ID],
  );
}

function wasteImpact(inputs: EventInputs): CategoryImpact {
  const factorId = WASTE_FACTOR_IDS[inputs.wasteProfile];
  const factor = getFactor(factorId);
  const total = inputs.wasteKg * factor.kgCo2ePerUnit;

  return categoryImpact(
    "waste",
    total,
    `${inputs.wasteKg} kg managed via ${inputs.wasteProfile.replaceAll("_", " ")}.`,
    [factorId],
  );
}

function energyImpact(inputs: EventInputs): CategoryImpact {
  const factor = getFactor(ENERGY_FACTOR_ID);
  const total = inputs.electricityKwh * factor.kgCo2ePerUnit;

  return categoryImpact(
    "energy",
    total,
    `${inputs.electricityKwh} kWh on the average grid intensity.`,
    [ENERGY_FACTOR_ID],
  );
}

export function calculateImpact(inputs: EventInputs): ImpactResult {
  const categories = [
    travelImpact(inputs),
    foodImpact(inputs),
    materialsImpact(inputs),
    wasteImpact(inputs),
    energyImpact(inputs),
  ];

  const totalKgCo2e = roundKg(
    categories.reduce((sum, category) => sum + category.kgCo2e, 0),
  );

  const warnings: string[] = [];
  if (inputs.mealsPerAttendee === 0) {
    warnings.push("No meals reported; food impact is zero.");
  }
  if (inputs.electricityKwh === 0) {
    warnings.push("No electricity reported; energy impact is zero.");
  }

  return {
    totalKgCo2e,
    perAttendeeKgCo2e: roundKg(totalKgCo2e / inputs.attendees),
    categories,
    warnings,
  };
}
