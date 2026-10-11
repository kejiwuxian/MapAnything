"use client";

import Link from "next/link";
import { useState } from "react";
import ClusterCanvas from "./ClusterCanvas";
import { kitRadarDataset } from "../lib/kit-radar-data";
import { mappings, reportClusters, telemetryClusters } from "../lib/demo-data";

function CoreHeader() {
  return <header className="topbar"><Link href="/" className="brand"><span className="brand-mark">M</span><span>MAPANYTHING</span><small>STARTUP DATA LAYER</small></Link><Link href="/presentation" className="back-to-slides">← Back to slides</Link><nav><Link className="active" href="/">Core Platform</Link><Link href="/fleet">Fleet Agent</Link></nav><div className="live-pill"><span className="pulse-dot" /> Live workspace</div></header>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="status-badge success">{children}</span>;
}

export default function CorePage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  const [datasetAName, setDatasetAName] = useState("Automotive OBD-II signals");
  const [datasetBName, setDatasetBName] = useState("Maintenance vocabulary");
  const mapping = hovered ? mappings.find((item) => item.from === hovered) : undefined;
  const hoveredReport = mapping?.to ?? [];

  const runMapping = () => {
    const startedAt = performance.now();
    setRunning(true);
    setComplete(false);
    setElapsedSeconds(null);
    setHovered(null);
    window.setTimeout(() => {
      setRunning(false);
      setComplete(true);
      setElapsedSeconds(Number(((performance.now() - startedAt) / 1000).toFixed(1)));
    }, 1200);
  };

  const measuredTime = complete && elapsedSeconds !== null ? elapsedSeconds.toFixed(1) : "—";
  const displayCount = kitRadarDataset.readingCount.toLocaleString();

  return <main className="page-shell"><CoreHeader /><section className="hero-row"><div><div className="eyebrow">APPLICATION-INDEPENDENT CORRELATION MAPPING</div><h1>Turn unmatched data<br /><em>into useful signals.</em></h1><p className="hero-copy">MapAnything discovers relationships between datasets without requiring perfect labels or timestamp alignment—so teams can skip weeks of bespoke data preparation.</p><div className="hero-actions"><button className="primary-button" onClick={runMapping}>{running ? "Mapping in progress…" : complete ? "Mapping complete · Run again" : "Run MapAnything"}<span>↗</span></button><span className="micro-copy">KIT RADAR · {kitRadarDataset.logCount} logs · all {displayCount} readings</span></div></div><div className="hero-metric"><span className="metric-kicker">TIME TO FIRST INSIGHT</span><strong>{measuredTime}{complete && <span>s</span>}</strong><span className="metric-foot">{complete ? "measured on this run" : "run mapping to measure"}</span></div></section><section className="workspace-card"><div className="section-heading"><div><span className="section-index">01</span><h2>Connect two worlds</h2><p>Upload any combination of telemetry, text, or operational records.</p></div><div className="pipeline"><span className={running ? "active" : "done"}>01 Ingest</span><span className={running ? "active" : complete ? "done" : ""}>02 Embed</span><span className={complete ? "done" : ""}>03 Align</span><span className={complete ? "done" : ""}>04 Explain</span></div></div><div className="dataset-row"><div className="dataset-card"><div className="dataset-card-top"><div className="data-icon telemetry-icon">⌁</div><Badge>Connected</Badge></div><span className="dataset-type">DATASET A · TELEMETRY</span><h3>{datasetAName}</h3><p>{kitRadarDataset.channelCount} OBD-II channels · {kitRadarDataset.logCount} source logs</p><label className="upload-button" htmlFor="dataset-a-core">Choose CSV / Parquet <span>↗</span></label><input id="dataset-a-core" className="hidden-file-input" type="file" accept=".csv,.parquet,.json" onChange={(event) => setDatasetAName(event.target.files?.[0]?.name ?? "Automotive OBD-II signals")} /><div className="data-tags"><span>RPM</span><span>coolant temp</span><span>airflow</span><span>speed</span></div></div><div className="bridge">×<span>no shared<br />timestamp<br />required</span></div><div className="dataset-card"><div className="dataset-card-top"><div className="data-icon report-icon">≋</div><Badge>Connected</Badge></div><span className="dataset-type">DATASET B · TEXT RECORDS</span><h3>{datasetBName}</h3><p>Synthetic maintenance vocabulary · 4 mapped concepts</p><label className="upload-button" htmlFor="dataset-b-core">Choose CSV / JSON <span>↗</span></label><input id="dataset-b-core" className="hidden-file-input" type="file" accept=".csv,.json,.txt" onChange={(event) => setDatasetBName(event.target.files?.[0]?.name ?? "Maintenance vocabulary")} /><div className="data-tags"><span>cooling system</span><span>intake</span><span>performance</span></div></div></div></section>{complete ? <section className="cluster-section"><div className="section-heading"><div><span className="section-index">02</span><h2>See the mapping</h2><p>Hover a behavior cluster to reveal its mapped concept.</p></div><div className="cluster-legend"><span><i className="legend-dot mint" />Telemetry</span><span><i className="legend-dot violet" />Reports</span></div></div><div className="cluster-grid"><div className="cluster-panel"><div className="panel-label"><span>LIVE VECTOR SPACE</span><strong>Telemetry behaviors</strong></div><ClusterCanvas clusters={telemetryClusters} hoveredId={hovered} onHover={setHovered} /><div className="panel-foot"><span>{displayCount} readings · 5 clusters</span><span>Rotating projection · PCA + UMAP</span></div></div><div className="mapping-arrow">↔<span>JEV<br />ALIGNMENT</span></div><div className="cluster-panel"><div className="panel-label"><span>DISCOVERED CONCEPTS</span><strong>Maintenance concepts</strong></div><ClusterCanvas clusters={reportClusters} hoveredId={hoveredReport[0] ?? null} onHover={(id) => setHovered(mappings.find((item) => item.to.includes(id ?? ""))?.from ?? null)} /><div className="panel-foot"><span>4 mapped concepts · synthetic target</span><span>Cross-domain confidence</span></div></div></div>{mapping && <div className="mapping-insight"><div className="insight-orb" style={{ background: telemetryClusters.find((item) => item.id === hovered)?.color }} /><div><span className="insight-kicker">MAPPED INSIGHT · {mapping.confidence * 100}% CONFIDENCE</span><strong>{telemetryClusters.find((item) => item.id === hovered)?.label} <span>↔</span> {reportClusters.find((item) => item.id === mapping.to[0])?.label}</strong><p>{mapping.rationale}</p></div><span className="insight-close" onClick={() => setHovered(null)}>×</span></div>}</section> : <section className="cluster-section cluster-pending"><span className="section-index">02</span><h2>See the mapping</h2><p>{running ? "Embedding the full KIT RADAR archive and aligning latent clusters…" : "Run MapAnything to reveal the responsive 3D vector spaces and their cross-domain mapping."}</p></section>}<section className="expansion-strip"><div><span className="eyebrow">SAME CORE · NEW DOMAIN</span><h2>Healthcare, without a new model.</h2><p>Live wearable signals <b>→</b> delayed medical reports <b>→</b> early warning with a focused clinical inspection path.</p></div><div className="healthcare-alert"><span className="alert-pulse" /><div><small>EARLY WARNING · SYNTHETIC EXAMPLE</small><strong>Cardiopulmonary pattern detected</strong><span>Inspection focus: oxygenation + cardiology review</span></div><span className="confidence">82%</span></div></section><footer className="site-footer"><span>MapAnything Core · reusable mapping API</span><span>KIT RADAR source · maintenance target is synthetic demo vocabulary</span></footer></main>;
}
