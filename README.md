# VANTA — V1 Kernel

VANTA is a deterministic cognitive system designed to reduce distortion, restore continuity, and execute aligned action.

This repository contains the locked **V1 Kernel**: a working full-stack system with a defined taxonomy, session engine, persistence layer, and runtime dashboard.

---

## ⚙️ What VANTA Does

VANTA converts internal input into structured, actionable output:

Trigger → Classification → Protocol → Action → Logged Event → Continuity Update

This system is:
- deterministic (no guesswork)
- schema-driven (database is source of truth)
- auditable (logs + derived metrics)
- stable (V1 locked)

---

## 🧠 Core Components

### 1. Session Engine (`/session`)
Structured input → processed → stored → continuity updated

### 2. Engine Logic (`lib/engine/executionFlow.ts`)
- severity calculation
- distortion handling
- continuity delta computation

### 3. Database (Turso / SQLite)

Primary tables:
- `entries` → session logs
- `state_checks` → baseline state
- `events` → immutable event ledger

Derived tables:
- `derived_session_index`
- `derived_recurrence_stats`
- `derived_recovery_stats`
- `derived_volatility`

---

## 📊 Interface

### `/`
Entry point

### `/session`
Submit structured session input

### `/dashboard`
System state:
- continuity score
- alignment vectors
- volatility band
- recent sessions

### `/logs`
Audit trail of all sessions

### `/settings`
Reset system state

---

## 🧩 V1 Taxonomy (Locked)

Distortion Classes:
- narrative
- emotional
- behavioral
- perceptual
- continuity

Outcomes:
- reduced
- unresolved
- escalated

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/shawnrobinson226-source/vanta-app.git
cd vanta-app