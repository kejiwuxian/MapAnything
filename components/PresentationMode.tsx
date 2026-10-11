"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Slide = {
  kicker: string;
  title: React.ReactNode;
  body: string;
  cue: string;
  time: string;
  accent: string;
  proof?: string[];
  action?: { label: string; path: string };
};

const slides: Slide[] = [
  {
    kicker: "00:00 · THE STARTUP BOTTLENECK",
    title: <>Ship before<br /><em>data is perfect.</em></>,
    body: "Startups are expected to turn messy customer data into a product before they have a large data team. Every new vertical can create another labeling and custom-modeling project.",
    cue: "Startups are expected to turn messy customer data into a product before they have a large data team. MapAnything gives founders a faster path from unfamiliar data to a customer-ready workflow.",
    time: "0:20",
    accent: "#6d8cff",
    proof: ["manual labeling", "schema alignment", "custom models"],
  },
  {
    kicker: "00:20 · MAPANYTHING CORE",
    title: <>One startup layer.<br /><em>Many verticals.</em></>,
    body: "Connect two datasets without requiring perfect labels or shared timestamps. MapAnything helps a lean team get to a customer-ready workflow before building a bespoke model.",
    cue: "This is MapAnything Core, the data alignment layer for startups. I can connect two datasets without requiring perfect labels or shared timestamps and move directly toward a working customer workflow.",
    time: "0:35",
    accent: "#52e6b5",
    proof: ["telemetry", "text records", "reusable API"],
    action: { label: "Open Core demo", path: "/" },
  },
  {
    kicker: "00:55 · MAPPING RESULT",
    title: <>See what was<br /><em>never labeled.</em></>,
    body: "Latent behaviors in one dataset become inspectable concepts in another. Hover a cluster to reveal its cross-domain evidence and confidence.",
    cue: "The important result is not just a similarity score. It is an inspectable mapping with evidence and confidence that another application can consume.",
    time: "0:35",
    accent: "#b18cff",
    proof: ["3D vector spaces", "cross-highlighting", "evidence + confidence"],
    action: { label: "Return to Core demo", path: "/" },
  },
  {
    kicker: "01:30 · SAME CORE, NEW DOMAIN",
    title: <>Healthcare,<br /><em>without a new model.</em></>,
    body: "Live wearable signals can be connected to delayed medical reports to surface early warnings and focus clinical inspection. This is synthetic decision support, not diagnosis.",
    cue: "The same Core platform is not specific to trucks. For healthcare, it could surface an early warning and focus a clinician’s inspection on oxygenation or cardiology review.",
    time: "0:20",
    accent: "#d4a4ff",
    proof: ["wearable signals", "delayed reports", "inspection focus"],
  },
  {
    kicker: "01:50 · CUSTOMER APPLICATION",
    title: <>Fleet is the wedge.<br /><em>The layer scales.</em></>,
    body: "Fleet Agent is one customer solution built on top of the reusable mapping layer. It lets a small logistics team turn mapped telemetry into an operational product.",
    cue: "Fleet is our first customer application built on top of that Core API. A logistics startup can connect truck behavior with maintenance knowledge and launch an agent without rebuilding the data foundation from scratch.",
    time: "0:25",
    accent: "#ffb86b",
    proof: ["truck telemetry", "maintenance knowledge", "route planning"],
    action: { label: "Open Fleet Agent", path: "/fleet" },
  },
  {
    kicker: "02:15 · NORMAL OPERATIONS",
    title: <>From signal<br /><em>to route.</em></>,
    body: "The Fleet Agent monitors live-style telemetry across a fleet, keeps normal routes visible, and waits for a meaningful event.",
    cue: "Here is the fleet in normal operation. Each truck has its own route, and the system monitors the incoming telemetry.",
    time: "0:25",
    accent: "#6d8cff",
    proof: ["live monitoring", "route context", "dimmed fleet view"],
    action: { label: "Show Fleet Agent", path: "/fleet" },
  },
  {
    kicker: "02:40 · LIVE EVENT",
    title: <>Anomaly detected.<br /><em>Action recommended.</em></>,
    body: "An off-stage operator injects a telemetry event. The on-stage Fleet Agent receives it as a live notification, highlights the truck, explains the mapped issue, and proposes a targeted workshop stop.",
    cue: "MapAnything has detected an anomaly on truck TX-204. The mapped evidence points to a cooling-system issue, and the agent proposes a targeted reroute.",
    time: "0:45",
    accent: "#ff647c",
    proof: ["live notification", "mapped explanation", "targeted reroute"],
    action: { label: "Show live Fleet state", path: "/fleet" },
  },
  {
    kicker: "03:25 · THE VISION",
    title: <>Unmatched data<br /><em>becomes action.</em></>,
    body: "MapAnything turns a repeated, multi-week labeling and custom-modeling loop into a minutes-long first-pass mapping workflow. Fleet is the wedge; the correlation layer is reusable across domains.",
    cue: "Today, this is a focused startup wedge. The larger vision is a reusable data alignment layer for every domain where important datasets do not naturally match. A small team can reuse the same correlation infrastructure across verticals.",
    time: "0:35",
    accent: "#52e6b5",
    proof: ["less labeling", "faster onboarding", "contrastive-learning roadmap"],
  },
];

function readSlideParam(max: number) {
  if (typeof window === "undefined") return 0;
  const value = Number(new URLSearchParams(window.location.search).get("slide"));
  return Number.isInteger(value) ? Math.max(0, Math.min(max - 1, value)) : 0;
}

function goWithTransition(router: ReturnType<typeof useRouter>, path: string, nextSlide?: number) {
  const target = nextSlide === undefined ? path : `${path}${path.includes("?") ? "&" : "?"}stage=${nextSlide}`;
  const documentWithTransition = document as Document & { startViewTransition?: (callback: () => void) => void };
  if (documentWithTransition.startViewTransition) documentWithTransition.startViewTransition(() => router.push(target));
  else router.push(target);
}

export default function PresentationMode() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [showCue, setShowCue] = useState(true);
  const slide = slides[active];
  const progress = useMemo(() => `${((active + 1) / slides.length) * 100}%`, [active]);

  useEffect(() => {
    setActive(readSlideParam(slides.length));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    url.searchParams.set("slide", String(active));
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, [active, hydrated]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") setActive((value) => Math.min(slides.length - 1, value + 1));
      if (event.key === "ArrowLeft" || event.key === "PageUp") setActive((value) => Math.max(0, value - 1));
      if (event.key.toLowerCase() === "n") setShowCue((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <main className="presentation-page" style={{ "--slide-accent": slide.accent } as React.CSSProperties}><div className="presentation-topbar"><Link href="/" className="presentation-brand"><span className="brand-mark">M</span> MAPANYTHING <small>STAGE MODE</small></Link><div className="presentation-progress"><span>{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span><div><i style={{ width: progress }} /></div><span>4:00</span></div><button className="notes-toggle" onClick={() => setShowCue((value) => !value)}>{showCue ? "Hide notes" : "Show notes"} <kbd>N</kbd></button></div><section className="presentation-stage"><div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" /><div className="stage-copy"><div className="slide-kicker">{slide.kicker}</div><h1 key={active}>{slide.title}</h1><p key={`body-${active}`}>{slide.body}</p><div className="proof-row">{slide.proof?.map((item) => <span key={item}><i style={{ background: slide.accent }} />{item}</span>)}</div><div className="stage-actions">{slide.action && <button className="stage-button" onClick={() => goWithTransition(router, slide.action!.path, Math.min(slides.length - 1, active + 1))}>{slide.action.label}<span>↗</span></button>}<button className="ghost-button" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0}>←</button><button className="ghost-button" onClick={() => setActive((value) => Math.min(slides.length - 1, value + 1))} disabled={active === slides.length - 1}>→</button></div></div><div className="stage-visual" aria-hidden="true"><div className="visual-radar"><span className="radar-ring ring-a" /><span className="radar-ring ring-b" /><span className="radar-ring ring-c" /><span className="radar-sweep" />{[0, 1, 2, 3, 4, 5].map((dot) => <i key={dot} className={`radar-dot dot-${dot}`} style={{ background: slide.accent }} />)}</div><div className="visual-card visual-card-top"><small>{active === 6 ? "LIVE EVENT" : active === 3 ? "HEALTHCARE" : "MAPANYTHING CORE"}</small><strong>{active === 6 ? "TX-204 / anomaly" : active === 3 ? "wearable → reports" : active < 4 ? "cross-domain map" : "agent-ready output"}</strong></div><div className="visual-card visual-card-bottom"><span style={{ background: slide.accent }} />{active === 6 ? "Targeted reroute · 87%" : active === 3 ? "Inspection focus · 82%" : active === 7 ? "Reusable mapping layer" : "No shared timestamp required"}</div></div></section>{showCue && <aside className="speaker-cue"><span>SPEAKER CUE · {slide.time}</span><p>“{slide.cue}”</p></aside>}<footer className="presentation-footer"><span>Arrow keys / space to advance</span><span>Live demo pages are part of the app</span><span>SpeedHacks · SR008</span></footer></main>;
}
