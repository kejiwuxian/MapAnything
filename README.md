# MapAnything

### The startup data layer for turning unmatched data into customer-ready products.

MapAnything helps a lean team discover useful relationships between datasets that were never designed to match: no obvious labels, no shared timestamp, and no weeks spent building a one-off labeling and modeling pipeline for every new customer.

The platform is application-independent. **Fleet Agent** is one reference customer solution built on top of the Core mapping layer—not the product boundary.

## The elevator pitch

Every intelligent product startup eventually hits the same bottleneck: the data that matters exists in different systems, with different schemas, different sampling rates, and different definitions of “normal.” Before the team can ship an agent, it has to label data, align records, and train custom models for each vertical.

MapAnything turns that bottleneck into a reusable product layer. It maps two unfamiliar data worlds into an inspectable relationship, exposes evidence and confidence, and gives a startup a fast first path to a customer workflow. Fleet Agent makes the idea tangible: vehicle telemetry is connected to maintenance knowledge, an anomaly is explained, and a truck is routed to a targeted workshop.

## What the demo shows

The four-minute SpeedHacks / SR008 demo follows one idea from abstract platform to customer action:

1. **MapAnything Core** connects telemetry to another data domain and renders the discovered mapping as two interactive 3D vector spaces.
2. **Healthcare vignette** shows how wearable signals could connect to delayed medical reports to produce an early warning and focus clinical inspection. It is explicitly synthetic decision support, not diagnosis.
3. **Fleet Agent** uses the KIT Automotive OBD-II dataset as the source signal and turns mapped telemetry into a logistics workflow.
4. **Live event** arrives from an off-stage operator. The Fleet Agent highlights the affected truck, explains the mapped maintenance issue, and proposes a real-road reroute to a workshop.

## Demo URLs

| URL | Purpose |
| --- | --- |
| `/` | Application-independent MapAnything Core: upload two datasets, run clustering and alignment, and inspect cross-domain evidence. |
| `/fleet` | Fleet Agent customer application: live-style telemetry, road-following routes, anomaly explanation, and targeted rerouting. |
| `/operator` | Private off-stage console for manually injecting or clearing a fleet anomaly. |
| `/presentation` | Stage Mode: the four-minute narrative and transitions into the Core and Fleet pages. |
| `/teleprompter` | Direct-only compact three-minute teleprompter with timer, script line, click/do instruction, and automatic TX-204 anomaly injection at 02:15. |

The teleprompter is intentionally not linked from the public demo surfaces. Keep it pinned at the top of a second screen while recording the main presentation screen.

## Why it matters to a startup

- **Less labeling:** get a useful first mapping before building a perfect annotation program.
- **Less custom modeling:** reuse the correlation layer across customers and verticals.
- **Faster onboarding:** move from unfamiliar customer data to a workflow demo in minutes.
- **More explainable output:** expose the mapped evidence and confidence instead of returning an opaque score.
- **A wedge with expansion:** start with fleet operations, then reuse the same infrastructure for healthcare, industrial maintenance, insurance, energy, and other domains.

## Architecture

```text
Dataset A + Dataset B
        │
        ▼
Normalize → Embed / cluster → Cross-domain alignment → Evidence + confidence
        │                                                │
        ├── MapAnything Core 3D inspection               └── Customer applications
        │                                                       ├── Fleet Agent
        │                                                       └── Healthcare early warning
        ▼
Reusable mapping API and agent-ready signals
```

The hackathon implementation is intentionally fast and deterministic. It uses normalized K-means clustering over the complete KIT RADAR log-summary archive, a JEV-style alignment layer, and real source-derived point clouds. It demonstrates the product contract and user value without pretending that a production training system already exists.

The longer-term architecture is documented in [`docs/GRAND_VISION.md`](docs/GRAND_VISION.md): replace the deterministic alignment step with a dedicated contrastive-learning architecture that learns a reusable shared space across modalities, supports retrieval and explanation, and can be adapted to customer-specific domains without rebuilding the entire pipeline.

## Fleet Agent details

Fleet Agent is the reference customer application built on MapAnything Core.

- Source signal: the [KIT Automotive OBD-II Dataset](https://radar.kit.edu/radar/en/dataset/bCtGxdTklQlfQcAq).
- Source coverage: 81 CSV logs, 2,693,824 readings, and 10 OBD-II channels in the published archive.
- Runtime story: a deterministic live-style telemetry projection derived from the full source archive.
- Target vocabulary: synthetic maintenance concepts used to make the customer workflow explicit.
- Map: Google Maps with dark styling and Google road routing when available.
- Fallback: full road geometry from OSRM keeps the route visible if the Google Directions response is delayed or unavailable.
- Event channel: the local `/api/events` endpoint connects the off-stage operator, teleprompter automation, and Fleet Agent.

All fleet trucks and routes remain visible. Hovering changes emphasis; clicking changes focus. The abnormal truck and workshop reroute use the same real-road geometry path.

## Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/`.

For a full rehearsal:

1. Open `/presentation` on the recording display.
2. Open `/fleet` on the stage display when the narrative reaches Fleet Agent.
3. Open `/operator` on an off-stage device, or start `/teleprompter` on the second screen.
4. Start the teleprompter. At `02:15`, it automatically sends the TX-204 cooling anomaly to Fleet Agent.

## Environment variables

Copy `.env.example` to `.env.local`:

```text
VERCEL_AI_GATEWAY_API_KEY=...
AI_GATEWAY_MODEL=openai/gpt-4o-mini
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1/chat/completions
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

- The Vercel AI Gateway credential is used server-side for the explanation route.
- The Google Maps browser key is necessarily exposed to the browser; restrict it by HTTP referrer and API scope.
- Never commit `.env.local` or paste credentials into client code.

The demo includes deterministic explanation and visual route fallbacks so the local presentation can continue when a provider is unavailable. The event API uses process memory and is suitable only for a local hackathon demonstration.

## Commands

```bash
npm run dev        # local development
npm run typecheck  # TypeScript validation
npm run build      # production build validation
```

## Hackathon positioning

MapAnything is built for the A16Z SpeedHacks / SpeedRun SR008 framing: show a startup tool that saves time and resources before it becomes a horizontal platform.

The demo claim is deliberately scoped:

> MapAnything gives a small team a reusable first-pass mapping layer, so it can validate a customer workflow before committing to weeks of labeling and custom model training.

The production vision is larger than the hackathon: a learned, application-independent contrastive representation layer that continuously maps new customer data, retrieves the most relevant evidence, explains its confidence, and powers agents across domains.

## Data attribution

The fleet story is grounded in the [KIT Automotive OBD-II Dataset](https://radar.kit.edu/radar/en/dataset/bCtGxdTklQlfQcAq), by Marc Weber, Karlsruhe Institute of Technology. The healthcare example and maintenance target vocabulary are synthetic demo concepts and are not medical advice or a production diagnostic system.

## License and demo status

This repository is a hackathon demo and startup prototype. The current implementation prioritizes a credible end-to-end product experience, transparent demo boundaries, and a clear path to a production contrastive-learning architecture.
