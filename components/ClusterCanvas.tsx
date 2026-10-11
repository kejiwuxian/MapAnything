"use client";

import { useEffect, useRef } from "react";
import type { Cluster } from "../lib/demo-data";

type Props = {
  clusters: Cluster[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
};

type HitRegion = { x: number; y: number; r: number; cluster: Cluster };

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
  return Math.abs(hash);
}

function pseudo(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export default function ClusterCanvas({ clusters, hoveredId, onHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const hitRegionsRef = useRef<HitRegion[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !parent || !context) return;

    let mounted = true;
    let frame = 0;

    const draw = () => {
      if (!mounted) return;
      const ratio = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width <= 0 || height <= 0) {
        frame = window.requestAnimationFrame(draw);
        return;
      }

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#08101d";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(145, 170, 214, .1)";
      context.lineWidth = 1;
      for (const radius of [0.19, 0.31, 0.43]) {
        context.beginPath();
        context.ellipse(width / 2, height / 2, width * radius, height * radius * 0.32, 0, 0, Math.PI * 2);
        context.stroke();
      }
      context.beginPath();
      context.moveTo(width * 0.08, height / 2);
      context.lineTo(width * 0.92, height / 2);
      context.moveTo(width / 2, height * 0.18);
      context.lineTo(width / 2, height * 0.82);
      context.stroke();

      const hits: HitRegion[] = [];
      const angle = rotationRef.current;
      for (const cluster of clusters) {
        const [cx, cy, cz] = cluster.position;
        const sourcePoints = cluster.points?.length ? cluster.points : [cluster.position];
        const pointCount = cluster.points?.length ? sourcePoints.length * 5 : Math.min(220, Math.max(84, Math.round(Math.sqrt(cluster.count) * 4)));
        let centroidX = 0;
        let centroidY = 0;
        const active = hoveredId === cluster.id;
        const dimmed = Boolean(hoveredId) && !active;

        for (let index = 0; index < pointCount; index += 1) {
          const seed = hashSeed(cluster.id) + index * 97;
          const sourcePoint = cluster.points?.length ? sourcePoints[Math.floor(index / 5)] : [cx, cy, cz];
          const theta = pseudo(seed) * Math.PI * 2;
          const radius = cluster.points?.length ? Math.sqrt(pseudo(seed + 11)) * 0.045 : Math.sqrt(pseudo(seed + 11)) * 0.3;
          const localX = Math.cos(theta) * radius * (0.75 + pseudo(seed + 23) * 0.35);
          const localY = Math.sin(theta) * radius * (0.75 + pseudo(seed + 37) * 0.35);
          const localZ = cluster.points?.length ? (pseudo(seed + 53) - 0.5) * 0.05 : (pseudo(seed + 53) - 0.5) * 0.22;
          const x = sourcePoint[0] + localX;
          const y = sourcePoint[1] + localY;
          const z = sourcePoint[2] + localZ;
          const rotatedX = x * Math.cos(angle) - z * Math.sin(angle);
          const rotatedZ = x * Math.sin(angle) + z * Math.cos(angle);
          const scale = 1 / (1.6 - rotatedZ * 0.28);
          const pointX = width / 2 + rotatedX * width * 0.31 * scale;
          const pointY = height / 2 - y * height * 0.31 * scale;
          centroidX += pointX;
          centroidY += pointY;

          context.fillStyle = `${cluster.color}${active ? "dd" : dimmed ? "38" : "a8"}`;
          context.beginPath();
          context.arc(pointX, pointY, Math.max(1.05, 1.2 + rotatedZ * 0.8), 0, Math.PI * 2);
          context.fill();
        }

        const labelX = centroidX / pointCount;
        const labelY = centroidY / pointCount;
        hits.push({ x: labelX, y: labelY, r: 32, cluster });
        if (active) {
          context.strokeStyle = "rgba(255,255,255,.85)";
          context.lineWidth = 1;
          context.beginPath();
          context.arc(labelX, labelY, 25, 0, Math.PI * 2);
          context.stroke();
        }
        context.font = active ? "600 12px Inter, sans-serif" : "500 10px Inter, sans-serif";
        context.fillStyle = active ? "#ffffff" : "rgba(229,238,255,.72)";
        context.fillText(cluster.id, labelX + 11, labelY - 10);
      }

      hitRegionsRef.current = hits;
      rotationRef.current += 0.003;
      frame = window.requestAnimationFrame(draw);
    };

    frame = window.requestAnimationFrame(draw);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(frame);
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
          let closest: HitRegion | undefined;
          let closestDistance = Infinity;
          for (const region of hitRegionsRef.current) {
            const distance = Math.hypot(region.x - x, region.y - y);
            if (distance < region.r && distance < closestDistance) {
              closest = region;
              closestDistance = distance;
            }
          }
          onHover(closest?.cluster.id ?? null);
        }}
        onMouseLeave={() => onHover(null)}
        aria-label="Interactive rotating 3D vector cluster view"
      />
    </div>
  );
}
