# AXIS Extraction Protocol

Status: System Protection Document
Scope: Human extraction layer and integration gate discipline before AXIS Core interaction.

## Purpose

The AXIS Extraction Protocol defines the protected boundary between external input and AXIS Core.

External systems, human narrative, symbolic material, adapter output, or analytic signals must pass through a human extraction layer and an integration gate before they can be considered for AXIS.

The protected flow is:

`External Input -> Extraction Layer -> Integration Gate -> AXIS Core`

## Boundary Roles

### External Input

External input includes any signal, output, narrative, classification, interpretation, or system response originating outside AXIS Core.

External input is never trusted by default.

### Extraction Layer

The extraction layer converts external input into candidate structured signal.

Extraction is advisory only.

Extraction does not enforce.

Extraction does not authorize runtime behavior.

Extraction does not authorize schema changes, taxonomy changes, endpoint changes, adapter changes, engine changes, or system changes.

### Integration Gate

The integration gate enforces.

The integration gate decides whether extracted signal is valid, classified, complete, and allowed under AXIS governance.

External signal must be classified before integration.

If signal is undefined, unclear, incomplete, symbolic, narrative-only, or not compatible with locked AXIS contracts, the integration gate must reject or hold it.

### AXIS Core

AXIS Core remains immutable.

AXIS Core must not be altered by extraction output, external narrative, symbolic interpretation, adapter behavior, or downstream system pressure.

## Classification Requirement

No external signal may reach AXIS Core unless it has first been classified into an allowed AXIS structure.

Unclassified signal is not valid signal.

Partially classified signal is not valid signal.

Ambiguous classification must not be resolved by runtime inference.

If uncertain, reject or hold.

## Symbolic And Narrative Containment

Symbolic, narrative, mythic, metaphorical, emotional, or interpretive content must stay out of runtime logic.

Such content may be reviewed by humans for extraction purposes, but it must not become executable behavior, hidden system instruction, taxonomy expansion, scoring logic, routing logic, mutation logic, or enforcement logic.

Narrative may inform human understanding.

Narrative must not operate the system.

## Advisory Limit

Extraction is not integration.

Extraction is not authorization.

Extraction is not enforcement.

Extraction does not create system permission.

Extraction does not authorize system changes.

Only the integration gate may permit a classified signal to proceed, and only when the signal is valid under locked AXIS governance.

## Final Rule

When external input cannot be safely reduced to valid classified signal, AXIS must reject or hold it before it reaches AXIS Core.
