import type { ImpactResult, Scenario } from "@/src/lib/types";
import { renderActionPlan } from "@/src/lib/render-action-plan";

type Props = {
  baseline: ImpactResult;
  scenarios: Scenario[];
  selectedId: Scenario["id"] | null;
  onSelect: (id: Scenario["id"]) => void;
  eventName: string;
};

function costLabel(level: number): string {
  return ["Free / behavioral", "Low cost", "Moderate cost", "Higher cost"][
    level
  ];
}

export function ScenarioCards({
  baseline,
  scenarios,
  selectedId,
  onSelect,
  eventName,
}: Props) {
  async function copyPlan(scenario: Scenario) {
    const text = renderActionPlan({
      eventName,
      baseline,
      scenario,
    });
    await navigator.clipboard.writeText(text);
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-white">Three optimized plans</h3>
        <p className="text-sm text-neutral-400">
          Same calculator, different change sets. Select one to compare.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const reduction =
            baseline.totalKgCo2e <= 0
              ? 0
              : ((baseline.totalKgCo2e - scenario.impact.totalKgCo2e) /
                  baseline.totalKgCo2e) *
                100;
          const selected = selectedId === scenario.id;

          return (
            <article
              key={scenario.id}
              className={`flex flex-col gap-3 rounded-xl border p-4 ${
                selected
                  ? "border-lime-400 bg-lime-400/5"
                  : "border-neutral-800 bg-neutral-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-lg font-semibold text-white">
                  {scenario.title}
                </h4>
                <span className="text-sm text-lime-400">
                  −{reduction.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-neutral-400">
                {scenario.impact.totalKgCo2e.toFixed(0)} kg CO₂e ·{" "}
                {costLabel(scenario.estimatedCostLevel)}
              </p>
              <ul className="space-y-1 text-sm text-neutral-300">
                {scenario.changes.slice(0, 4).map((change) => (
                  <li key={change}>• {change}</li>
                ))}
              </ul>
              <ul className="space-y-1 border-t border-neutral-800 pt-3 text-sm text-neutral-400">
                {scenario.checklist.slice(0, 3).map((item) => (
                  <li key={item}>☐ {item}</li>
                ))}
              </ul>
              <div className="mt-auto flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onSelect(scenario.id)}
                  className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-white hover:border-lime-400"
                >
                  Compare
                </button>
                <button
                  type="button"
                  onClick={() => void copyPlan(scenario)}
                  className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-white"
                >
                  Copy plan
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
