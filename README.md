# AXIS — Continuity Engine

AXIS is a deterministic execution system that converts real-world situations into structured action.

It does not generate ideas.
It classifies, directs, and tracks execution.

---

## Core Flow

AXIS follows a fixed loop:

Trigger → Classification → Protocol → Action → Logged Event → Continuity Update

* Trigger: A real situation or problem
* Classification: Mapped to one of 5 distortion classes
* Protocol: Predefined execution steps
* Action: Immediate next step
* Logged Event: Stored outcome
* Continuity Update: System state adjusts over time

---

## System Properties

* Deterministic (no randomness in core logic)
* Schema-driven (no hidden behavior)
* Operator-scoped (client-owned identity)
* Auditable (every step is traceable)
* Stable (locked taxonomy and outcomes)

---

## Distortion Classes (Locked)

* Narrative
* Emotional
* Behavioral
* Perceptual
* Continuity

---

## Outcomes (Locked)

* Reduced
* Unresolved
* Escalated

---

## API Surface

### V1 (Core System)

* /api/v1/session → create + persist session
* /api/v1/state → current system state
* /api/v1/logs → historical sessions
* /api/v1/reset → operator-scoped reset

### V2 (External Interface Layer)

* /api/v2/execute → operator-scoped execution
* /api/v2/analytics → operator analytics
* /api/v2/operator-profile → operator summary

All endpoints require:
x-operator-id

---

## Identity Model

AXIS uses a client-owned identity model:

* Operator ID is generated and stored client-side
* No server-side identity fallback
* No shared state between users
* Requests without identity fail

---

## Project Structure

app/
components/
lib/
data/
public/

* lib/engine → execution logic
* lib/operator → identity handling
* app/api → API routes
* components → UI layer

---

## Deployment

Built with:

* Next.js (App Router)
* TypeScript
* Turso (libSQL)

Live deployment:

* Vercel

---

## License

Licensed under the MIT License.

---

## Positioning

AXIS is not a chatbot.

It is a structured execution engine designed to:

* remove ambiguity
* enforce clarity
* track behavioral continuity over time

---

## Status

V2-C Architecture — Locked
System stable and ready for integration
