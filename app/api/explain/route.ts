import { NextResponse } from "next/server";

const fallbackExplanation =
  "The live telemetry pattern is associated with historical cooling-system maintenance events. Route this truck for a targeted cooling-system inspection before the next long-haul segment.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ explanation: fallbackExplanation, source: "deterministic-fallback" });
  }

  try {
    const response = await fetch(
      process.env.AI_GATEWAY_BASE_URL ?? "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.AI_GATEWAY_MODEL ?? "openai/gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 120,
          messages: [
            {
              role: "system",
              content:
                "You write concise operational explanations for a fleet dispatcher. Use only the evidence provided. Never claim certainty or invent measurements. Return one or two sentences.",
            },
            {
              role: "user",
              content: JSON.stringify(body),
            },
          ],
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json({ explanation: fallbackExplanation, source: "deterministic-fallback" });
    }

    const result = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const explanation = result.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({
      explanation: explanation || fallbackExplanation,
      source: explanation ? "vercel-ai-gateway" : "deterministic-fallback",
    });
  } catch {
    return NextResponse.json({ explanation: fallbackExplanation, source: "deterministic-fallback" });
  }
}
