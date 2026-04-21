# AXIS API Contract

Status: V1  
Version: v1  
Scope: Read-only external access layer for AXIS runtime state

---

## Purpose

The AXIS API exposes a stable, read-only interface over the locked V1 system.

It exists to let external consumers inspect runtime state without redefining, bypassing, or mutating AXIS core logic.

This API is a transport layer only.

AXIS remains the source of truth for:
- taxonomy
- scoring
- session engine
- continuity logic
- data contracts
- output meaning

External systems may consume AXIS outputs.

External systems may not redefine AXIS.

---

## Base Path

```text
/api/v1
