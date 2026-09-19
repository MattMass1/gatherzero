"use client";

import { useMemo, useState } from "react";
import { AssumptionWarnings } from "@/src/components/AssumptionWarnings";
import { CategoryBars } from "@/src/components/CategoryBars";
import { EventForm } from "@/src/components/EventForm";
import { EvidenceDrawer } from "@/src/components/EvidenceDrawer";
import { ImpactSummary } from "@/src/components/ImpactSummary";
import { ScenarioCards } from "@/src/components/ScenarioCards";
import { SAMPLE_EVENTS } from "@/src/data/sample-events";
import { calculateImpact } from "@/src/lib/calculate-impact";
import { generateScenarios } from "@/src/lib/generate-scenarios";
import { normalizeEventInputs } from "@/src/lib/normalize-inputs";
import type { EventInputs, ImpactResult, Scenario } from "@/src/lib/types";

const initialInputs = SAMPLE_EVENTS[0].inputs;

function bootstrap(nextInputs: EventInputs) {
  const normalized = normalizeEventInputs(nextInputs);
  if (!normalized.value) {
    return {
      inputs: nextInputs,
      errors: normalized.errors,
      warnings: normalized.warnings,
      impact: null as ImpactResult | null,
      scenarios: [] as Scenario[],
      selectedId: null as Scenario["id"] | null,
    };
  }
  const baseline = calculateImpact(normalized.value);
  const nextScenarios = generateScenarios(normalized.value);
  return {
    inputs: normalized.value,
    errors: normalized.errors,
    warnings: normalized.warnings,
    impact: baseline,
    scenarios: nextScenarios,
    selectedId:
      nextScenarios.find((s) => s.id === "balanced")?.id ??
      nextScenarios[0]?.id ??
      null,
  };
}

const boot = bootstrap(initialInputs);

export default function Home() {
  const [inputs, setInputs] = useState<EventInputs>(boot.inputs);
  const [errors, setErrors] = useState<string[]>(boot.errors);
  const [warnings, setWarnings] = useState<string[]>(boot.warnings);
  const [impact, setImpact] = useState<ImpactResult | null>(boot.impact);
  const [scenarios, setScenarios] = useState<Scenario[]>(boot.scenarios);
  const [selectedId, setSelectedId] = useState<Scenario["id"] | null>(
    boot.selectedId,
  );
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const selectedScenario = scenarios.find((s) => s.id === selectedId) ?? null;

  const dominantCategory = useMemo(() => {
    const source = selectedScenario?.impact ?? impact;
    if (!source) return "";
    return [...source.categories].sort((a, b) => b.kgCo2e - a.kgCo2e)[0]
      ?.category;
  }, [impact, selectedScenario]);

  const biggestSingleChange = useMemo(() => {
    if (!scenarios.length || !impact) return null;
    const best =
      scenarios.find((s) => s.id === "lowest_impact") ?? scenarios[0];
    return best.changes[0] ?? null;
  }, [scenarios, impact]);

  function runCalculation(nextInputs: EventInputs) {
    const next = bootstrap(nextInputs);
    setErrors(next.errors);
    setWarnings(next.warnings);
    setInputs(next.inputs);
    setImpact(next.impact);
    setScenarios(next.scenarios);
    setSelectedId(next.selectedId);
  }

  function loadSample(id: string) {
    const sample = SAMPLE_EVENTS.find((item) => item.id === id);
    if (!sample) return;
    setExtractMessage(sample.disclaimer);
    runCalculation(sample.inputs);
  }

  async function runExtraction() {
    setExtracting(true);
    setExtractMessage(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        value?: EventInputs;
        warnings?: string[];
      };
      if (!payload.ok || !payload.value) {
        setExtractMessage(
          payload.error ??
            "AI extraction unavailable. Manual entry still works.",
        );
        return;
      }
      setWarnings(payload.warnings ?? []);
      setExtractMessage(
        "Extracted assumptions loaded — review the form, then calculate.",
      );
      runCalculation(payload.value);
    } catch {
      setExtractMessage(
        "AI extraction failed. Use the manual form or a sample event.",
      );
    } finally {
      setExtracting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-800 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-lime-400 text-sm font-semibold text-lime-400">
                G0
              </div>
              <h1 className="text-4xl font-semibold tracking-tight">
                GatherZero
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-neutral-400">
              Plan the event. Cut the footprint.
            </p>
          </div>
          {impact && biggestSingleChange && (
            <p className="max-w-sm text-sm text-neutral-300">
              Biggest lever right now:{" "}
              <span className="text-lime-400">{biggestSingleChange}</span>
            </p>
          )}
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Start from a sample</h2>
          <div className="flex flex-wrap gap-3">
            {SAMPLE_EVENTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample.id)}
                className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-lime-400 hover:text-white"
              >
                {sample.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-neutral-500">
            {SAMPLE_EVENTS[0].disclaimer}
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-neutral-800 p-4">
          <h2 className="text-lg font-medium">Optional: paste a description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Paste a Luma/Eventbrite-style description. AI fills assumptions only — never invents emission factors."
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-lime-400"
          />
          <button
            type="button"
            disabled={extracting}
            onClick={() => void runExtraction()}
            className="rounded-md border border-neutral-600 px-4 py-2 text-sm hover:border-lime-400 disabled:opacity-50"
          >
            {extracting ? "Extracting…" : "Extract assumptions"}
          </button>
          {extractMessage && (
            <p className="text-sm text-neutral-400">{extractMessage}</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Event assumptions</h2>
          <AssumptionWarnings errors={errors} warnings={warnings} />
          <EventForm
            value={inputs}
            onChange={setInputs}
            onSubmit={() => runCalculation(inputs)}
          />
        </section>

        {impact && (
          <>
            <ImpactSummary
              eventName={inputs.name}
              impact={selectedScenario ? selectedScenario.impact : impact}
              dominantCategory={dominantCategory}
              onOpenEvidence={() => setEvidenceOpen(true)}
            />
            {selectedScenario && (
              <p className="text-sm text-neutral-400">
                Comparing{" "}
                <span className="text-lime-400">{selectedScenario.title}</span>{" "}
                against baseline ({impact.totalKgCo2e.toFixed(0)} kg CO₂e).
              </p>
            )}
            <CategoryBars
              categories={
                selectedScenario
                  ? selectedScenario.impact.categories
                  : impact.categories
              }
              highlight={dominantCategory}
            />
            <ScenarioCards
              baseline={impact}
              scenarios={scenarios}
              selectedId={selectedId}
              onSelect={setSelectedId}
              eventName={inputs.name}
            />
          </>
        )}
      </div>

      <EvidenceDrawer
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        impact={selectedScenario?.impact ?? impact}
      />
    </main>
  );
}
