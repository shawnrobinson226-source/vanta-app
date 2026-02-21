# VANTA v1 — Starter Pack Scope (Locked)

## The Only Loop
1) User enters a Trigger (free text)
2) System returns:
   - Likely Fracture (finite set)
   - Reframe (plain, reality-grounded)
   - One Redirect (single behavioral action)
3) System logs the entry

## Hard Constraints
- No identity layer
- No myth layer
- No persona
- No continuity scoring
- No drift detection
- No 9-step protocol
- Deterministic output first (AI later, optional)

## In Scope
- 10 fracture definitions (static)
- deterministic matcher: trigger -> fracture guess
- reframe templates per fracture
- redirect templates per fracture
- persistence (Turso)
- minimal UI: /session, /logs, /dashboard

## Acceptance Criteria
- Works locally and on Vercel
- /session produces deterministic results
- /logs shows last 20 entries
- /dashboard shows:
  - total entries
  - most common fracture
  - last redirect used