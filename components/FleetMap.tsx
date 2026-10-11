"use client";

import { useEffect, useRef, useState } from "react";
import type { Truck, Workshop } from "../lib/demo-data";

type Props = { trucks: Truck[]; workshops: Workshop[]; selectedTruckId: string; anomalyTruckId: string | null; onSelectTruck: (id: string) => void };

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
  const objectsRef = useRef<unknown[]>([]);
  const [mapMode, setMapMode] = useState<"google" | "fallback">("fallback");

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
    if (mapMode !== "google" || !mapRef.current) return;
    const googleMaps = (window as Window & { google?: any }).google;
    if (!googleMaps?.maps) return;
    objectsRef.current.forEach((object: any) => object?.setMap?.(null));
    objectsRef.current = [];
    const selected = trucks.find((truck) => truck.id === selectedTruckId) ?? trucks[0];
    const map = new googleMaps.maps.Map(mapRef.current, {
      center: selected.route[Math.floor(selected.route.length / 2)],
      zoom: 12,
      disableDefaultUI: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0b1424" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8295b6" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0b1424" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#17263b" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#233957" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#07101d" }] },
      ],
    });

    for (const truck of trucks) {
      const active = truck.id === selectedTruckId;
      const abnormal = truck.id === anomalyTruckId;
      const line = new googleMaps.maps.Polyline({
        path: truck.route,
        geodesic: true,
        strokeColor: abnormal ? "#ff647c" : active ? truck.accent : "#415271",
        strokeOpacity: abnormal || active ? 0.95 : 0.32,
        strokeWeight: abnormal || active ? 5 : 2,
        map,
      });
      line.addListener("mouseover", () => onSelectTruck(truck.id));
      objectsRef.current.push(line);
      const marker = new googleMaps.maps.Marker({
        position: truck.route[truck.route.length - 1],
        map,
        title: truck.id,
        label: { text: "▴", color: abnormal ? "#ff647c" : truck.accent, fontSize: active ? "26px" : "19px" },
        icon: { path: googleMaps.maps.SymbolPath.CIRCLE, scale: active ? 11 : 7, fillColor: abnormal ? "#ff647c" : truck.accent, fillOpacity: 0.95, strokeColor: "#07101d", strokeWeight: 3 },
      });
      marker.addListener("click", () => onSelectTruck(truck.id));
      objectsRef.current.push(marker);
    }
    workshops.forEach((workshop) => {
      const marker = new googleMaps.maps.Marker({
        position: workshop.position,
        map,
        title: workshop.name,
        label: { text: "✚", color: "#f7f9ff", fontSize: "15px" },
        icon: { path: googleMaps.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#283b59", fillOpacity: 1, strokeColor: "#83a0cf", strokeWeight: 2 },
      });
      objectsRef.current.push(marker);
    });

    if (anomalyTruckId) {
      const anomalyTruck = trucks.find((truck) => truck.id === anomalyTruckId);
      const workshop = workshops.find((item) => item.id === anomalyTruck?.anomaly?.workshopId);
      if (anomalyTruck && workshop) {
        const renderer = new googleMaps.maps.DirectionsRenderer({ suppressMarkers: true, polylineOptions: { strokeColor: "#ffb86b", strokeOpacity: 0.95, strokeWeight: 4, icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }] } });
        renderer.setMap(map);
        const service = new googleMaps.maps.DirectionsService();
        service.route({ origin: anomalyTruck.route[anomalyTruck.route.length - 1], destination: workshop.position, travelMode: googleMaps.maps.TravelMode.DRIVING }, (result: any, status: string) => {
          if (status === "OK" && result) renderer.setDirections(result);
        });
        objectsRef.current.push(renderer);
      }
    }
  }, [mapMode, trucks, workshops, selectedTruckId, anomalyTruckId, onSelectTruck]);

  if (mapMode === "google") return <div ref={mapRef} className="fleet-map" aria-label="Google Maps fleet map" />;

  return (
    <div ref={mapRef} className="fleet-map fallback-map" aria-label="Fleet map fallback">
      <div className="map-grid" />
      <div className="map-road road-a" />
      <div className="map-road road-b" />
      <div className="map-road road-c" />
      {trucks.map((truck, index) => {
        const active = truck.id === selectedTruckId;
        const abnormal = truck.id === anomalyTruckId;
        const x = 18 + (index * 18) % 70;
        const y = 25 + ((index * 29) % 58);
        return <button key={truck.id} className={`fallback-truck ${active ? "is-active" : ""} ${abnormal ? "is-abnormal" : ""}`} style={{ left: `${x}%`, top: `${y}%`, color: abnormal ? "#ff647c" : truck.accent }} onClick={() => onSelectTruck(truck.id)} title={truck.id}>▴<span>{truck.id}</span></button>;
      })}
      {workshops.map((workshop, index) => <div key={workshop.id} className="fallback-workshop" style={{ left: `${28 + index * 27}%`, top: `${72 - index * 18}%` }} title={workshop.name}>✚</div>)}
      <div className="map-fallback-note">Google Maps API loading / demo fallback</div>
    </div>
  );
}
