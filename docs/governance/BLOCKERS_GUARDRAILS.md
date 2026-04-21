# Blockers And Guardrails

Status: Governance Reference
Scope: Enforcement conditions for preventing contract drift and unsafe execution paths.

## Enforcement Conditions

### 1) Identity Enforcement

- `x-operator-id` is required at intake.
- Missing or invalid identity -> reject and log violation.

### 2) Schema Validation

- Schema checks are strict.
- Unknown fields -> reject.
- Undefined, unclear, or incomplete required structures -> reject.

### 3) Taxonomy Lock

- Distortion taxonomy remains locked to current V1 definitions.
- Any undefined taxonomy member -> reject at validation boundary.
- Response behavior: fail fast and surface error clearly at validation boundary.

### 4) Endpoint Allowlist

Allowed endpoints:
- `POST /api/v2/execute`
- `GET /api/v2/analytics`
- `GET /api/v2/operator-profile`

All other endpoints -> reject and log violation.

### 5) Non-Determinism Rejection

- Inputs or requests that require non-deterministic interpretation at enforcement boundaries are rejected.
- Enforcement does not infer missing contracts.

### 6) Boundary Protection

- AXIS boundary cannot be bypassed.
- Requests attempting direct bypass of AXIS validation/execution contracts -> reject and log.

### 7) Contract Drift Detection

- Any request shape or contract semantics that drift from documented enforceable contracts -> reject and log.
- Governance references are used to detect drift; they do not redefine runtime behavior.

### 8) Logging Rules

Violation logs must include:
- timestamp
- operator_id
- violation_type
- payload snapshot (structure only)

Violation logs must not include:
- raw trigger text
- user content
- sensitive payload values

Payload snapshot means structural metadata only (field shape/presence), not content.

## Success Criteria Scope

Enforcement success:
- rejects invalid input

System success:
- rejects invalid input
- correctly processes valid input
