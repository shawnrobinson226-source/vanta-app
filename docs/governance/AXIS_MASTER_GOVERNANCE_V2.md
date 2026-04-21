# AXIS Master Governance V2

Status: Governance Reference
Scope: Documentation-only enforcement guidance for the AXIS repository.

## Role In Documentation Hierarchy

1. `docs/v1-lock.md` defines frozen system behavior.
2. `docs/sapphire-separation.md` defines boundary rules.
3. This document defines governance-level system rules.
4. `docs/governance/AXIS_EXTRACTION_PROTOCOL.md` defines intake discipline.
5. `docs/governance/BLOCKERS_GUARDRAILS.md` defines enforcement conditions.

This hierarchy is intentional and non-overlapping.

## Scope And Non-Goals

- AXIS governance references apply to AXIS only.
- This document does not modify runtime logic, engine behavior, taxonomy, outcomes, scoring, API contracts, or UI.
- Any mention of "VANTA" is descriptive legacy terminology from existing docs, not a separate runtime layer.

## Enforcement Posture

Enforcement behavior is fail-closed at validation boundaries:
- undefined -> reject
- unclear -> reject
- incomplete -> reject

When validation fails, the system should fail fast and surface error clearly at the validation boundary.

## Pre-AXIS And In-AXIS Output Rules

Pre-AXIS outputs (including pauses, safety screens, and intercepts) are valid and do not need to map to full execution artifacts.

After AXIS execution begins, output contracts must map to execution fields that preserve deterministic flow semantics:
- Distortion
- Protocol
- Action
- Outcome
- Continuity

## Endpoint Governance

Allowed endpoints are restricted to:
- `POST /api/v2/execute`
- `GET /api/v2/analytics`
- `GET /api/v2/operator-profile`

Requests outside this allowlist must be rejected and logged as violations.

## Distortion Lock

The distortion set remains locked under V1 governance references.
No runtime taxonomy expansion is permitted through governance interpretation.

If distortion validation fails, the system fails fast and surfaces the error clearly at the validation boundary.

## Failure Scope Definitions

Enforcement success means:
- invalid input is rejected

System success means:
- invalid input is rejected
- valid input is processed correctly

## Human-Appropriate Output Principle

AXIS enforces contracts; system output remains human-appropriate.

## Logging Safety Baseline

Violation logs must include:
- timestamp
- operator_id
- violation_type
- payload snapshot (structure only, never content)

"Payload snapshot" means structural shape and field presence only, without raw trigger text, user content, or sensitive payload values.
