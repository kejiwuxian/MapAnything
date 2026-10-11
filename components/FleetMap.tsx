"use client";

import { useEffect, useRef, useState } from "react";
import type { Truck, Workshop } from "../lib/demo-data";

type Props = { trucks: Truck[]; workshops: Workshop[]; selectedTruckId: string; anomalyTruckId: string | null; onSelectTruck: (id: string) => void };
type TruckMapObjects = { line: any; marker: any };
type RoutePoint = { lat: number; lng: number };

async function fetchRoadRoute(route: RoutePoint[], signal: AbortSignal): Promise<RoutePoint[] | null> {
  const coordinates = route.map((point) => `${point.lng},${point.lat}`).join(";");
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, { signal });
  if (!response.ok) return null;
  const payload = await response.json() as { code?: string; routes?: { geometry?: { coordinates?: [number, number][] } }[] };
  const coordinatesFromRoute = payload.routes?.[0]?.geometry?.coordinates;
  if (payload.code !== "Ok" || !coordinatesFromRoute?.length) return null;
  return coordinatesFromRoute.map(([lng, lat]) => ({ lat, lng }));
}

function loadGoogleMaps(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if ((window as Window & { google?: unknown }).google) return resolve();
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
}

export default function FleetMap({ trucks, workshops, selectedTruckId, anomalyTruckId, onSelectTruck }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const objectsRef = useRef<any[]>([]);
  const truckObjectsRef = useRef<Record<string, TruckMapObjects>>({});
  const routePathsRef = useRef<Record<string, RoutePoint[]>>({});
  const hoverClearTimerRef = useRef<number | null>(null);
  const [mapMode, setMapMode] = useState<"google" | "fallback">("fallback");
  const [hoveredTruckId, setHoveredTruckId] = useState<string | null>(null);
  const [roadRoutes, setRoadRoutes] = useState<Record<string, RoutePoint[]>>({});
  const [roadRouteStatus, setRoadRouteStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const routeSignature = trucks.map((truck) => `${truck.id}:${truck.route.map((point) => `${point.lat},${point.lng}`).join(";")}`).join("|");

  const hoverTruck = (id: string) => {
    if (hoverClearTimerRef.current !== null) window.clearTimeout(hoverClearTimerRef.current);
    setHoveredTruckId(id);
  };

  const clearHoveredTruck = () => {
    if (hoverClearTimerRef.current !== null) window.clearTimeout(hoverClearTimerRef.current);
    hoverClearTimerRef.current = window.setTimeout(() => {
      setHoveredTruckId(null);
      hoverClearTimerRef.current = null;
    }, 120);
  };

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) setMapMode("google");
      })
      .catch(() => setMapMode("fallback"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setHoveredTruckId(null);
  }, [trucks, anomalyTruckId]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setRoadRoutes({});
    setRoadRouteStatus("loading");
    Promise.all(trucks.map(async (truck) => [truck.id, await fetchRoadRoute(truck.route, controller.signal)] as const))
      .then((results) => {
        if (cancelled) return;
        const nextRoutes: Record<string, RoutePoint[]> = {};
        results.forEach(([id, path]) => {
          if (path) nextRoutes[id] = path;
        });
        setRoadRoutes(nextRoutes);
        setRoadRouteStatus(Object.keys(nextRoutes).length === trucks.length ? "ready" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setRoadRouteStatus("unavailable");
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [routeSignature]);

  useEffect(() => () => {
    if (hoverClearTimerRef.current !== null) window.clearTimeout(hoverClearTimerRef.current);
  }, []);

  useEffect(() => {
    if (mapMode !== "google" || !mapRef.current) return;
    const googleMaps = (window as Window & { google?: any }).google;
    if (!googleMaps?.maps) return;
    objectsRef.current.forEach((object: any) => object?.setMap?.(null));
    objectsRef.current = [];
    truckObjectsRef.current = {};
    const selected = trucks.find((truck) => truck.id === selectedTruckId) ?? trucks[0];
    const map = new googleMaps.maps.Map(mapRef.current, {
      center: selected.route[Math.floor(selected.route.length / 2)],
      zoom: 12,
      disableDefaultUI: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0b1424" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8295b6" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0b1424" }] },
        { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#17263b" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#233957" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#07101d" }] },
      ],
    });

    const bounds = new googleMaps.maps.LatLngBounds();
    trucks.forEach((truck) => truck.route.forEach((point) => bounds.extend(point)));
    workshops.forEach((workshop) => bounds.extend(workshop.position));
    map.fitBounds(bounds, 42);

    for (const truck of trucks) {
      const abnormal = truck.id === anomalyTruckId;
      const line = new googleMaps.maps.Polyline({
        path: routePathsRef.current[truck.id] ?? roadRoutes[truck.id] ?? [],
        geodesic: true,
        strokeColor: abnormal ? "#ff647c" : truck.accent,
        strokeOpacity: abnormal ? 0.92 : 0.82,
        strokeWeight: abnormal ? 4 : 2,
        map,
      });
      line.addListener("mouseover", () => hoverTruck(truck.id));
      line.addListener("mouseout", clearHoveredTruck);
      line.addListener("click", () => onSelectTruck(truck.id));
      objectsRef.current.push(line);

      const marker = new googleMaps.maps.Marker({
        position: (roadRoutes[truck.id] ?? truck.route)[(roadRoutes[truck.id] ?? truck.route).length - 1],
        map,
        title: truck.id,
        label: { text: "▴", color: abnormal ? "#ff647c" : truck.accent, fontSize: "19px" },
        icon: { path: googleMaps.maps.SymbolPath.CIRCLE, scale: 7, fillColor: abnormal ? "#ff647c" : truck.accent, fillOpacity: 0.95, strokeColor: "#07101d", strokeWeight: 3 },
      });
      marker.addListener("mouseover", () => hoverTruck(truck.id));
      marker.addListener("mouseout", clearHoveredTruck);
      marker.addListener("click", () => onSelectTruck(truck.id));
      truckObjectsRef.current[truck.id] = { line, marker };
      objectsRef.current.push(marker);
    }

    let routeRequestsActive = true;
    const routeService = new googleMaps.maps.DirectionsService();
    trucks.forEach((truck) => {
      routeService.route({
        origin: truck.route[0],
        destination: truck.route[truck.route.length - 1],
        travelMode: googleMaps.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      }, (result: any, status: string) => {
        if (!routeRequestsActive || status !== "OK" || !result?.routes?.[0]?.overview_path) return;
        const path = result.routes[0].overview_path.map((point: any) => ({ lat: point.lat(), lng: point.lng() }));
        routePathsRef.current[truck.id] = path;
        const objects = truckObjectsRef.current[truck.id];
        if (!objects) return;
        objects.line.setPath(path);
        objects.marker.setPosition(path[path.length - 1]);
      });
    });
    if (anomalyTruckId) {
      const anomalyTruck = trucks.find((truck) => truck.id === anomalyTruckId);
      const workshop = workshops.find((item) => item.id === anomalyTruck?.anomaly?.workshopId);
      if (anomalyTruck && workshop) {
        const renderer = new googleMaps.maps.DirectionsRenderer({ suppressMarkers: true, polylineOptions: { strokeColor: "#ffb86b", strokeOpacity: 0.95, strokeWeight: 4, icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }] } });
        renderer.setMap(map);
        const fallbackReroute = new googleMaps.maps.Polyline({ path: [], geodesic: true, strokeColor: "#ffb86b", strokeOpacity: 0.95, strokeWeight: 4, map });
        const service = new googleMaps.maps.DirectionsService();
        const rerouteOrigin = anomalyTruck.route[anomalyTruck.route.length - 1];
        service.route({ origin: rerouteOrigin, destination: workshop.position, travelMode: googleMaps.maps.TravelMode.DRIVING }, (result: any, status: string) => {
          if (status === "OK" && result) {
            fallbackReroute.setMap(null);
            renderer.setDirections(result);
            return;
          }
          fetchRoadRoute([rerouteOrigin, workshop.position], new AbortController().signal)
            .then((path) => {
              if (path?.length) fallbackReroute.setPath(path);
            })
            .catch(() => undefined);
        });
        objectsRef.current.push(renderer, fallbackReroute);
      }
    }

    return () => {
      routeRequestsActive = false;
      objectsRef.current.forEach((object: any) => object?.setMap?.(null));
      objectsRef.current = [];
      truckObjectsRef.current = {};
      routePathsRef.current = {};
    };
  }, [mapMode, trucks, workshops, selectedTruckId, anomalyTruckId, onSelectTruck, roadRoutes]);

  useEffect(() => {
    const hasHover = Boolean(hoveredTruckId);
    for (const truck of trucks) {
      const objects = truckObjectsRef.current[truck.id];
      if (!objects) continue;
      const abnormal = truck.id === anomalyTruckId;
      const hovered = truck.id === hoveredTruckId;
      const opacity = hasHover ? (hovered ? 0.98 : 0.16) : abnormal ? 0.92 : 0.82;
      objects.line.setOptions({ strokeColor: abnormal ? "#ff647c" : truck.accent, strokeOpacity: opacity, strokeWeight: hovered ? 5 : abnormal ? 4 : 2 });
      objects.marker.setOptions({
        label: { text: "▴", color: abnormal ? "#ff647c" : truck.accent, fontSize: "19px" },
        icon: { path: (window as Window & { google?: any }).google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: abnormal ? "#ff647c" : truck.accent, fillOpacity: hasHover && !hovered ? 0.3 : 0.95, strokeColor: "#07101d", strokeWeight: 3 },
      });
      objects.marker.setOpacity(hasHover && !hovered ? 0.25 : 1);
    }
  }, [hoveredTruckId, trucks, anomalyTruckId, mapMode]);

  if (mapMode === "google") return <div ref={mapRef} className="fleet-map" aria-label="Google Maps fleet map" />;

  const routeForTruck = (truck: Truck) => roadRoutes[truck.id] ?? truck.route;
  const routePoints = trucks.flatMap((truck) => routeForTruck(truck));
  const minLat = Math.min(...routePoints.map((point) => point.lat), ...workshops.map((workshop) => workshop.position.lat));
  const maxLat = Math.max(...routePoints.map((point) => point.lat), ...workshops.map((workshop) => workshop.position.lat));
  const minLng = Math.min(...routePoints.map((point) => point.lng), ...workshops.map((workshop) => workshop.position.lng));
  const maxLng = Math.max(...routePoints.map((point) => point.lng), ...workshops.map((workshop) => workshop.position.lng));
  const project = (point: { lat: number; lng: number }) => ({ x: ((point.lng - minLng) / (maxLng - minLng)) * 76 + 12, y: (1 - (point.lat - minLat) / (maxLat - minLat)) * 66 + 16 });
  const hasHover = Boolean(hoveredTruckId);

  return (
    <div ref={mapRef} className="fleet-map fallback-map" aria-label="Fleet map fallback">
      <div className="map-grid" />
      <svg className="fallback-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Fleet routes">
        {trucks.map((truck) => {
          const abnormal = truck.id === anomalyTruckId;
          const hovered = truck.id === hoveredTruckId;
          const points = routeForTruck(truck).map((point) => {
            const projected = project(point);
            return `${projected.x},${projected.y}`;
          }).join(" ");
          return <polyline key={truck.id} className={`fallback-route ${hasHover && hovered ? "is-hovered" : ""} ${hasHover && !hovered ? "is-dimmed" : ""}`} points={points} style={{ stroke: abnormal ? "#ff647c" : truck.accent }} onMouseEnter={() => hoverTruck(truck.id)} onMouseLeave={clearHoveredTruck} onClick={() => onSelectTruck(truck.id)} />;
        })}
      </svg>
      {trucks.map((truck) => {
        const abnormal = truck.id === anomalyTruckId;
        const hovered = truck.id === hoveredTruckId;
        const route = routeForTruck(truck);
        const endpoint = project(route[route.length - 1]);
        return <button key={truck.id} className={`fallback-truck ${hasHover && hovered ? "is-hovered" : ""} ${hasHover && !hovered ? "is-dimmed" : ""} ${abnormal ? "is-abnormal" : ""}`} style={{ left: `${endpoint.x}%`, top: `${endpoint.y}%`, color: abnormal ? "#ff647c" : truck.accent }} onMouseEnter={() => hoverTruck(truck.id)} onMouseLeave={clearHoveredTruck} onClick={() => onSelectTruck(truck.id)} title={truck.id}>▴<span>{truck.id}</span></button>;
      })}
      <div className="map-fallback-note">{roadRouteStatus === "ready" ? "OSRM road geometry · real streets" : roadRouteStatus === "loading" ? "Requesting road geometry…" : "Road routing unavailable · source path shown"}</div>
    </div>
  );
}
