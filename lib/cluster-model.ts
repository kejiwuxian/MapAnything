import type { Cluster } from "./demo-data";
import { kitRadarLogSummaries } from "./kit-radar-log-summaries";

export type KitRadarLogSummary = {
  id: string;
  file: string;
  rows: number;
  features: number[];
};

const colors = ["#52e6b5", "#6d8cff", "#b18cff", "#ffb86b", "#f27fa3"];
const labels = ["Idle / stop", "Urban load", "Thermal load", "Steady cruise", "Airflow drift"];
const featureNames = ["coolant temp", "intake pressure", "RPM", "speed", "intake temp", "airflow", "throttle", "ambient temp", "pedal D", "pedal E"];

function distance(left: number[], right: number[]) {
  return Math.sqrt(left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0));
}

function normalize(summaries: KitRadarLogSummary[]) {
  const dimensions = summaries[0]?.features.length ?? 0;
  const means = Array.from({ length: dimensions }, (_, index) => summaries.reduce((sum, item) => sum + item.features[index], 0) / summaries.length);
  const deviations = Array.from({ length: dimensions }, (_, index) => {
    const variance = summaries.reduce((sum, item) => sum + (item.features[index] - means[index]) ** 2, 0) / summaries.length;
    return Math.sqrt(variance) || 1;
  });
  return summaries.map((item) => item.features.map((value, index) => (value - means[index]) / deviations[index]));
}

function scalePosition(vector: number[]): [number, number, number] {
  const source = [vector[2] ?? 0, vector[3] ?? 0, vector[0] ?? 0];
  const scale = Math.max(...source.map((value) => Math.abs(value)), 1);
  return [source[0] / scale, source[2] / scale, source[1] / scale];
}

export function clusterKitRadarLogs(summaries: KitRadarLogSummary[] = kitRadarLogSummaries, clusterCount = 5): Cluster[] {
  if (!summaries.length) return [];
  const vectors = normalize(summaries);
  const ordered = vectors.map((vector, index) => ({ vector, index })).sort((left, right) => left.vector[3] - right.vector[3]);
  let centroids = Array.from({ length: clusterCount }, (_, clusterIndex) => ordered[Math.min(ordered.length - 1, Math.floor((clusterIndex * ordered.length) / clusterCount))].vector.slice());
  let assignments = vectors.map(() => 0);

  for (let iteration = 0; iteration < 32; iteration += 1) {
    assignments = vectors.map((vector) => centroids.reduce((best, centroid, index) => distance(vector, centroid) < distance(vector, centroids[best]) ? index : best, 0));
    centroids = centroids.map((centroid, clusterIndex) => {
      const members = vectors.filter((_, index) => assignments[index] === clusterIndex);
      if (!members.length) return centroid;
      return centroid.map((_, dimension) => members.reduce((sum, member) => sum + member[dimension], 0) / members.length);
    });
  }

  const ranked = centroids.map((centroid, index) => ({ centroid, index })).sort((left, right) => left.centroid[3] - right.centroid[3]);
  const clusterNames = new Map(ranked.map((item, rank) => [item.index, labels[rank] ?? `Behavior ${rank + 1}`]));

  return centroids.map((centroid, clusterIndex) => {
    const memberIndexes = assignments.map((assignment, index) => assignment === clusterIndex ? index : -1).filter((index) => index >= 0);
    const memberVectors = memberIndexes.map((index) => vectors[index]);
    const totalRows = memberIndexes.reduce((sum, index) => sum + summaries[index].rows, 0);
    const averageDistance = memberVectors.length ? memberVectors.reduce((sum, vector) => sum + distance(vector, centroid), 0) / memberVectors.length : 1;
    const confidence = Math.max(0.7, Math.min(0.98, 1 - averageDistance / 7));
    return {
      id: `A-${String(clusterIndex + 1).padStart(2, "0")}`,
      label: clusterNames.get(clusterIndex) ?? `Behavior ${clusterIndex + 1}`,
      count: totalRows,
      confidence: Number(confidence.toFixed(2)),
      position: scalePosition(centroid),
      color: colors[clusterIndex % colors.length],
      features: centroid.map((value, index) => ({ value, name: featureNames[index] })).sort((left, right) => right.value - left.value).slice(0, 3).map((item) => item.name),
      points: memberVectors.map(scalePosition),
    };
  });
}
