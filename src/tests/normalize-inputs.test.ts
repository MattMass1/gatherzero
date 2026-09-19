import { describe, expect, it } from "vitest";
import { normalizeEventInputs } from "../lib/normalize-inputs";

const validRaw = {
  name: "Bay Hacks",
  eventType: "hackathon",
  attendees: 120,
  durationHours: 24,
  averageRoundTripMiles: 18,
  travelShares: { car: 50, carpool: 20, transit: 20, bike_walk: 10 },
  mealsPerAttendee: 3,
  mealProfile: "mixed",
  waterService: "single_use",
  printedPagesPerAttendee: 5,
  printProfile: "paper_heavy",
  wasteKg: 80,
  wasteProfile: "landfill",
  electricityKwh: 200,
  budgetFlexibility: "low",
};

describe("normalizeEventInputs", () => {
  it("accepts a fully valid payload", () => {
    const result = normalizeEventInputs(validRaw);
    expect(result.errors).toEqual([]);
    expect(result.value).toMatchObject({
      name: "Bay Hacks",
      attendees: 120,
      travelShares: { car: 50, carpool: 20, transit: 20, bike_walk: 10 },
    });
  });

  it("rejects travel shares that do not total 100", () => {
    const result = normalizeEventInputs({
      ...validRaw,
      travelShares: { car: 40, carpool: 20, transit: 20, bike_walk: 10 },
    });
    expect(result.value).toBeUndefined();
    expect(result.errors.some((e) => /travel/i.test(e) && /100/i.test(e))).toBe(
      true,
    );
  });

  it("normalizes near-100 travel shares that round to 100", () => {
    const result = normalizeEventInputs({
      ...validRaw,
      travelShares: { car: 50, carpool: 20, transit: 20, bike_walk: 10 },
    });
    expect(result.errors).toEqual([]);
    const shares = result.value!.travelShares;
    expect(shares.car + shares.carpool + shares.transit + shares.bike_walk).toBe(
      100,
    );
  });

  it("rejects attendees below 1", () => {
    const result = normalizeEventInputs({ ...validRaw, attendees: 0 });
    expect(result.value).toBeUndefined();
    expect(result.errors.some((e) => /attendee/i.test(e))).toBe(true);
  });

  it("rejects duration that is not greater than 0", () => {
    const result = normalizeEventInputs({ ...validRaw, durationHours: 0 });
    expect(result.value).toBeUndefined();
    expect(result.errors.some((e) => /duration/i.test(e))).toBe(true);
  });

  it("rejects negative numeric activity values", () => {
    const cases = [
      { averageRoundTripMiles: -1 },
      { mealsPerAttendee: -1 },
      { wasteKg: -1 },
      { electricityKwh: -1 },
      { printedPagesPerAttendee: -1 },
    ] as const;

    for (const patch of cases) {
      const result = normalizeEventInputs({ ...validRaw, ...patch });
      expect(result.value).toBeUndefined();
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("allows zero for printing, waste, electricity, and meals", () => {
    const result = normalizeEventInputs({
      ...validRaw,
      mealsPerAttendee: 0,
      printedPagesPerAttendee: 0,
      wasteKg: 0,
      electricityKwh: 0,
    });
    expect(result.errors).toEqual([]);
    expect(result.value).toMatchObject({
      mealsPerAttendee: 0,
      printedPagesPerAttendee: 0,
      wasteKg: 0,
      electricityKwh: 0,
    });
  });

  it("fills documented defaults for missing optional values and warns", () => {
    const result = normalizeEventInputs({
      name: "Community Market",
      attendees: 200,
      durationHours: 6,
      travelShares: { car: 60, carpool: 10, transit: 20, bike_walk: 10 },
    });
    expect(result.errors).toEqual([]);
    expect(result.value).toBeDefined();
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.value!.mealProfile).toBe("mixed");
    expect(result.value!.waterService).toBe("single_use");
    expect(result.value!.printProfile).toBe("limited");
    expect(result.value!.wasteProfile).toBe("landfill");
    expect(result.value!.budgetFlexibility).toBe("low");
  });
});
