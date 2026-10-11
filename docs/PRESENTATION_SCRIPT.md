# Four-minute presentation script

This script is synchronized with `/presentation`. Use the stage-mode page for rehearsal; press **N** to toggle speaker cues, arrow keys or space to advance, and use the action buttons to transition into the actual Core and Fleet pages.

## 0:00–0:20 — Problem

“Startups are expected to turn messy customer data into a product before they have a large data team. But telemetry is in one place, reports are somewhere else, and every new vertical creates another labeling and custom-modeling project. MapAnything gives founders a faster path from unfamiliar data to a customer-ready workflow.”

## 0:20–0:55 — Core product

“This is MapAnything Core, our application-independent SaaS platform. I can connect two datasets without requiring perfect labels or shared timestamps. For this example, I’m connecting live-style OBD-II telemetry with maintenance reports. The platform profiles both sources, creates embeddings, clusters the latent behaviors, and learns which concepts correspond across the two datasets.”

Click **Run MapAnything**.

## 0:55–1:30 — Mapping result

“On the left are behaviors discovered in the telemetry. On the right are concepts discovered in the reports. This green cluster represents a thermal-load pattern. When I hover it, MapAnything highlights the related maintenance concept: cooling-system inspection. The important result is not just a similarity score. It is an inspectable mapping with evidence and confidence that another application can consume.”

## 1:30–1:50 — Healthcare expansion

“The same Core platform is not specific to trucks. For healthcare, the two datasets could be live wearable signals and delayed medical reports. MapAnything could surface an early warning and focus a clinician’s inspection on oxygenation or cardiology review. This is synthetic clinical decision support—not diagnosis—but it shows why the Core layer is application-independent.”

## 1:50–2:15 — Customer application

“Fleet is our first customer application built on top of that Core API. A logistics startup can use the mapping to connect truck behavior with maintenance knowledge, then build an agent that turns an anomaly into an operational decision.”

Open Fleet Agent.

## 2:15–2:40 — Normal operations

“Here is the fleet in normal operation. Each truck has its own route, and the system monitors the incoming telemetry. The customer does not need to build a new labeling pipeline for every vehicle or manually inspect every maintenance pattern.”

## 2:40–3:25 — Live anomaly and agent action

The off-stage operator injects the event.

“MapAnything has detected an anomaly on truck TX-204. The truck and route are highlighted. The mapped evidence points to a cooling-system issue. The agent recommends a workshop that specializes in that inspection and proposes a targeted reroute. This is where the mapping becomes useful: it connects an unlabeled signal to a specific, explainable action.”

Click **Accept reroute**.

## 3:25–4:00 — Close

“Today, this is a focused startup wedge. The larger vision is a reusable data alignment layer for every domain where important datasets do not naturally match. Instead of rebuilding labels and custom models for each customer, a small team can reuse the same correlation infrastructure across verticals. Fleet maintenance is our first wedge. Healthcare, industrial operations, and other high-value workflows can use the same Core platform. MapAnything helps startups ship intelligent products before their data is perfect.”
