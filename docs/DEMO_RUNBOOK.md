# Four-minute live demo runbook

## Screen setup

1. Presentation screen: `http://localhost:3000/` initially, then `http://localhost:3000/fleet`.
2. Operator laptop: `http://<host>:3000/operator`.
3. Keep the operator screen off camera. It is not part of the public navigation.

## Timeline

### 0:00–0:25 — Bottleneck

Explain that every new customer data source normally creates a manual labeling, alignment, and custom-model project.

### 0:25–1:20 — Core mapping

Click **Run MapAnything**. Show the generic Dataset A / Dataset B interface and the ingest, embed, align, and explain stages.

### 1:20–1:55 — Cross-domain mapping

Hover the green Thermal Load cluster. The mapped Cooling System concept should light up in the second view. Read the confidence and rationale aloud.

### 1:55–2:10 — Healthcare expansion

Point to the healthcare strip. Explain that wearable live signals can be mapped to delayed reports to surface early warnings and a focused inspection path. State that the vignette is synthetic clinical decision support, not diagnosis.

### 2:10–2:35 — Customer application

Navigate to Fleet Agent. Explain that Fleet is one application built on the Core mapping API. Show the normal fleet state.

### 2:35–2:45 — Off-stage event

The operator selects `TX-204`, chooses `Cooling-system signature`, and clicks **Inject live anomaly**. The presenter does not touch the operator console.

### 2:45–3:30 — Action

On stage, the notification appears. The truck highlights, the reroute appears, and the explanation card names the mapped maintenance issue and recommended workshop. Click **Accept reroute**.

### 3:30–4:00 — Close

Return to the thesis: MapAnything makes unmatched data actionable without repeating bespoke labeling and model training for every application.

## Recovery plan

- If the Google Maps script is unavailable, the app displays the local SVG route map.
- If AI Gateway is unavailable, the explanation route returns the deterministic explanation.
- If the operator event is missed, use the operator console again; the presenter should wait for the live alert rather than showing the console.
- If needed, use **Reset demo state** on the Fleet Agent before the next run.
