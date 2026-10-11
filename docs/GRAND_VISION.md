# MapAnything grand vision

## Product thesis

MapAnything is a reusable correlation layer for organizations whose important datasets live in separate systems, use different schemas, and rarely have clean labels or shared timestamps.

The immediate benefit is saved human time: data scientists and domain experts spend less time hand-labeling records, writing one-off alignment code, and training a new model for every customer. The long-term product is not a fleet dashboard. It is the mapping infrastructure that lets many customer applications consume the same learned relationships.

## Hackathon architecture vs. production architecture

The hackathon uses a deterministic JEV-style adapter:

```text
dataset profiles
→ demo embeddings
→ cluster prototypes
→ cross-dataset affinity
→ confidence + explanation
```

This is intentionally fast and predictable for a live demo. The Fleet Agent consumes the resulting mapping through a stable application contract.

The production direction replaces the JEV adapter with a dedicated multimodal contrastive-learning architecture:

```text
raw streams / records
→ modality encoders
→ domain-normalized latent spaces
→ contrastive alignment objective
→ cluster and concept memory
→ anomaly + explanation APIs
```

JEV remains a compatibility layer during migration, but it should not be the long-term learning primitive.

## Target production architecture

### 1. Ingestion and schema intelligence

Accept CSV, Parquet, SQL extracts, event streams, documents, and selected APIs. Infer field types, sampling rates, entity candidates, units, missingness, and privacy class. Preserve provenance for every row and transformation.

### 2. Modality-specific encoders

- Numeric telemetry encoder: temporal convolution or transformer over windows, with masking for missing channels.
- Text encoder: domain-adapted transformer for reports, tickets, and notes.
- Event encoder: learned representation of categorical and irregular events.
- Optional image/audio encoders for future modalities.

Each encoder emits a normalized representation plus uncertainty and data-quality features.

### 3. Dedicated contrastive alignment

The core training objective should combine:

- Within-domain augmentation positives, such as jittered telemetry windows or paraphrased reports.
- Weak cross-domain positives from entity context, coarse time proximity, shared metadata, or distributional neighborhoods.
- Hard negatives selected from nearby but operationally distinct clusters.
- A cycle-consistency loss so a mapped concept can be projected back to the original domain.
- An uncertainty-aware loss so low-quality or weakly supported matches do not become overconfident links.

Because fully unpaired alignment is not identifiable without assumptions, the platform must expose which weak signals produced each mapping. The product should report evidence and uncertainty rather than implying magic matching.

### 4. Mapping memory

Store versioned cluster prototypes, cross-domain edges, representative records, evidence spans, and user feedback. A mapping is an inspectable artifact with lineage, not an opaque model output.

### 5. Continuous adaptation

New customer data should update the mapping through controlled incremental training. Use drift detection, replay buffers, frozen evaluation slices, and human approval for high-impact mapping changes.

### 6. Application APIs

The Core API should expose stable primitives:

```text
POST /datasets/profile
POST /mappings/build
GET  /mappings/:id/clusters
GET  /mappings/:id/edges
POST /anomalies/score
POST /explanations/generate
POST /feedback
```

Customer applications should consume these APIs without depending on the internal encoder or clustering implementation.

## Fleet application path

Fleet is the first wedge because it has a clear economic loop:

```text
telemetry anomaly
→ mapped maintenance concept
→ targeted inspection
→ reduced roadside failure / downtime
```

The customer can build its own route-planning agent on top of MapAnything. MapAnything supplies evidence, confidence, and mapped concepts; the agent supplies workflow orchestration and customer-specific policy.

## Healthcare expansion path

Healthcare is a later regulated application. The potential flow is wearable live data mapped to delayed clinical reports, producing early-warning and inspection-priority signals. Production healthcare would require de-identification, consent, audit trails, clinical validation, calibration, human review, and regulatory analysis. The platform must remain decision support and must not present a mapping as a diagnosis.

## Business model

- Platform subscription for mapping workspaces.
- Usage-based pricing per mapped dataset pair or scored event volume.
- Enterprise deployment for sensitive or regulated data.
- API and SDK licensing for customer-built agents.

## Defensibility

The defensible asset is the reusable mapping memory and feedback loop:

```text
more domains
→ more validated alignment patterns
→ faster customer onboarding
→ stronger evidence and better hard negatives
→ less custom labeling per deployment
```

## What must be proven next

1. Compare first-pass mapping time against a documented manual baseline.
2. Measure precision and calibration on held-out cross-domain mappings.
3. Prove that customer feedback improves future mappings without catastrophic drift.
4. Demonstrate that a single Core model can support multiple customer domains without domain leakage.
5. Quantify operational value for Fleet: avoided breakdowns, targeted inspection rate, and unnecessary reroutes.
