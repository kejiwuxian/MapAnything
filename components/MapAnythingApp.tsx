"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ClusterCanvas from "./ClusterCanvas";
import FleetMap from "./FleetMap";
import { anomalyProfiles, baseTrucks, mappings, reportClusters, telemetryClusters, workshops, type AnomalyEvent, type AnomalyType, type PageKey, type Truck } from "../lib/demo-data";

function Header({ page }: { page: PageKey }) {
  return <header className="topbar"><Link href="/" className="brand"><span className="brand-mark">M</span><span>MAPANYTHING</span><small>SR008 / SPEEDHACKS</small></Link><nav><Link className={page === "core" ? "active" : ""} href="/">Core Platform</Link><Link className={page === "fleet" ? "active" : ""} href="/fleet">Fleet Agent</Link><Link href="/presentation">Stage Mode</Link></nav><div className="live-pill"><span className="pulse-dot" /> Live workspace</div></header>;
}

function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) { return <span className={`status-badge ${tone}`}>{children}</span>; }

function CorePage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [datasetAName, setDatasetAName] = useState("Automotive OBD-II signals");
  const [datasetBName, setDatasetBName] = useState("Maintenance reports");
  const mapping = hovered ? mappings.find((item) => item.from === hovered) : undefined;
  const hoveredReport = mapping?.to ?? [];

  const runMapping = () => {
    setRunning(true);
    setComplete(false);
    window.setTimeout(() => { setRunning(false); setComplete(true); }, 1200);
  };

  return <main className="page-shell"><Header page="core" /><section className="hero-row"><div><div className="eyebrow">APPLICATION-INDEPENDENT CORRELATION MAPPING</div><h1>Turn unmatched data<br /><em>into useful signals.</em></h1><p className="hero-copy">MapAnything discovers relationships between datasets without requiring perfect labels or timestamp alignment—so teams can skip weeks of bespoke data preparation.</p><div className="hero-actions"><button className="primary-button" onClick={runMapping}>{running ? "Mapping in progress…" : complete ? "Mapping complete · Run again" : "Run MapAnything"}<span>↗</span></button><span className="micro-copy">2 datasets · 2,790 records · 18 sec first pass</span></div></div><div className="hero-metric"><span className="metric-kicker">TIME TO FIRST INSIGHT</span><strong>18<span>s</span></strong><span className="metric-foot">vs. weeks of custom labeling</span></div></section><section className="workspace-card"><div className="section-heading"><div><span className="section-index">01</span><h2>Connect two worlds</h2><p>Upload any combination of telemetry, text, or operational records.</p></div><div className="pipeline"><span className={running ? "active" : "done"}>01 Ingest</span><span className={running ? "active" : complete ? "done" : ""}>02 Embed</span><span className={complete ? "done" : ""}>03 Align</span><span className={complete ? "done" : ""}>04 Explain</span></div></div><div className="dataset-row"><div className="dataset-card"><div className="dataset-card-top"><div className="data-icon telemetry-icon">⌁</div><StatusBadge tone="success">Connected</StatusBadge></div><span className="dataset-type">DATASET A · TELEMETRY</span><h3>{datasetAName}</h3><p>10 numeric channels · 2,491 windows</p><label className="upload-button" htmlFor="dataset-a">Choose CSV / Parquet <span>↗</span></label><input id="dataset-a" className="hidden-file-input" type="file" accept=".csv,.parquet,.json" onChange={(event) => setDatasetAName(event.target.files?.[0]?.name ?? "Automotive OBD-II signals")} /><div className="data-tags"><span>RPM</span><span>coolant temp</span><span>airflow</span><span>speed</span></div></div><div className="bridge">×<span>no shared<br />timestamp<br />required</span></div><div className="dataset-card"><div className="dataset-card-top"><div className="data-icon report-icon">≋</div><StatusBadge tone="success">Connected</StatusBadge></div><span className="dataset-type">DATASET B · TEXT RECORDS</span><h3>{datasetBName}</h3><p>147 service notes · 4 latent concepts</p><label className="upload-button" htmlFor="dataset-b">Choose CSV / JSON <span>↗</span></label><input id="dataset-b" className="hidden-file-input" type="file" accept=".csv,.json,.txt" onChange={(event) => setDatasetBName(event.target.files?.[0]?.name ?? "Maintenance reports")} /><div className="data-tags"><span>cooling system</span><span>intake</span><span>performance</span></div></div></div></section><section className="cluster-section"><div className="section-heading"><div><span className="section-index">02</span><h2>See the mapping</h2><p>Hover a behavior cluster to reveal its mapped concept.</p></div><div className="cluster-legend"><span><i className="legend-dot mint" />Telemetry</span><span><i className="legend-dot violet" />Reports</span></div></div><div className="cluster-grid"><div className="cluster-panel"><div className="panel-label"><span>LIVE VECTOR SPACE</span><strong>Telemetry behaviors</strong></div><ClusterCanvas clusters={telemetryClusters} hoveredId={hovered} onHover={setHovered} /><div className="panel-foot"><span>5 clusters</span><span>Rotating projection · PCA + UMAP</span></div></div><div className="mapping-arrow">↔<span>JEV<br />ALIGNMENT</span></div><div className="cluster-panel"><div className="panel-label"><span>DISCOVERED CONCEPTS</span><strong>Maintenance reports</strong></div><ClusterCanvas clusters={reportClusters} hoveredId={hoveredReport[0] ?? null} onHover={(id) => setHovered(mappings.find((item) => item.to.includes(id ?? ""))?.from ?? null)} /><div className="panel-foot"><span>4 clusters</span><span>Cross-domain confidence</span></div></div></div>{mapping && <div className="mapping-insight"><div className="insight-orb" style={{ background: telemetryClusters.find((item) => item.id === hovered)?.color }} /><div><span className="insight-kicker">MAPPED INSIGHT · {mapping.confidence * 100}% CONFIDENCE</span><strong>{telemetryClusters.find((item) => item.id === hovered)?.label} <span>↔</span> {reportClusters.find((item) => item.id === mapping.to[0])?.label}</strong><p>{mapping.rationale}</p></div><span className="insight-close" onClick={() => setHovered(null)}>×</span></div>}</section><section className="expansion-strip"><div><span className="eyebrow">SAME CORE · NEW DOMAIN</span><h2>Healthcare, without a new model.</h2><p>Live wearable signals <b>→</b> delayed medical reports <b>→</b> early warning with a focused clinical inspection path.</p></div><div className="healthcare-alert"><span className="alert-pulse" /><div><small>EARLY WARNING · SYNTHETIC EXAMPLE</small><strong>Cardiopulmonary pattern detected</strong><span>Inspection focus: oxygenation + cardiology review</span></div><span className="confidence">82%</span></div></section><footer className="site-footer"><span>MapAnything Core · reusable mapping API</span><span>Demo data · clinical example is not medical advice</span></footer></main>;
}

function FleetPage() {
  const [trucks, setTrucks] = useState<Truck[]>(baseTrucks);
  const [selectedTruckId, setSelectedTruckId] = useState("TX-204");
  const [event, setEvent] = useState<AnomalyEvent | null>(null);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [explanation, setExplanation] = useState("Telemetry evidence is ready for inspection.");
  const selected = trucks.find((truck) => truck.id === selectedTruckId) ?? trucks[0];
  const profile = event ? anomalyProfiles[event.anomalyType as AnomalyType] ?? anomalyProfiles.cooling : null;

  useEffect(() => {
    let lastId = "";
    const poll = async () => {
      const response = await fetch("/api/events", { cache: "no-store" });
      const payload = (await response.json()) as { event: AnomalyEvent | null };
      if (payload.event && payload.event.id !== lastId) {
        lastId = payload.event.id;
        setEvent(payload.event);
        setSelectedTruckId(payload.event.truckId);
        setNoticeVisible(true);
        window.setTimeout(() => setNoticeVisible(false), 7000);
      }
    };
    poll();
    const timer = window.setInterval(poll, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!event || !profile) return;
    setTrucks((current) => current.map((truck) => truck.id === event.truckId ? { ...truck, status: "anomaly", anomaly: { type: profile.label, score: profile.score, mappedIssue: profile.mappedIssue, workshopId: profile.workshopId } } : { ...truck, status: truck.status === "anomaly" ? "healthy" : truck.status }));
    fetch("/api/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telemetry: profile.label, mappedIssue: profile.mappedIssue, confidence: profile.score, truckId: event.truckId }) }).then((response) => response.json()).then((data: { explanation?: string }) => setExplanation(data.explanation ?? "Mapped maintenance evidence is ready for targeted inspection.")).catch(() => setExplanation("Telemetry is associated with a known maintenance pattern. Route for targeted inspection."));
  }, [event, profile]);

  const reset = async () => { await fetch("/api/events", { method: "DELETE" }); setEvent(null); setTrucks(baseTrucks); setExplanation("Telemetry evidence is ready for inspection."); };
  const selectedWorkshop = profile ? workshops.find((workshop) => workshop.id === profile.workshopId) : undefined;

  return <main className="page-shell dark-page"><Header page="fleet" /><section className="fleet-header"><div><div className="eyebrow">REFERENCE APPLICATION · POWERED BY MAPANYTHING CORE</div><h1>Fleet Agent<span className="title-dot">.</span></h1><p>Turn invisible telemetry patterns into focused maintenance actions before a truck becomes a disruption.</p></div><div className="fleet-state"><span className="pulse-dot" /> MAPANYTHING MONITORING <strong>LIVE</strong></div></section>{noticeVisible && event && <div className="live-alert"><div className="alert-icon">!</div><div><span>NEW MAPANYTHING EVENT · JUST NOW</span><strong>Anomaly detected on {event.truckId}</strong><p>{profile?.label} · {Math.round((profile?.score ?? 0) * 100)}% mapping confidence</p></div><button onClick={() => setNoticeVisible(false)}>×</button></div>}<section className="fleet-layout"><div className="map-column"><div className="map-toolbar"><span><i className="legend-dot mint" />Normal route</span><span><i className="legend-dot amber" />Watch</span><span><i className="legend-dot red" />Anomaly / reroute</span><span className="map-provider">Google GIS · Places + Directions</span></div><FleetMap trucks={trucks} workshops={workshops} selectedTruckId={selectedTruckId} anomalyTruckId={event?.truckId ?? null} onSelectTruck={setSelectedTruckId} /></div><aside className="fleet-sidebar"><div className="sidebar-heading"><div><span className="section-index">FLEET 01</span><h2>Active routes</h2></div><StatusBadge tone={event ? "danger" : "success"}>{event ? "1 requires action" : "All nominal"}</StatusBadge></div><div className="truck-list">{trucks.map((truck) => <button key={truck.id} className={`truck-row ${truck.id === selectedTruckId ? "selected" : ""}`} onClick={() => setSelectedTruckId(truck.id)}><span className="truck-symbol" style={{ color: truck.status === "anomaly" ? "#ff647c" : truck.accent }}>▴</span><span><strong>{truck.id}</strong><small>{truck.driver} · {truck.status === "anomaly" ? "anomaly" : truck.status === "watch" ? "watchlist" : "en route"}</small></span><span className={`row-state ${truck.status}`} /> </button>)}</div>{event && selected?.status === "anomaly" ? <div className="agent-card"><div className="agent-card-top"><span className="agent-kicker">AGENT RECOMMENDATION</span><span className="score-chip">{Math.round((profile?.score ?? 0) * 100)}%</span></div><h3>{selected.id} needs a targeted stop.</h3><p>{explanation}</p><div className="evidence-line"><span>Mapped issue</span><strong>{profile?.mappedIssue}</strong></div><div className="evidence-line"><span>Nearest match</span><strong>{selectedWorkshop?.name}</strong></div><button className="primary-button full" onClick={() => setEvent(null)}>Accept reroute <span>↗</span></button></div> : <div className="quiet-card"><span className="quiet-icon">◌</span><div><strong>Waiting for live telemetry</strong><p>The off-stage operations console can send an anomaly event to this screen.</p></div></div>}<button className="reset-button" onClick={reset}>Reset demo state</button></aside></section><footer className="site-footer"><span>Fleet Agent · customer solution built on MapAnything</span><span>OBD-II demo data · workshop recommendations are simulated</span></footer></main>;
}

export default function MapAnythingApp({ initialPage }: { initialPage: PageKey }) {
  return initialPage === "fleet" ? <FleetPage /> : <CorePage />;
}
