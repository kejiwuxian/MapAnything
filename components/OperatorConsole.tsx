"use client";

import { useState } from "react";
import { anomalyProfiles, baseTrucks, type AnomalyType } from "../lib/demo-data";

export default function OperatorConsole() {
  const [truckId, setTruckId] = useState(baseTrucks[0].id);
  const [anomalyType, setAnomalyType] = useState<AnomalyType>("cooling");
  const [sent, setSent] = useState(false);
  const send = async () => { await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ truckId, anomalyType, severity: anomalyProfiles[anomalyType].score }) }); setSent(true); window.setTimeout(() => setSent(false), 3000); };
  const reset = async () => { await fetch("/api/events", { method: "DELETE" }); setSent(false); };
  return <main className="operator-page"><div className="operator-shell"><div className="operator-header"><div><span className="eyebrow">PRIVATE OPERATIONS CHANNEL</span><h1>Fleet event console<span className="title-dot">.</span></h1><p>Off-stage controls for the live MapAnything demonstration.</p></div><span className="operator-badge"><span className="pulse-dot" /> Operator only</span></div><div className="operator-warning">This view is intentionally not part of the on-stage navigation. Events sent here appear in the Fleet Agent within approximately one second.</div><div className="operator-controls"><label>TRUCK<select value={truckId} onChange={(event) => setTruckId(event.target.value)}>{baseTrucks.map((truck) => <option key={truck.id} value={truck.id}>{truck.id} · {truck.driver}</option>)}</select></label><label>ANOMALY SIGNATURE<select value={anomalyType} onChange={(event) => setAnomalyType(event.target.value as AnomalyType)}><option value="cooling">Cooling-system signature</option><option value="intake">Air-intake drift</option><option value="performance">Engine-performance deviation</option></select></label><div className="operator-preview"><span>Mapped customer action</span><strong>{anomalyProfiles[anomalyType].mappedIssue}</strong><small>Confidence {Math.round(anomalyProfiles[anomalyType].score * 100)}%</small></div></div><div className="operator-actions"><button className="primary-button" onClick={send}>Inject live anomaly <span>↗</span></button><button className="reset-button" onClick={reset}>Clear live event</button></div>{sent && <div className="operator-success"><span>✓</span> Event delivered to Fleet Agent.</div>}<div className="operator-footer"><span>MapAnything / internal demo tooling</span><span>Production replacement: realtime event bus + durable event log</span></div></div></main>;
}
