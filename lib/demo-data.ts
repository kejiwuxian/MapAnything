export type PageKey = "core" | "fleet";

export type Cluster = {
  id: string;
  label: string;
  count: number;
  confidence: number;
  position: [number, number, number];
  color: string;
  features: string[];
};

export type Mapping = {
  from: string;
  to: string[];
  confidence: number;
  rationale: string;
};

export type Workshop = {
  id: string;
  name: string;
  specialty: string;
  position: { lat: number; lng: number };
};

export type Truck = {
  id: string;
  driver: string;
  status: "healthy" | "watch" | "anomaly";
  route: { lat: number; lng: number }[];
  accent: string;
  anomaly?: {
    type: string;
    score: number;
    mappedIssue: string;
    workshopId: string;
  };
};

export type AnomalyEvent = {
  id: string;
  truckId: string;
  anomalyType: string;
  severity: number;
  detectedAt: string;
  source: string;
};

export const telemetryClusters: Cluster[] = [
  { id: "A-01", label: "Thermal load", count: 842, confidence: 0.94, position: [-0.75, 0.46, 0.2], color: "#52e6b5", features: ["coolant temp", "airflow", "ambient temp"] },
  { id: "A-02", label: "Steady cruise", count: 1240, confidence: 0.91, position: [0.42, 0.12, -0.2], color: "#6d8cff", features: ["speed", "RPM", "throttle"] },
  { id: "A-03", label: "Urban load", count: 619, confidence: 0.88, position: [0.65, -0.56, 0.38], color: "#b18cff", features: ["RPM", "speed", "intake pressure"] },
  { id: "A-04", label: "Airflow drift", count: 403, confidence: 0.83, position: [-0.14, 0.68, -0.55], color: "#ffb86b", features: ["airflow", "intake temp", "throttle"] },
  { id: "A-05", label: "Idle / stop", count: 286, confidence: 0.79, position: [-0.52, -0.46, -0.4], color: "#f27fa3", features: ["RPM", "speed", "throttle"] },
];

export const reportClusters: Cluster[] = [
  { id: "B-01", label: "Cooling system", count: 31, confidence: 0.91, position: [-0.62, 0.34, 0.28], color: "#52e6b5", features: ["coolant", "radiator", "fan inspection"] },
  { id: "B-02", label: "Normal operation", count: 74, confidence: 0.96, position: [0.36, 0.14, -0.2], color: "#6d8cff", features: ["routine", "no action", "healthy"] },
  { id: "B-03", label: "Air intake", count: 24, confidence: 0.84, position: [0.58, -0.42, 0.31], color: "#b18cff", features: ["filter", "intake", "pressure"] },
  { id: "B-04", label: "Engine performance", count: 18, confidence: 0.81, position: [-0.06, 0.62, -0.42], color: "#ffb86b", features: ["loss of power", "sensor", "inspection"] },
];

export const mappings: Mapping[] = [
  { from: "A-01", to: ["B-01"], confidence: 0.87, rationale: "Thermal load and airflow signatures align with cooling-system maintenance language." },
  { from: "A-02", to: ["B-02"], confidence: 0.93, rationale: "Stable speed/RPM distribution aligns with normal-operation reports." },
  { from: "A-03", to: ["B-04"], confidence: 0.78, rationale: "High-load transitions align with engine-performance inspection reports." },
  { from: "A-04", to: ["B-03", "B-04"], confidence: 0.82, rationale: "Airflow drift overlaps intake and performance-related report concepts." },
  { from: "A-05", to: ["B-02"], confidence: 0.71, rationale: "Idle signatures primarily align with routine operating conditions." },
];

export const workshops: Workshop[] = [
  { id: "W-01", name: "Bayline Fleet Care", specialty: "General inspection", position: { lat: 37.405, lng: -122.055 } },
  { id: "W-02", name: "Northstar Cooling", specialty: "Cooling systems", position: { lat: 37.39, lng: -122.035 } },
  { id: "W-03", name: "Redwood Truck Service", specialty: "Engine + intake", position: { lat: 37.425, lng: -122.085 } },
];

export const baseTrucks: Truck[] = [
  { id: "TX-204", driver: "M. Chen", status: "healthy", accent: "#52e6b5", route: [{ lat: 37.37, lng: -122.09 }, { lat: 37.39, lng: -122.075 }, { lat: 37.41, lng: -122.06 }, { lat: 37.43, lng: -122.04 }] },
  { id: "TX-118", driver: "J. Rivera", status: "healthy", accent: "#6d8cff", route: [{ lat: 37.35, lng: -122.06 }, { lat: 37.37, lng: -122.04 }, { lat: 37.4, lng: -122.02 }, { lat: 37.43, lng: -122.015 }] },
  { id: "TX-330", driver: "A. Patel", status: "watch", accent: "#ffb86b", route: [{ lat: 37.42, lng: -122.1 }, { lat: 37.41, lng: -122.075 }, { lat: 37.4, lng: -122.05 }, { lat: 37.39, lng: -122.02 }] },
  { id: "TX-087", driver: "R. Kim", status: "healthy", accent: "#b18cff", route: [{ lat: 37.35, lng: -122.105 }, { lat: 37.37, lng: -122.09 }, { lat: 37.39, lng: -122.08 }, { lat: 37.42, lng: -122.075 }] },
  { id: "TX-451", driver: "S. Morgan", status: "healthy", accent: "#f27fa3", route: [{ lat: 37.44, lng: -122.095 }, { lat: 37.42, lng: -122.08 }, { lat: 37.4, lng: -122.065 }, { lat: 37.38, lng: -122.05 }] },
];

export const anomalyProfiles = {
  cooling: { label: "Cooling-system signature", score: 0.87, mappedIssue: "Cooling system inspection", workshopId: "W-02" },
  intake: { label: "Air-intake drift", score: 0.82, mappedIssue: "Engine + intake inspection", workshopId: "W-03" },
  performance: { label: "Engine-performance deviation", score: 0.79, mappedIssue: "Powertrain inspection", workshopId: "W-03" },
} as const;

export type AnomalyType = keyof typeof anomalyProfiles;
