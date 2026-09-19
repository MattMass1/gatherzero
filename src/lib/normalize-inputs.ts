import type {
  EventInputs,
  MealProfile,
  PrintProfile,
  TravelMode,
  WasteProfile,
  WaterService,
} from "./types";

type BudgetFlexibility = EventInputs["budgetFlexibility"];

export type RawEventInputs = {
  name?: unknown;
  eventType?: unknown;
  attendees?: unknown;
  durationHours?: unknown;
  averageRoundTripMiles?: unknown;
  travelShares?: unknown;
  mealsPerAttendee?: unknown;
  mealProfile?: unknown;
  waterService?: unknown;
  printedPagesPerAttendee?: unknown;
  printProfile?: unknown;
  wasteKg?: unknown;
  wasteProfile?: unknown;
  electricityKwh?: unknown;
  budgetFlexibility?: unknown;
};

export interface NormalizeResult {
  value?: EventInputs;
  errors: string[];
  warnings: string[];
}

const TRAVEL_MODES: TravelMode[] = ["car", "carpool", "transit", "bike_walk"];

const MEAL_PROFILES: MealProfile[] = ["meat_heavy", "mixed", "vegetarian"];
const WATER_SERVICES: WaterService[] = [
  "single_use",
  "bulk_jugs",
  "refill_station",
];
const PRINT_PROFILES: PrintProfile[] = [
  "paper_heavy",
  "limited",
  "digital_first",
];
const WASTE_PROFILES: WasteProfile[] = [
  "landfill",
  "recycling",
  "recycling_compost",
];
const BUDGET_LEVELS: BudgetFlexibility[] = ["none", "low", "moderate"];

const DEFAULTS = {
  eventType: "general",
  averageRoundTripMiles: 10,
  mealsPerAttendee: 1,
  mealProfile: "mixed" as MealProfile,
  waterService: "single_use" as WaterService,
  printedPagesPerAttendee: 0,
  printProfile: "limited" as PrintProfile,
  wasteKg: 0,
  wasteProfile: "landfill" as WasteProfile,
  electricityKwh: 0,
  budgetFlexibility: "low" as BudgetFlexibility,
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function isOneOf<T extends string>(value: unknown, options: T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function readTravelShares(
  raw: unknown,
  errors: string[],
): Record<TravelMode, number> | null {
  if (raw == null || typeof raw !== "object") {
    errors.push("Travel shares are required and must total 100.");
    return null;
  }

  const record = raw as Record<string, unknown>;
  const shares = {} as Record<TravelMode, number>;

  for (const mode of TRAVEL_MODES) {
    const n = asNumber(record[mode]);
    if (n == null) {
      errors.push(`Travel share for ${mode} must be a number.`);
      return null;
    }
    if (n < 0) {
      errors.push(`Travel share for ${mode} cannot be negative.`);
      return null;
    }
    shares[mode] = Math.round(n);
  }

  const total =
    shares.car + shares.carpool + shares.transit + shares.bike_walk;

  if (total !== 100) {
    errors.push(
      `Travel shares must total 100 (got ${total}). Percentages are whole numbers.`,
    );
    return null;
  }

  return shares;
}

export function normalizeEventInputs(raw: RawEventInputs): NormalizeResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const name = asString(raw.name);
  if (!name) {
    errors.push("Event name is required.");
  }

  let eventType = asString(raw.eventType);
  if (!eventType) {
    eventType = DEFAULTS.eventType;
    warnings.push(`Event type missing; defaulted to "${DEFAULTS.eventType}".`);
  }

  const attendees = asNumber(raw.attendees);
  if (attendees == null) {
    errors.push("Attendees is required.");
  } else if (attendees < 1) {
    errors.push("Attendees must be at least 1.");
  }

  const durationHours = asNumber(raw.durationHours);
  if (durationHours == null) {
    errors.push("Duration is required.");
  } else if (durationHours <= 0) {
    errors.push("Duration must be greater than 0.");
  }

  let averageRoundTripMiles = asNumber(raw.averageRoundTripMiles);
  if (averageRoundTripMiles == null) {
    averageRoundTripMiles = DEFAULTS.averageRoundTripMiles;
    warnings.push(
      `Average round-trip miles missing; defaulted to ${DEFAULTS.averageRoundTripMiles}.`,
    );
  } else if (averageRoundTripMiles < 0) {
    errors.push("Average round-trip miles cannot be negative.");
  }

  const travelShares = readTravelShares(raw.travelShares, errors);

  let mealsPerAttendee = asNumber(raw.mealsPerAttendee);
  if (mealsPerAttendee == null) {
    mealsPerAttendee = DEFAULTS.mealsPerAttendee;
    warnings.push(
      `Meals per attendee missing; defaulted to ${DEFAULTS.mealsPerAttendee}.`,
    );
  } else if (mealsPerAttendee < 0) {
    errors.push("Meals per attendee cannot be negative.");
  }

  let mealProfile: MealProfile = DEFAULTS.mealProfile;
  if (raw.mealProfile == null) {
    warnings.push(`Meal profile missing; defaulted to "${DEFAULTS.mealProfile}".`);
  } else if (isOneOf(raw.mealProfile, MEAL_PROFILES)) {
    mealProfile = raw.mealProfile;
  } else {
    errors.push("Meal profile is invalid.");
  }

  let waterService: WaterService = DEFAULTS.waterService;
  if (raw.waterService == null) {
    warnings.push(
      `Water service missing; defaulted to "${DEFAULTS.waterService}".`,
    );
  } else if (isOneOf(raw.waterService, WATER_SERVICES)) {
    waterService = raw.waterService;
  } else {
    errors.push("Water service is invalid.");
  }

  let printedPagesPerAttendee = asNumber(raw.printedPagesPerAttendee);
  if (printedPagesPerAttendee == null) {
    printedPagesPerAttendee = DEFAULTS.printedPagesPerAttendee;
    warnings.push(
      `Printed pages per attendee missing; defaulted to ${DEFAULTS.printedPagesPerAttendee}.`,
    );
  } else if (printedPagesPerAttendee < 0) {
    errors.push("Printed pages per attendee cannot be negative.");
  }

  let printProfile: PrintProfile = DEFAULTS.printProfile;
  if (raw.printProfile == null) {
    warnings.push(
      `Print profile missing; defaulted to "${DEFAULTS.printProfile}".`,
    );
  } else if (isOneOf(raw.printProfile, PRINT_PROFILES)) {
    printProfile = raw.printProfile;
  } else {
    errors.push("Print profile is invalid.");
  }

  let wasteKg = asNumber(raw.wasteKg);
  if (wasteKg == null) {
    wasteKg = DEFAULTS.wasteKg;
    warnings.push(`Waste kg missing; defaulted to ${DEFAULTS.wasteKg}.`);
  } else if (wasteKg < 0) {
    errors.push("Waste kg cannot be negative.");
  }

  let wasteProfile: WasteProfile = DEFAULTS.wasteProfile;
  if (raw.wasteProfile == null) {
    warnings.push(
      `Waste profile missing; defaulted to "${DEFAULTS.wasteProfile}".`,
    );
  } else if (isOneOf(raw.wasteProfile, WASTE_PROFILES)) {
    wasteProfile = raw.wasteProfile;
  } else {
    errors.push("Waste profile is invalid.");
  }

  let electricityKwh = asNumber(raw.electricityKwh);
  if (electricityKwh == null) {
    electricityKwh = DEFAULTS.electricityKwh;
    warnings.push(
      `Electricity kWh missing; defaulted to ${DEFAULTS.electricityKwh}.`,
    );
  } else if (electricityKwh < 0) {
    errors.push("Electricity kWh cannot be negative.");
  }

  let budgetFlexibility: BudgetFlexibility = DEFAULTS.budgetFlexibility;
  if (raw.budgetFlexibility == null) {
    warnings.push(
      `Budget flexibility missing; defaulted to "${DEFAULTS.budgetFlexibility}".`,
    );
  } else if (isOneOf(raw.budgetFlexibility, BUDGET_LEVELS)) {
    budgetFlexibility = raw.budgetFlexibility;
  } else {
    errors.push("Budget flexibility is invalid.");
  }

  if (errors.length > 0) {
    return { errors, warnings };
  }

  const value: EventInputs = {
    name: name!,
    eventType: eventType!,
    attendees: Math.round(attendees!),
    durationHours: durationHours!,
    averageRoundTripMiles: averageRoundTripMiles!,
    travelShares: travelShares!,
    mealsPerAttendee: mealsPerAttendee!,
    mealProfile,
    waterService,
    printedPagesPerAttendee: printedPagesPerAttendee!,
    printProfile,
    wasteKg: wasteKg!,
    wasteProfile,
    electricityKwh: electricityKwh!,
    budgetFlexibility,
  };

  return { value, errors, warnings };
}
