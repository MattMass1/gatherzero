import { extractEventFromDescription } from "@/src/lib/ai/extract-event";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { description?: string };
  try {
    body = (await request.json()) as { description?: string };
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const result = await extractEventFromDescription(body.description ?? "", {
    apiKey: process.env.GEMINI_API_KEY,
  });

  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
