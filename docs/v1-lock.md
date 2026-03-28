# VANTA V1 Lock

Status: LOCKED

## Core Rule

V1 is frozen.

No new features are added until:
- system stability is confirmed
- repo is cleaned
- documentation is complete

## Locked Taxonomy

Distortion Classes:
- narrative
- emotional
- behavioral
- perceptual
- continuity

## Locked Outcomes

- reduced
- unresolved
- escalated

## Locked Routes

- /
- /session
- /dashboard
- /logs
- /settings

## Locked System Flow

Trigger -> Classification -> Protocol -> Action -> Log -> Continuity Update

## Locked Engine

- executionFlow.ts is authoritative
- deterministic logic only
- no dynamic inference
- no runtime mutation of taxonomy

## Database Authority

- schema.sql is source of truth
- events table is immutable ledger
- derived tables are rebuildable

## Stability Requirement

Before any expansion:
- session -> dashboard -> logs loop must remain stable
- no breaking changes allowed

## Violation Rule

If a change:
- alters taxonomy
- alters engine logic
- alters core flow

-> it is not V1

## Purpose

V1 exists to prove:
- deterministic clarity system works
- full loop execution is stable
- data pipeline is reliable
