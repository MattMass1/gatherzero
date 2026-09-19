import {
  normalizeEventInputs,
  type RawEventInputs,
} from "../normalize-inputs";
import type { EventInputs } from "../types";

const MAX_DESCRIPTION_CHARS = 4000;

export type ExtractResult =
  | {
      ok: true;
      value: EventInputs;
      warnings: string[];
      inferredFields: string[];
    }
  | {
      ok: false;
      error: string;
    };

function buildPrompt(description: string): string {
  return `Extract event logistics only for a sustainability planning tool.
Return JSON with these keys (use null for unknown):
name, eventType, attendees, durationHours, averageRoundTripMiles,
travelShares ({car, carpool, transit, bike_walk} as whole-number percentages totaling 100),
mealsPerAttendee, mealProfile (meat_heavy|mixed|vegetarian),
waterService (single_use|bulk_jugs|refill_station),
printedPagesPerAttendee, printProfile (paper_heavy|limited|digital_first),
wasteKg, wasteProfile (landfill|recycling|recycling_compost),
electricityKwh, budgetFlexibility (none|low|moderate).

Do not estimate emissions. Do not invent source factors.
Description:
"""${description}"""`;
}

export async function extractEventFromDescription(
  description: string,
  options?: { apiKey?: string; fetchImpl?: typeof fetch },
): Promise<ExtractResult> {
  const trimmed = description.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste an event description first." };
  }
  if (trimmed.length > MAX_DESCRIPTION_CHARS) {
    return {
      ok: false,
      error: `Description must be under ${MAX_DESCRIPTION_CHARS} characters.`,
    };
  }

  const apiKey = options?.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "AI extraction is not configured. Use the manual form or a sample event.",
    };
  }

  const fetchImpl = options?.fetchImpl ?? fetch;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(trimmed) }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    return {
      ok: false,
      error: "AI extraction timed out or failed. Manual entry still works.",
    };
  }

  if (response.status === 429) {
    return {
      ok: false,
      error: "AI rate limit hit. Try again later or use the manual form.",
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      error: "AI extraction failed. Manual entry still works.",
    };
  }

  let rawText = "";
  try {
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch {
    return { ok: false, error: "AI returned an unreadable response." };
  }

  let parsed: RawEventInputs;
  try {
    parsed = JSON.parse(rawText) as RawEventInputs;
  } catch {
    return { ok: false, error: "AI returned invalid JSON." };
  }

  const inferredFields = Object.entries(parsed)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key]) => key);

  const normalized = normalizeEventInputs(parsed);
  if (!normalized.value) {
    return {
      ok: false,
      error:
        normalized.errors[0] ??
        "Extracted assumptions failed validation. Edit the form manually.",
    };
  }

  return {
    ok: true,
    value: normalized.value,
    warnings: [
      ...normalized.warnings,
      "Some fields were inferred from the description — review before trusting the estimate.",
    ],
    inferredFields,
  };
}
