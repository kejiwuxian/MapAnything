export type PresentationCommand =
  | { type: "navigate"; path: string }
  | { type: "run-core" };

type PresentationEnvelope = PresentationCommand & { id: string; sentAt: number };

const CHANNEL_NAME = "mapanything-presentation";
const STORAGE_KEY = "mapanything-presentation-command";

function commandId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function sendPresentationCommand(command: PresentationCommand) {
  if (typeof window === "undefined") return;
  const envelope: PresentationEnvelope = { ...command, id: commandId(), sentAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage can be unavailable in a restricted browser context; BroadcastChannel may still work.
  }
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(envelope);
    channel.close();
  }
}

export function listenForPresentationCommands(handler: (command: PresentationCommand) => void) {
  if (typeof window === "undefined") return () => undefined;
  const seen = new Set<string>();
  const consume = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    const envelope = value as Partial<PresentationEnvelope>;
    if (!envelope.id || seen.has(envelope.id) || (envelope.type !== "navigate" && envelope.type !== "run-core")) return;
    seen.add(envelope.id);
    if (envelope.type === "navigate" && typeof envelope.path === "string") handler({ type: "navigate", path: envelope.path });
    if (envelope.type === "run-core") handler({ type: "run-core" });
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      consume(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed cross-tab messages.
    }
  };
  window.addEventListener("storage", onStorage);
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
  if (channel) channel.addEventListener("message", (event) => consume(event.data));
  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}
