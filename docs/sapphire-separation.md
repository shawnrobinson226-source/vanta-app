# VANTA / Sapphire Separation

## Purpose

Define clear boundaries between:
- VANTA (core system)
- Sapphire plugin (integration layer)

## VANTA App (Source of Truth)

Owns:
- distortion taxonomy
- session engine
- continuity logic
- database schema
- event ledger
- derived analytics

VANTA defines:
- what a session is
- how it is processed
- how continuity is calculated

## Sapphire Plugin (Integration Layer)

Owns:
- external interface
- plugin-specific UI
- triggering mechanisms
- display of VANTA outputs

Does NOT own:
- taxonomy
- engine logic
- continuity scoring
- database structure

## Hard Separation Rule

Sapphire must never redefine or override VANTA core logic.

VANTA remains the authority.

## Allowed Interaction

Sapphire may:
- send structured session input
- receive processed results
- display outputs
- trigger sessions externally

## Not Allowed

Sapphire must NOT:
- modify distortion classes
- change outcomes
- alter scoring logic
- rewrite engine behavior

## Integration Path (Future)

- API layer (VANTA exposes endpoints)
- plugin consumes API
- stateless communication
- no shared internal state

## Architectural Principle

VANTA = Engine
Sapphire = Interface

They remain separate systems.

## Goal

Prevent:
- system drift
- duplicated logic
- conflicting definitions

Maintain:
- stability
- clarity
- scalability
