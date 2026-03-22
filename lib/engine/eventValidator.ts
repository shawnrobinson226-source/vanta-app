// lib/engine/eventValidator.ts

import {
  DISTORTION_CLASS,
  EVENT_TYPE,
  INTENSITY,
  REDUCTION_PROTOCOL,
  SESSION_OUTCOME,
  type VantaEvent,
  type EventType,
} from "@/lib/kernel/events";

type ValidationError = { path: string; message: string };

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationError[] };

function err(path: string, message: string): ValidationError {
  return { path, message };
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function isNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function isISODate(x: unknown): x is string {
  return isString(x) && !Number.isNaN(Date.parse(x));
}

function oneOf<T extends readonly string[]>(
  x: unknown,
  vals: T
): x is T[number] {
  return isString(x) && (vals as readonly string[]).includes(x);
}

function inRange(x: unknown, min: number, max: number): x is number {
  return isNumber(x) && x >= min && x <= max;
}

function requireField(
  obj: Record<string, unknown>,
  key: string,
  errors: ValidationError[],
  path: string
) {
  if (!(key in obj)) errors.push(err(path, "Missing field"));
}

/**
 * Base envelope validation
 */
function validateBase(e: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!oneOf(e.event_type, EVENT_TYPE))
    errors.push(err("event_type", "Invalid event_type"));
  if (!isString(e.event_id) || e.event_id.length < 8)
    errors.push(err("event_id", "Invalid event_id"));
  if (!isISODate(e.occurred_at))
    errors.push(err("occurred_at", "Invalid ISO timestamp"));
  if (!isString(e.schema_version))
    errors.push(err("schema_version", "Missing schema_version"));

  if (!isString(e.operator_id) || e.operator_id.length < 3)
    errors.push(err("operator_id", "Invalid operator_id"));

  if (!isObject(e.actor)) errors.push(err("actor", "Missing actor"));
  else {
    const a = e.actor as Record<string, unknown>;
    if (!oneOf(a.kind, ["human", "system", "ai"] as const))
      errors.push(err("actor.kind", "Invalid actor.kind"));
    if ("actor_id" in a && a.actor_id != null && !isString(a.actor_id))
      errors.push(err("actor.actor_id", "Invalid actor_id"));
  }

  if ("meta" in e && e.meta != null && !isObject(e.meta))
    errors.push(err("meta", "meta must be an object"));

  return errors;
}

/**
 * Event-specific validators
 */
function validateByType(
  e: Record<string, unknown>,
  type: EventType
): ValidationError[] {
  const errors: ValidationError[] = [];
  const payload = e.payload;

  if (!isObject(payload)) {
    errors.push(err("payload", "payload must be an object"));
    return errors;
  }

  const p = payload as Record<string, unknown>;

  switch (type) {
    case "session.created": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if ("entry_state_context" in p && p.entry_state_context != null && !isString(p.entry_state_context))
        errors.push(err("payload.entry_state_context", "Must be string"));
      if ("entry_state_mood" in p && p.entry_state_mood != null && !isString(p.entry_state_mood))
        errors.push(err("payload.entry_state_mood", "Must be string"));
      break;
    }

    case "input.trigger.recorded": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!isString(p.trigger_text) || p.trigger_text.trim().length === 0)
        errors.push(err("payload.trigger_text", "trigger_text required"));

      if ("intensity" in p && p.intensity != null && !oneOf(p.intensity, INTENSITY))
        errors.push(err("payload.intensity", "Invalid intensity"));

      if ("context_tags" in p && p.context_tags != null) {
        if (!Array.isArray(p.context_tags)) errors.push(err("payload.context_tags", "Must be string[]"));
        else if (!(p.context_tags as unknown[]).every(isString))
          errors.push(err("payload.context_tags", "Must be string[]"));
      }
      break;
    }

    case "session.step.completed": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!isNumber(p.step) || ![1,2,3,4,5,6,7,8,9].includes(p.step))
        errors.push(err("payload.step", "Step must be 1..9"));
      if ("note" in p && p.note != null && !isString(p.note))
        errors.push(err("payload.note", "Must be string"));
      break;
    }

    case "input.mapping.recorded": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!isObject(p.spreads_into)) errors.push(err("payload.spreads_into", "Required object"));
      else {
        const s = p.spreads_into as Record<string, unknown>;
        if ("thought" in s && s.thought != null && !isString(s.thought))
          errors.push(err("payload.spreads_into.thought", "Must be string"));
        if ("emotion" in s && s.emotion != null && !isString(s.emotion))
          errors.push(err("payload.spreads_into.emotion", "Must be string"));
        if ("behavior" in s && s.behavior != null && !isString(s.behavior))
          errors.push(err("payload.spreads_into.behavior", "Must be string"));
      }
      break;
    }

    case "ai.classification.suggested": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!oneOf(p.suggested_class, DISTORTION_CLASS))
        errors.push(err("payload.suggested_class", "Invalid class"));
      if ("confidence" in p && p.confidence != null && !inRange(p.confidence, 0, 1))
        errors.push(err("payload.confidence", "confidence must be 0..1"));
      if ("rationale" in p && p.rationale != null && !isString(p.rationale))
        errors.push(err("payload.rationale", "Must be string"));
      break;
    }

    case "classification.confirmed": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!oneOf(p.confirmed_class, DISTORTION_CLASS))
        errors.push(err("payload.confirmed_class", "Invalid class"));
      if (p.confirmed_by !== "human")
        errors.push(err("payload.confirmed_by", "Must be 'human'"));
      break;
    }

    case "protocol.selected": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!oneOf(p.protocol_type, REDUCTION_PROTOCOL))
        errors.push(err("payload.protocol_type", "Invalid protocol"));
      break;
    }

    case "protocol.executed": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!oneOf(p.protocol_type, REDUCTION_PROTOCOL))
        errors.push(err("payload.protocol_type", "Invalid protocol"));
      if ("output" in p && p.output != null && !isString(p.output))
        errors.push(err("payload.output", "Must be string"));
      break;
    }

    case "reset.invoked": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!oneOf(p.reason, ["user_overwhelm","intensity_high","session_failed_to_reduce"] as const))
        errors.push(err("payload.reason", "Invalid reason"));
      break;
    }

    case "reset.completed": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!isNumber(p.pause_seconds) || p.pause_seconds < 10 || p.pause_seconds > 600)
        errors.push(err("payload.pause_seconds", "pause_seconds out of range"));
      if ("user_reported_clarity" in p && p.user_reported_clarity != null && !inRange(p.user_reported_clarity, 0, 10))
        errors.push(err("payload.user_reported_clarity", "0..10"));
      break;
    }

    case "continuity.calculated": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));

      requireField(p, "before", errors, "payload.before");
      requireField(p, "after", errors, "payload.after");

      const checkBlock = (blk: unknown, path: string) => {
        if (!isObject(blk)) { errors.push(err(path, "Must be object")); return; }
        const b = blk as Record<string, unknown>;
        for (const k of ["perception_alignment","identity_alignment","intention_alignment","action_alignment","continuity_score"] as const) {
          if (!inRange(b[k], 0, 100)) errors.push(err(`${path}.${k}`, "Must be 0..100"));
        }
      };
      checkBlock(p.before, "payload.before");
      checkBlock(p.after, "payload.after");

      if (!isString(p.formula_version))
        errors.push(err("payload.formula_version", "formula_version required"));
      break;
    }

    case "fracture.created": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!isString(e.fracture_id)) errors.push(err("fracture_id", "fracture_id required"));
      if (!oneOf(p.type, DISTORTION_CLASS)) errors.push(err("payload.type", "Invalid fracture type"));

      if ("intensity" in p && p.intensity != null && !oneOf(p.intensity, INTENSITY))
        errors.push(err("payload.intensity", "Invalid intensity"));
      if ("risk_level" in p && p.risk_level != null && !oneOf(p.risk_level, ["low","medium","high"] as const))
        errors.push(err("payload.risk_level", "Invalid risk_level"));
      break;
    }

    case "fracture.status.changed": {
      if (!isString(e.fracture_id)) errors.push(err("fracture_id", "fracture_id required"));
      if (!oneOf(p.from, ["active","mapped","reduced","integrated"] as const))
        errors.push(err("payload.from", "Invalid status"));
      if (!oneOf(p.to, ["active","mapped","reduced","integrated"] as const))
        errors.push(err("payload.to", "Invalid status"));

      // V1: forbid regression
      const order = ["active","mapped","reduced","integrated"] as const;
      const fromIdx = order.indexOf(p.from as any);
      const toIdx = order.indexOf(p.to as any);
      if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx)
        errors.push(err("payload.to", "Regression forbidden in V1"));
      break;
    }

    case "distortion.created": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!isString(e.fracture_id)) errors.push(err("fracture_id", "fracture_id required"));
      if (!isString(e.distortion_id)) errors.push(err("distortion_id", "distortion_id required"));
      if (!oneOf(p.class, DISTORTION_CLASS)) errors.push(err("payload.class", "Invalid class"));
      if ("severity" in p && p.severity != null && !inRange(p.severity, 0, 10))
        errors.push(err("payload.severity", "severity must be 0..10"));
      break;
    }

    case "distortion.status.changed": {
      if (!isString(e.distortion_id)) errors.push(err("distortion_id", "distortion_id required"));
      if (!oneOf(p.from, ["active","unresolved","reduced"] as const))
        errors.push(err("payload.from", "Invalid status"));
      if (!oneOf(p.to, ["active","unresolved","reduced"] as const))
        errors.push(err("payload.to", "Invalid status"));

      // V1: do not reopen reduced
      if (p.from === "reduced" && p.to !== "reduced")
        errors.push(err("payload.to", "Cannot reopen reduced distortion in V1"));
      break;
    }

    case "action.aligned.logged": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!isString(p.aligned_next_action) || p.aligned_next_action.trim().length === 0)
        errors.push(err("payload.aligned_next_action", "Required"));
      if ("due_within_hours" in p && p.due_within_hours != null && (!isNumber(p.due_within_hours) || p.due_within_hours < 1 || p.due_within_hours > 168))
        errors.push(err("payload.due_within_hours", "1..168"));
      break;
    }

    case "action.aligned.completed": {
      if (!isString(p.aligned_next_action) || p.aligned_next_action.trim().length === 0)
        errors.push(err("payload.aligned_next_action", "Required"));
      if (!isISODate(p.completed_at))
        errors.push(err("payload.completed_at", "Invalid ISO date"));
      break;
    }

    case "session.closed": {
      if (!isString(e.session_id)) errors.push(err("session_id", "session_id required"));
      if (!oneOf(p.outcome, SESSION_OUTCOME)) errors.push(err("payload.outcome", "Invalid outcome"));
      if (!inRange(p.exit_state_clarity_rating, 0, 10))
        errors.push(err("payload.exit_state_clarity_rating", "0..10"));
      if (!isNumber(p.steps_completed) || p.steps_completed < 0 || p.steps_completed > 9)
        errors.push(err("payload.steps_completed", "0..9"));

      // Guardrails (FIXED): reduced requires minimum steps
      if (
        p.outcome === "reduced" &&
        (p.steps_completed == null || (p.steps_completed as number) < 6)
      ) {
        errors.push(err("payload.steps_completed", "Reduced requires >= 6 steps"));
      }
      break;
    }

    default:
      errors.push(err("event_type", `No validator implemented for ${type}`));
  }

  return errors;
}

/**
 * Public entrypoint
 */
export function validateEvent(input: unknown): ValidationResult<VantaEvent> {
  if (!isObject(input)) return { ok: false, errors: [err("", "Event must be an object")] };

  const e = input as Record<string, unknown>;
  const baseErrors = validateBase(e);
  if (baseErrors.length) return { ok: false, errors: baseErrors };

  const type = e.event_type as EventType;
  const typeErrors = validateByType(e, type);
  if (typeErrors.length) return { ok: false, errors: typeErrors };

  return { ok: true, value: input as VantaEvent };
}