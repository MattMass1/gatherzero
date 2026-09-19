import { describe, expect, it } from "vitest";
import { calculateImpact } from "../lib/calculate-impact";
import type { EventInputs } from "../lib/types";
import { getFactor } from "../data/factors";

function baseEvent(overrides: Partial<EventInputs> = {}): EventInputs {
  return {
    name: "Test Event",
    eventType: "meetup",
    attendees: 100,
    durationHours: 4,
    averageRoundTripMiles: 10,
    travelShares: { car: 100, carpool: 0, transit: 0, bike_walk: 0 },
    mealsPerAttendee: 0,
    mealProfile: "mixed",
    waterService: "refill_station",
    printedPagesPerAttendee: 0,
    printProfile: "digital_first",
    wasteKg: 0,
    wasteProfile: "landfill",
    electricityKwh: 0,
    budgetFlexibility: "low",
    ...overrides,
  };
}

describe("calculateImpact", () => {
  it("produces only travel impact for a travel-only event", () => {
    const result = calculateImpact(baseEvent());
    const travel = result.categories.find((c) => c.category === "travel")!;
    const others = result.categories.filter((c) => c.category !== "travel");

    expect(travel.kgCo2e).toBeGreaterThan(0);
    for (const category of others) {
      expect(category.kgCo2e).toBe(0);
    }
    expect(result.totalKgCo2e).toBe(travel.kgCo2e);
  });

  it("assigns no direct travel emissions to bike/walk share", () => {
    const allBike = calculateImpact(
      baseEvent({
        travelShares: { car: 0, carpool: 0, transit: 0, bike_walk: 100 },
      }),
    );
    const travel = allBike.categories.find((c) => c.category === "travel")!;
    expect(travel.kgCo2e).toBe(0);
    expect(getFactor("travel_bike_walk").kgCo2ePerUnit).toBe(0);
  });

  it("scales food total with attendees and meals", () => {
    const small = calculateImpact(
      baseEvent({
        attendees: 50,
        mealsPerAttendee: 1,
        mealProfile: "mixed",
        travelShares: { car: 0, carpool: 0, transit: 0, bike_walk: 100 },
      }),
    );
    const large = calculateImpact(
      baseEvent({
        attendees: 100,
        mealsPerAttendee: 2,
        mealProfile: "mixed",
        travelShares: { car: 0, carpool: 0, transit: 0, bike_walk: 100 },
      }),
    );

    const smallFood = small.categories.find((c) => c.category === "food")!.kgCo2e;
    const largeFood = large.categories.find((c) => c.category === "food")!.kgCo2e;
    expect(largeFood).toBeCloseTo(smallFood * 4, 5);
  });

  it("lowers materials impact when switching to refill and digital options", () => {
    const heavy = calculateImpact(
      baseEvent({
        travelShares: { car: 0, carpool: 0, transit: 0, bike_walk: 100 },
        waterService: "single_use",
        printedPagesPerAttendee: 10,
        printProfile: "paper_heavy",
      }),
    );
    const light = calculateImpact(
      baseEvent({
        travelShares: { car: 0, carpool: 0, transit: 0, bike_walk: 100 },
        waterService: "refill_station",
        printedPagesPerAttendee: 10,
        printProfile: "digital_first",
      }),
    );

    const heavyMaterials = heavy.categories.find(
      (c) => c.category === "materials",
    )!.kgCo2e;
    const lightMaterials = light.categories.find(
      (c) => c.category === "materials",
    )!.kgCo2e;
    expect(lightMaterials).toBeLessThan(heavyMaterials);
  });

  it("adds category totals exactly to total impact", () => {
    const result = calculateImpact(
      baseEvent({
        mealsPerAttendee: 2,
        mealProfile: "meat_heavy",
        waterService: "single_use",
        printedPagesPerAttendee: 4,
        printProfile: "limited",
        wasteKg: 40,
        wasteProfile: "recycling",
        electricityKwh: 150,
      }),
    );

    const sum = result.categories.reduce((acc, c) => acc + c.kgCo2e, 0);
    expect(result.totalKgCo2e).toBeCloseTo(sum, 10);
  });

  it("sets per-attendee equal to total divided by attendees", () => {
    const result = calculateImpact(
      baseEvent({
        attendees: 80,
        mealsPerAttendee: 1,
        wasteKg: 20,
        electricityKwh: 50,
      }),
    );
    expect(result.perAttendeeKgCo2e).toBeCloseTo(
      result.totalKgCo2e / 80,
      10,
    );
  });

  it("records factor IDs used in every category", () => {
    const result = calculateImpact(
      baseEvent({
        mealsPerAttendee: 1,
        waterService: "bulk_jugs",
        printedPagesPerAttendee: 2,
        printProfile: "limited",
        wasteKg: 10,
        electricityKwh: 25,
      }),
    );

    for (const category of result.categories) {
      expect(category.factorIds.length).toBeGreaterThan(0);
      expect(category.explanation.length).toBeGreaterThan(0);
    }
  });
});
