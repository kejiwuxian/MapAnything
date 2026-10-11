import { NextResponse } from "next/server";
import type { AnomalyEvent } from "../../../lib/demo-data";

declare global {
  // This intentionally uses process memory for the local startup demo.
  // Production should replace it with Redis, Postgres, or a realtime service.
  var mapAnythingEvent: AnomalyEvent | null | undefined;
}

export async function GET() {
  return NextResponse.json({ event: globalThis.mapAnythingEvent ?? null });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<AnomalyEvent>;
  if (!payload.truckId || !payload.anomalyType) {
    return NextResponse.json({ error: "truckId and anomalyType are required" }, { status: 400 });
  }

  const event: AnomalyEvent = {
    id: `evt_${Date.now()}`,
    truckId: payload.truckId,
    anomalyType: payload.anomalyType,
    severity: payload.severity ?? 0.86,
    detectedAt: new Date().toISOString(),
    source: "operator-console",
  };
  globalThis.mapAnythingEvent = event;
  return NextResponse.json({ event });
}

export async function DELETE() {
  globalThis.mapAnythingEvent = null;
  return NextResponse.json({ event: null });
}
