export type TeleprompterSegment = {
  id: number;
  start: number;
  end: number;
  kicker: string;
  line: string;
  instruction: string;
  accent: string;
};

export const TELEPROMPTER_TOTAL_SECONDS = 240;
export const TELEPROMPTER_EVENT_SECONDS = 160;

export const teleprompterScript: TeleprompterSegment[] = [
  {
    id: 1,
    start: 0,
    end: 20,
    kicker: "00:00 · THE STARTUP BOTTLENECK",
    line: "Startups are expected to turn messy customer data into a product before they have a large data team. MapAnything gives founders a faster path from unfamiliar data to a customer-ready workflow.",
    instruction: "Look at the camera. Frame the cost of manual labeling, schema alignment, and bespoke models.",
    accent: "#6d8cff",
  },
  {
    id: 2,
    start: 20,
    end: 55,
    kicker: "00:20 · MAPANYTHING CORE",
    line: "This is MapAnything Core, the data alignment layer for startups. I can connect two datasets without requiring perfect labels or shared timestamps and move directly toward a working customer workflow.",
    instruction: "Open Core. Point to both datasets and emphasize that the platform is application-independent.",
    accent: "#52e6b5",
  },
  {
    id: 3,
    start: 55,
    end: 90,
    kicker: "00:55 · MAPPING RESULT",
    line: "The important result is not just a similarity score. It is an inspectable mapping with evidence and confidence that another application can consume.",
    instruction: "Run the mapping. Hover one cluster, show the cross-domain highlight, then pause on the confidence explanation.",
    accent: "#b18cff",
  },
  {
    id: 4,
    start: 90,
    end: 110,
    kicker: "01:30 · SAME CORE, NEW DOMAIN",
    line: "The same Core platform is not specific to trucks. For healthcare, it could surface an early warning and focus a clinician’s inspection on oxygenation or cardiology review.",
    instruction: "Read the healthcare example as synthetic decision support, not diagnosis. Let the early-warning card remain visible.",
    accent: "#d4a4ff",
  },
  {
    id: 5,
    start: 110,
    end: 135,
    kicker: "01:50 · CUSTOMER APPLICATION",
    line: "Fleet is our first customer application built on top of that Core API. A logistics startup can connect truck behavior with maintenance knowledge and launch an agent without rebuilding the data foundation from scratch.",
    instruction: "Open Fleet Agent. Introduce it as the wedge, not the limit of the platform.",
    accent: "#ffb86b",
  },
  {
    id: 6,
    start: 135,
    end: 160,
    kicker: "02:15 · NORMAL OPERATIONS",
    line: "Here is the fleet in normal operation. Each truck has its own route, and the system monitors the incoming telemetry.",
    instruction: "Keep every truck and route visible. Hover only to dim context; click only if you need to focus a truck.",
    accent: "#6d8cff",
  },
  {
    id: 7,
    start: 160,
    end: 205,
    kicker: "02:40 · LIVE EVENT",
    line: "MapAnything has detected an anomaly on truck TX-204. The mapped evidence points to a cooling-system issue, and the agent proposes a targeted reroute.",
    instruction: "At 02:40 the teleprompter injects the live event automatically. Wait for the red notification, then show the mapped explanation and workshop route.",
    accent: "#ff647c",
  },
  {
    id: 8,
    start: 205,
    end: 240,
    kicker: "03:25 · THE VISION",
    line: "Today, this is a focused startup wedge. The larger vision is a reusable data alignment layer for every domain where important datasets do not naturally match. A small team can reuse the same correlation infrastructure across verticals.",
    instruction: "Close on the startup value: less labeling, faster onboarding, and a reusable correlation layer across verticals.",
    accent: "#52e6b5",
  },
];
