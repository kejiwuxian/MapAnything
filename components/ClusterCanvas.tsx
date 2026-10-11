"use client";

import { useEffect, useRef } from "react";
import type { Cluster } from "../lib/demo-data";

type Props = { clusters: Cluster[]; hoveredId: string | null; onHover: (id: string | null) => void };

export default function ClusterCanvas({ clusters, hoveredId, onHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const pointsRef = useRef<{ x: number; y: number; r: number; cluster: Cluster }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let mounted = true;
    const draw = () => {
      if (!mounted) return;
      const ratio = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#08101d";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "rgba(137, 164, 211, .12)";
      context.lineWidth = 1;
      for (let i = 1; i < 5; i += 1) {
        context.beginPath();
        context.arc(width / 2, height / 2, (Math.min(width, height) / 2) * (i / 5), 0, Math.PI * 2);
        context.stroke();
      }
      context.beginPath();
      context.moveTo(width / 2, 20);
      context.lineTo(width / 2, height - 20);
      context.moveTo(20, height / 2);
      context.lineTo(width - 20, height / 2);
      context.stroke();

      const points: typeof pointsRef.current = [];
      for (const cluster of clusters) {
        const [x, y, z] = cluster.position;
        const angle = rotationRef.current;
        const rx = x * Math.cos(angle) - z * Math.sin(angle);
        const rz = x * Math.sin(angle) + z * Math.cos(angle);
        const scale = 1 / (1.6 - rz * 0.28);
        const px = width / 2 + rx * width * 0.31 * scale;
        const py = height / 2 - y * height * 0.31 * scale;
        const radius = 22 + cluster.count / 120;
        points.push({ x: px, y: py, r: radius, cluster });
        const active = hoveredId === cluster.id;
        const gradient = context.createRadialGradient(px, py, 1, px, py, radius * (active ? 1.5 : 1));
        gradient.addColorStop(0, `${cluster.color}dd`);
        gradient.addColorStop(0.45, `${cluster.color}55`);
        gradient.addColorStop(1, `${cluster.color}00`);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(px, py, radius * (active ? 1.5 : 1), 0, Math.PI * 2);
        context.fill();
        context.fillStyle = active ? "#ffffff" : cluster.color;
        context.beginPath();
        context.arc(px, py, active ? 7 : 4.5, 0, Math.PI * 2);
        context.fill();
        context.font = active ? "600 12px Inter, sans-serif" : "500 10px Inter, sans-serif";
        context.fillStyle = active ? "#ffffff" : "rgba(229, 238, 255, .72)";
        context.fillText(cluster.id, px + 11, py - 10);
      }
      pointsRef.current = points;
      rotationRef.current += 0.006;
      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
    return () => {
      mounted = false;
    };
  }, [clusters, hoveredId]);

  return (
    <div className="cluster-canvas-wrap">
      <canvas
        ref={canvasRef}
        className="cluster-canvas"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const hit = pointsRef.current.find((point) => Math.hypot(point.x - x, point.y - y) < point.r);
          onHover(hit?.cluster.id ?? null);
        }}
        onMouseLeave={() => onHover(null)}
        aria-label="Interactive rotating 3D vector cluster view"
      />
    </div>
  );
}
