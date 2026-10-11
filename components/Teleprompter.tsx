"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TELEPROMPTER_EVENT_SECONDS, TELEPROMPTER_TOTAL_SECONDS, teleprompterScript } from "../lib/teleprompter-script";

function formatClock(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, "0")}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export default function Teleprompter() {
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [eventState, setEventState] = useState<"armed" | "sending" | "sent" | "failed">("armed");
  const eventTriggeredRef = useRef(false);
  const activeIndex = useMemo(() => {
    const index = teleprompterScript.findIndex((segment) => elapsed >= segment.start && elapsed < segment.end);
    return index === -1 ? teleprompterScript.length - 1 : index;
  }, [elapsed]);
  const activeSegment = teleprompterScript[activeIndex];
  const progress = Math.min(100, (elapsed / TELEPROMPTER_TOTAL_SECONDS) * 100);

  useEffect(() => {
    if (startedAt === null) return;
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min(TELEPROMPTER_TOTAL_SECONDS, (Date.now() - startedAt) / 1000);
      setElapsed(nextElapsed);

      if (nextElapsed >= TELEPROMPTER_EVENT_SECONDS && !eventTriggeredRef.current) {
        eventTriggeredRef.current = true;
        setEventState("sending");
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ truckId: "TX-204", anomalyType: "cooling", severity: 0.91 }),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Event injection failed");
            setEventState("sent");
          })
          .catch(() => setEventState("failed"));
      }

      if (nextElapsed >= TELEPROMPTER_TOTAL_SECONDS) setStartedAt(null);
    }, 100);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const clearEvent = async () => {
    await fetch("/api/events", { method: "DELETE" });
  };

  const start = async () => {
    if (elapsed >= TELEPROMPTER_TOTAL_SECONDS) {
      await clearEvent();
      setElapsed(0);
      eventTriggeredRef.current = false;
      setEventState("armed");
      setStartedAt(Date.now());
      return;
    }
    if (elapsed === 0) {
      await clearEvent();
      eventTriggeredRef.current = false;
      setEventState("armed");
    }
    setStartedAt(Date.now() - elapsed * 1000);
  };

  const reset = async () => {
    setStartedAt(null);
    setElapsed(0);
    eventTriggeredRef.current = false;
    setEventState("armed");
    await clearEvent();
  };

  return (
    <main className="teleprompter-page" style={{ "--teleprompter-accent": activeSegment.accent } as React.CSSProperties}>
      <header className="teleprompter-header">
        <div><span className="teleprompter-brand-mark">M</span><span>MAPANYTHING</span><small>PRIVATE STAGE TOOL</small></div>
        <span className="teleprompter-live"><i /> LOCAL TELEPROMPTER</span>
      </header>

      <section className="teleprompter-main">
        <div className="teleprompter-topline"><span>4:00 PRESENTATION SCRIPT</span><span>{activeIndex + 1} / {teleprompterScript.length}</span></div>
        <div className="teleprompter-clock-row">
          <strong>{formatClock(elapsed)}</strong><span>/ {formatClock(TELEPROMPTER_TOTAL_SECONDS)}</span>
          <div className="teleprompter-progress"><i style={{ width: `${progress}%` }} /></div>
          <span className={`teleprompter-event-state ${eventState}`}><i />{eventState === "armed" ? "AUTO EVENT ARMED · 02:40" : eventState === "sending" ? "SENDING TX-204 EVENT" : eventState === "sent" ? "TX-204 EVENT SENT" : "EVENT FAILED"}</span>
        </div>

        <div className="teleprompter-layout">
          <section className="teleprompter-current">
            <div className="teleprompter-kicker">{activeSegment.kicker}</div>
            <p className="teleprompter-line">{activeSegment.line}</p>
            <div className="teleprompter-instruction"><span>WHERE TO CLICK / DO</span><p>{activeSegment.instruction}</p></div>
            <div className="teleprompter-controls">
              <button className="teleprompter-start" onClick={start}>{startedAt === null ? (elapsed >= TELEPROMPTER_TOTAL_SECONDS ? "Restart teleprompter" : "Start teleprompter") : "Resume teleprompter"}<b>▶</b></button>
              {startedAt !== null && <button className="teleprompter-secondary" onClick={() => setStartedAt(null)}>Pause</button>}
              <button className="teleprompter-secondary" onClick={reset}>Reset</button>
            </div>
          </section>

        </div>
      </section>
      <footer className="teleprompter-footer"><span>Direct URL only · /teleprompter</span><span>At 02:40: automatic TX-204 cooling anomaly injection</span></footer>
    </main>
  );
}
