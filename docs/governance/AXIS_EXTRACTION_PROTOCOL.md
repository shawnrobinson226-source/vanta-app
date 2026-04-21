# AXIS Extraction Protocol

Status: Governance Reference
Scope: Intake discipline and validation boundaries for AXIS enforcement.

## Purpose

Define deterministic intake checks before and at AXIS execution entry, without changing runtime logic.

## Intake Discipline

Input is accepted only when identity, endpoint, and schema requirements are satisfied.

Fail-closed rules at intake:
- undefined -> reject
- unclear -> reject
- incomplete -> reject

## Validation Boundary Sequence

1. Verify endpoint against allowlist.
2. Verify required operator identity.
3. Verify schema and field constraints.
4. Verify taxonomy lock compatibility.
5. Permit AXIS execution start only when all checks pass.

## Pre-AXIS Handling

Pre-AXIS control states (including pauses, safety screens, and intercepts) are valid outputs and must not be treated as contract violations.

## Post-Execution Contract Discipline

After AXIS execution begins, output contracts are expected to map to:
- Distortion
- Protocol
- Action
- Outcome
- Continuity

This requirement starts at execution entry and is not applied to pre-AXIS controls.

## Endpoint Allowlist

Only these endpoints are allowed:
- `POST /api/v2/execute`
- `GET /api/v2/analytics`
- `GET /api/v2/operator-profile`

Unknown or non-allowlisted endpoints must be rejected and logged as violations.

## Logging Safety

Violation logging records:
- timestamp
- operator_id
- violation_type
- payload snapshot (structure only)

A payload snapshot is structure, not content. Logs must exclude raw trigger text, user content, and sensitive payload values.

## Operational Outcome Definitions

Enforcement success:
- rejects invalid input

System success:
- rejects invalid input
- correctly processes valid input
