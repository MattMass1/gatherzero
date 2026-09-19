import { describe, expect, it } from "vitest";
import { calculateImpact } from "../lib/calculate-impact";
import { generateScenarios } from "../lib/generate-scenarios";
import type { EventInputs } from "../lib/types";

function improvableEvent(overrides: Partial<EventInputs> = {}): EventInputs {
  return {
    name: "Campus Meetup",
    eventType: "meetup",
    attendees: 100,
    durationHours: 6,
    averageRoundTripMiles: 12,
    travelShares: { car: 70, carpool: 10, transit: 10, bike_walk: 10 },
    mealsPerAttendee: 2,
    mealProfile: "meat_heavy",
    waterService: "single_use",
    printedPagesPerAttendee: 8,
    printProfile: "paper_heavy",
    wasteKg: 50,
    wasteProfile: "landfill",
    electricityKwh: 80,
    budgetFlexibility: "moderate",
    ...overrides,
  };
}

describe("generateScenarios", () => {
  it("returns exactly three scenarios", () => {
    const scenarios = generateScenarios(improvableEvent());
    expect(scenarios).toHaveLength(3);
    expect(scenarios.map((s) => s.id).sort()).toEqual([
      "balanced",
      "lowest_cost",
      "lowest_impact",
    ]);
  });

  it("returns lower impact than baseline when improvement is possible", () => {
    const baseline = improvableEvent();
    const baselineTotal = calculateImpact(baseline).totalKgCo2e;
    const scenarios = generateScenarios(baseline);

    for (const scenario of scenarios) {
      expect(scenario.impact.totalKgCo2e).toBeLessThan(baselineTotal);
    }
  });

  it("gives lowest_impact the smallest total among the three", () => {
    const scenarios = generateScenarios(improvableEvent());
    const lowest = scenarios.find((s) => s.id === "lowest_impact")!;
    for (const scenario of scenarios) {
      expect(lowest.impact.totalKgCo2e).toBeLessThanOrEqual(
        scenario.impact.totalKgCo2e,
      );
    }
  });

  it("keeps lowest_cost within cost levels 0 or 1", () => {
    const lowestCost = generateScenarios(improvableEvent()).find(
      (s) => s.id === "lowest_cost",
    )!;
    expect(lowestCost.estimatedCostLevel).toBeLessThanOrEqual(1);
  });

  it("explains changes in plain language", () => {
    const scenarios = generateScenarios(improvableEvent());
    for (const scenario of scenarios) {
      expect(scenario.changes.length).toBeGreaterThan(0);
      expect(scenario.checklist.length).toBeGreaterThan(0);
      expect(scenario.title.length).toBeGreaterThan(0);
    }
  });

  it("does not mutate the input object", () => {
    const baseline = improvableEvent();
    const snapshot = structuredClone(baseline);
    generateScenarios(baseline);
    expect(baseline).toEqual(snapshot);
  });
});
