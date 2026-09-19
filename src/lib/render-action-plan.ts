import { FACTORS, PROTOTYPE_DISCLAIMER } from "../data/factors";
import type { ImpactResult, Scenario } from "./types";

type Args = {
  eventName: string;
  baseline: ImpactResult;
  scenario: Scenario;
};

export function renderActionPlan({
  eventName,
  baseline,
  scenario,
}: Args): string {
  const reduction = baseline.totalKgCo2e - scenario.impact.totalKgCo2e;
  const reductionPct =
    baseline.totalKgCo2e <= 0
      ? 0
      : (reduction / baseline.totalKgCo2e) * 100;

  const topChanges = scenario.changes.slice(0, 3);
  const sources = Array.from(
    new Set(scenario.impact.categories.flatMap((c) => c.factorIds)),
  )
    .map((id) => FACTORS.find((factor) => factor.id === id))
    .filter(Boolean)
    .slice(0, 6);

  return [
    `GatherZero organizer action plan`,
    `Event: ${eventName}`,
    `Selected scenario: ${scenario.title}`,
    ``,
    `Baseline estimate: ${baseline.totalKgCo2e.toFixed(1)} kg CO₂e`,
    `Projected estimate: ${scenario.impact.totalKgCo2e.toFixed(1)} kg CO₂e`,
    `Reduction: ${reduction.toFixed(1)} kg CO₂e (${reductionPct.toFixed(0)}%)`,
    ``,
    `Top changes:`,
    ...topChanges.map((change, index) => `${index + 1}. ${change}`),
    ``,
    `Organizer checklist:`,
    ...scenario.checklist.map((item) => `- [ ] ${item}`),
    ``,
    `Suggested attendee communication:`,
    `"We're hosting ${eventName} with a lower-impact plan (${scenario.title.toLowerCase()}). Expect clearer transit/carpool options, thoughtful catering, and less disposable waste. Small shifts from everyone help us leave less behind."`,
    ``,
    `Sources used in this estimate:`,
    ...sources.map(
      (factor) =>
        `- ${factor!.id}: ${factor!.sourceName} (${factor!.sourceUrl})`,
    ),
    ``,
    PROTOTYPE_DISCLAIMER,
  ].join("\n");
}
