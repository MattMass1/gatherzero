import type { ImpactResult } from "@/src/lib/types";
import { PROTOTYPE_DISCLAIMER } from "@/src/data/factors";

type Props = {
  eventName: string;
  impact: ImpactResult;
  dominantCategory: string;
  onOpenEvidence: () => void;
};

export function ImpactSummary({
  eventName,
  impact,
  dominantCategory,
  onOpenEvidence,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Baseline estimate
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{eventName}</h2>
        </div>
        <button
          type="button"
          onClick={onOpenEvidence}
          className="text-sm text-lime-400 underline-offset-4 hover:underline"
        >
          Assumptions and sources
        </button>
      </div>

      <p className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">
        {impact.totalKgCo2e.toFixed(0)}
        <span className="ml-2 text-2xl font-medium text-neutral-400">
          kg CO₂e
        </span>
      </p>
      <p className="text-neutral-300">
        {impact.perAttendeeKgCo2e.toFixed(2)} kg CO₂e per attendee · Largest
        source: <span className="text-lime-400">{dominantCategory}</span>
      </p>
      <p className="max-w-3xl text-sm text-neutral-500">{PROTOTYPE_DISCLAIMER}</p>
    </section>
  );
}
