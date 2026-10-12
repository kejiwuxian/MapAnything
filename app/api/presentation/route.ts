import { NextResponse } from "next/server";

type PresentationCommand =
  | { type: "navigate"; path: string }
  | { type: "run-core" };

type PresentationEnvelope = PresentationCommand & { id: string; sentAt: number };

declare global {
  // This intentionally uses process memory for the local startup demo.
  // Production should replace it with Redis, Postgres, or a realtime service.
  var mapAnythingPresentationCommand: PresentationEnvelope | null | undefined;
}

export async function GET(request: Request) {
  const since = new URL(request.url).searchParams.get("since");
  const command = globalThis.mapAnythingPresentationCommand ?? null;
  return NextResponse.json({ command: command && command.id !== since ? command : null });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<PresentationEnvelope>;
  if (payload.type !== "navigate" && payload.type !== "run-core") {
    return NextResponse.json({ error: "A valid presentation command is required" }, { status: 400 });
  }
  const id = typeof payload.id === "string" ? payload.id : `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const sentAt = typeof payload.sentAt === "number" ? payload.sentAt : Date.now();
  let command: PresentationEnvelope;
  if (payload.type === "navigate") {
    if (typeof payload.path !== "string") {
      return NextResponse.json({ error: "A navigation path is required" }, { status: 400 });
    }
    command = { type: "navigate", path: payload.path, id, sentAt };
  } else {
    command = { type: "run-core", id, sentAt };
  }
  globalThis.mapAnythingPresentationCommand = command;
  return NextResponse.json({ command });
}
