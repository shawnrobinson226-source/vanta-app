# AXIS — Runtime Governance Proof (V1)

## Status

VERIFIED — LOCKED

---

## Purpose

Document that AXIS runtime governance is:

- enforced at API level
- protecting the engine from invalid input
- aligned with governance specifications

This file exists to prevent regression, drift, or accidental weakening of enforcement.

---

## Layers Verified

### 1. Integration Gate (validateRequest.ts)

Enforces:

- `x-operator-id` REQUIRED
- Unknown fields → REJECT
- Allowed fields:
  - trigger
  - classification
  - next_action
  - outcome
  - stability (optional, validated)
  - reference (optional, validated)
  - impact (optional, validated)
- No coercion
- No defaulting
- No repair logic
- Fail-closed behavior

---

### 2. Guard Layer (processSession → guards.ts)

Requires:

- stability
- reference
- impact

Behavior:

- Blocks session if:
  - LOW_STABILITY
  - NO_REFERENCE
  - HIGH_IMPACT

Throws:

```text
"Guard blocked session"