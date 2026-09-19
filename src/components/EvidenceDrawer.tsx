import { FACTORS, PROTOTYPE_DISCLAIMER } from "@/src/data/factors";
import type { ImpactResult } from "@/src/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  impact: ImpactResult | null;
};

export function EvidenceDrawer({ open, onClose, impact }: Props) {
  if (!open) return null;

  const usedIds = new Set(
    impact?.categories.flatMap((category) => category.factorIds) ?? [],
  );
  const factors = FACTORS.filter((factor) => usedIds.has(factor.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <button
        type="button"
        aria-label="Close evidence drawer"
        className="flex-1"
        onClick={onClose}
      />
      <aside className="flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Assumptions and sources
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              {PROTOTYPE_DISCLAIMER}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <ul className="space-y-4">
          {factors.map((factor) => (
            <li
              key={factor.id}
              className="rounded-lg border border-neutral-800 p-4"
            >
              <p className="text-sm uppercase tracking-wide text-lime-400">
                {factor.category}
              </p>
              <p className="mt-1 font-medium text-white">{factor.id}</p>
              <p className="mt-1 text-sm text-neutral-300">
                {factor.kgCo2ePerUnit} {factor.unit}
              </p>
              <p className="mt-2 text-sm text-neutral-400">{factor.note}</p>
              <p className="mt-2 text-sm text-neutral-500">
                {factor.sourceName} · {factor.sourceVersion}
              </p>
              <a
                href={factor.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-lime-400 hover:underline"
              >
                Open source
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
