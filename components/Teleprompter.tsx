"use client";

import { useEffect, useRef, useState } from "react";
import { TELEPROMPTER_LIVE_EVENT_INDEX, TELEPROMPTER_TOTAL_SECONDS, teleprompterScript } from "../lib/teleprompter-script";

function formatClock(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, "0")}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export default function Teleprompter() {
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [eventState, setEventState] = useState<"armed" | "sending" | "sent" | "failed">("armed");
  const [activeIndex, setActiveIndex] = useState(0);
  const eventTriggeredRef = useRef(false);
  const activeSegment = teleprompterScript[activeIndex];
  const progress = Math.min(100, (elapsed / TELEPROMPTER_TOTAL_SECONDS) * 100);

  const triggerAnomaly = () => {
    if (eventTriggeredRef.current) return;
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
  };

  const advanceCue = () => {
    const nextIndex = Math.min(teleprompterScript.length - 1, activeIndex + 1);
    if (nextIndex === activeIndex) return;
    const nextStart = teleprompterScript[nextIndex].start;
    setActiveIndex(nextIndex);
    setElapsed(nextStart);
    if (startedAt !== null) setStartedAt(Date.now() - nextStart * 1000);
    if (nextIndex === TELEPROMPTER_LIVE_EVENT_INDEX) triggerAnomaly();
  };

  const retreatCue = () => {
    const previousIndex = Math.max(0, activeIndex - 1);
    const previousStart = teleprompterScript[previousIndex].start;
    setActiveIndex(previousIndex);
    setElapsed(previousStart);
    if (startedAt !== null) setStartedAt(Date.now() - previousStart * 1000);
  };

  useEffect(() => {
    if (startedAt === null) return;
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min(TELEPROMPTER_TOTAL_SECONDS, (Date.now() - startedAt) / 1000);
      setElapsed(nextElapsed);

      if (nextElapsed >= TELEPROMPTER_TOTAL_SECONDS) setStartedAt(null);
    }, 100);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "PageDown") {
        event.preventDefault();
        advanceCue();
      }
      if (event.key === "PageUp") {
        event.preventDefault();
        retreatCue();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, startedAt]);

  const clearEvent = async () => {
    await fetch("/api/events", { method: "DELETE" });
  };

  const start = async () => {
    if (elapsed >= TELEPROMPTER_TOTAL_SECONDS) {
      await clearEvent();
      setElapsed(0);
      setActiveIndex(0);
      eventTriggeredRef.current = false;
      setEventState("armed");
      setStartedAt(Date.now());
      return;
    }
    if (elapsed === 0) {
      await clearEvent();
      setActiveIndex(0);
      eventTriggeredRef.current = false;
      setEventState("armed");
    }
    setStartedAt(Date.now() - elapsed * 1000);
  };

  const reset = async () => {
    setStartedAt(null);
    setElapsed(0);
    setActiveIndex(0);
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
        <div className="teleprompter-topline"><span>3:00 PRESENTATION SCRIPT · PAGE DOWN NEXT</span><span>{activeIndex + 1} / {teleprompterScript.length}</span></div>
        <div className="teleprompter-clock-row">
          <strong>{formatClock(elapsed)}</strong><span>/ {formatClock(TELEPROMPTER_TOTAL_SECONDS)}</span>
          <div className="teleprompter-progress"><i style={{ width: `${progress}%` }} /></div>
          <span className={`teleprompter-event-state ${eventState}`}><i />{eventState === "armed" ? "EVENT ON PAGE DOWN · 02:15" : eventState === "sending" ? "SENDING TX-204 EVENT" : eventState === "sent" ? "TX-204 EVENT SENT" : "EVENT FAILED"}</span>
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
      <footer className="teleprompter-footer"><span>PageDown next · PageUp previous · direct URL only</span><span>PageDown on LIVE EVENT triggers TX-204 injection</span></footer>
    </main>
  );
}
