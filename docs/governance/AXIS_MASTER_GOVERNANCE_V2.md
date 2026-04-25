# AXIS Master Governance V2

Status: System Protection Document
Scope: Kernel lock, enforcement roles, endpoint discipline, taxonomy lock, and rejection rules for AXIS V2.

## Kernel Lock

The VANTA/AXIS kernel is locked.

The locked kernel defines the protected execution boundary for AXIS. It must not be expanded, bypassed, reinterpreted, or mutated by external systems, adapter output, symbolic content, narrative content, inferred intent, or incomplete integration proposals.

AXIS rejects drift before it reaches runtime behavior.

## System Roles

### AXIS

AXIS is the enforcement system.

AXIS owns validation, rejection, allowed endpoint discipline, locked taxonomy discipline, locked outcome discipline, and execution contract protection.

AXIS does not accept parallel enforcement logic from external systems.

### Sapphire

Sapphire is adapter-only.

Sapphire may provide external signal or adapter output for review by the extraction layer and integration gate.

Sapphire does not define AXIS runtime logic.

Sapphire does not expand AXIS taxonomy.

Sapphire does not mutate AXIS outcomes.

Sapphire does not authorize endpoint changes.

Sapphire does not bypass AXIS enforcement.

### DES

DES remains separate unless explicitly integrated later.

DES has no implicit authority over AXIS runtime behavior, AXIS taxonomy, AXIS outcomes, AXIS endpoints, AXIS identity requirements, or AXIS governance.

Any future DES integration must be explicit, documented, reviewed, and passed through the integration gate.

## Identity Requirement

All protected AXIS requests require `x-operator-id`.

Requests without `x-operator-id` must be rejected.

Identity must be present before execution, analytics access, or operator profile access.

## Locked Distortion Taxonomy

The distortion taxonomy is locked to:

- `narrative`
- `emotional`
- `behavioral`
- `perceptual`
- `continuity`

No other distortion value is valid.

External systems, extraction output, symbolic content, narrative content, or adapter output may not add, rename, alias, merge, split, or reinterpret distortion values.

## Locked Outcomes

The outcome set is locked to:

- `reduced`
- `unresolved`
- `escalated`

No other outcome value is valid.

External systems, extraction output, symbolic content, narrative content, or adapter output may not add, rename, alias, merge, split, or reinterpret outcome values.

## Allowed Endpoints

The allowed AXIS endpoints are:

- `POST /api/v2/execute`
- `GET /api/v2/analytics`
- `GET /api/v2/operator-profile`

No other endpoint is authorized by this governance document.

Wrong endpoints must be rejected.

## Hard Rejection Rules

AXIS must reject any request, signal, adapter output, or integration proposal containing any of the following:

- Missing identity
- Unknown fields
- Invalid distortion
- Wrong endpoint
- Symbolic injection
- Parallel system logic
- Hidden mutation

### Missing Identity

Reject when `x-operator-id` is absent, empty, malformed, or unavailable at the required validation boundary.

### Unknown Fields

Reject when payloads contain fields outside the locked contract.

Unknown fields must not be ignored, inferred, stored, forwarded, or normalized into valid fields.

### Invalid Distortion

Reject when distortion is absent, unclear, incomplete, symbolic, narrative-only, or outside the locked distortion taxonomy.

### Wrong Endpoint

Reject when the request targets any endpoint outside the allowed endpoint list.

### Symbolic Injection

Reject when symbolic, narrative, mythic, metaphorical, emotional, or interpretive content attempts to become runtime logic, hidden instruction, taxonomy expansion, scoring logic, routing logic, mutation logic, or enforcement logic.

### Parallel System Logic

Reject when an external system attempts to operate beside, above, around, or inside AXIS as an independent enforcement layer.

Sapphire remains adapter-only.

DES remains separate unless explicitly integrated later.

### Hidden Mutation

Reject when any request, signal, adapter output, or integration proposal attempts to change AXIS behavior without explicit documented authorization.

Hidden mutation includes implicit schema changes, taxonomy changes, outcome changes, endpoint changes, identity requirement changes, engine changes, scoring changes, routing changes, logging changes, persistence changes, or policy changes.

## Integration Gate

External signal must be classified before integration.

The integration gate enforces AXIS governance before any signal reaches AXIS Core.

If signal is undefined, unclear, incomplete, or incompatible with locked AXIS contracts, the integration gate must reject or hold it.

## Final Rule

AXIS rejects anything undefined, unclear, or incomplete.
