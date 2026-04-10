// /lib/engine/recompute/incremental.ts

import {
  DISTORTION_CLASSES,
  RECOMPUTE_WINDOWS_DAYS,
  VOLATILITY_WINDOWS_DAYS,
  VOL_BAND,
  REDUCED_MIN_CLARITY,
  REDUCED_MIN_STEPS,
} from "@/lib/kernel/recompute";
import { avgDaysBetween, isoDaysAgo, isoNow, variance } from "@/lib/engine/recompute/math";
import {
  getSessionEvents,
  type DBRow,
  upsertSessionIndex,
  getSessionIndexWindow,
  upsertRecurrence,
  upsertRecovery,
  getSessionIndexSince,
  upsertVolatility,
} from "@/lib/engine/recompute/queries";

/**
 * recomputeIncremental(operator_id, session_id)
 * Trigger: after `session.closed` is appended to the events ledger.
 */
export async function recomputeIncremental(operator_id: string, session_id: string): Promise<void> {
  // 1) Build/Upsert derived_session_index row for this session
  const events = await getSessionEvents(operator_id, session_id);

  const latest = pickLatest(events);

  const closed = latest["session.closed"];
  if (!closed) {
    // Cannot compute without close event; fail hard (this indicates a bug in call order)
    throw new Error(`recomputeIncremental: missing session.closed for session_id=${session_id}`);
  }

  const closedPayload = asObject(closed.payload);
  const outcome = asString(closedPayload.outcome);
  const clarity = asNumber(closedPayload.exit_state_clarity_rating);
  const steps = asNumber(closedPayload.steps_completed);

  const classificationPayload = asObject(latest["classification.confirmed"]?.payload);
  const protocolPayload = asObject(latest["protocol.selected"]?.payload);
  const confirmedClass = classificationPayload.confirmed_class ?? null;
  const protocolType = protocolPayload.protocol_type ?? null;

  const continuity = asObject(latest["continuity.calculated"]?.payload);
  const beforeScore = asNumber(asObject(continuity.before).continuity_score);
  const afterScore = asNumber(asObject(continuity.after).continuity_score);
  const formulaVersion = continuity.formula_version ?? null;

  const delta = Number.isFinite(beforeScore) && Number.isFinite(afterScore) ? afterScore - beforeScore : null;

  const isComplete =
    !!confirmedClass &&
    continuity &&
    Number.isFinite(clarity) &&
    Number.isFinite(steps) &&
    typeof outcome === "string" &&
    outcome.length > 0;

  await upsertSessionIndex({
    operator_id,
    session_id,
    occurred_at: closed.occurred_at,
    confirmed_class: confirmedClass ? String(confirmedClass) : null,
    outcome,
    clarity_rating: Number.isFinite(clarity) ? clarity : 0,
    steps_completed: Number.isFinite(steps) ? steps : 0,
    continuity_before: Number.isFinite(beforeScore) ? beforeScore : null,
    continuity_after: Number.isFinite(afterScore) ? afterScore : null,
    continuity_delta: Number.isFinite(delta) ? delta : null,
    protocol_type: protocolType ? String(protocolType) : null,
    formula_version: formulaVersion ? String(formulaVersion) : null,
    is_complete: isComplete ? 1 : 0,
    updated_at: isoNow(),
  });

  // 2) Recompute rolling derived stats (7/30/90) using derived_session_index (fast)
  for (const windowDays of RECOMPUTE_WINDOWS_DAYS) {
    await recomputeRecurrence(operator_id, windowDays);
    await recomputeRecovery(operator_id, windowDays);
  }

  // 3) Recompute volatility (30/90)
  for (const windowDays of VOLATILITY_WINDOWS_DAYS) {
    await recomputeVolatility(operator_id, windowDays);
  }
}

type LedgerEvent = { event_type: string; occurred_at: string; payload: unknown };
type SessionIndexRow = DBRow;

function pickLatest(events: LedgerEvent[]) {
  const map: Record<string, LedgerEvent | undefined> = {};
  for (const e of events) map[e.event_type] = e; // since events sorted ASC, overwrite = latest
  return map;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

async function recomputeRecurrence(operator_id: string, windowDays: number) {
  const since = isoDaysAgo(windowDays);
  const rows = (await getSessionIndexWindow(operator_id, since)) as SessionIndexRow[];

  for (const cls of DISTORTION_CLASSES) {
    const byClass = rows.filter((r) => asString(r.confirmed_class) === cls);

    const count = byClass.length;
    const lastSeen = count ? asString(byClass[byClass.length - 1].occurred_at, "") : null;

    // avg days between occurrences within this window
    const times = byClass.map((r) => asString(r.occurred_at, ""));
    const avgBetween = avgDaysBetween(times);

    await upsertRecurrence({
      operator_id,
      class: cls,
      window_days: windowDays,
      count,
      last_seen_at: lastSeen,
      avg_days_between: avgBetween,
      updated_at: isoNow(),
    });
  }
}

async function recomputeRecovery(operator_id: string, windowDays: number) {
  // Use the same window read; compute per class
  const since = isoDaysAgo(windowDays);
  const rows = (await getSessionIndexWindow(operator_id, since)) as SessionIndexRow[];

  for (const cls of DISTORTION_CLASSES) {
    const byClass = rows.filter((r) => asString(r.confirmed_class) === cls);

    const sampleSize = byClass.length;
    if (!sampleSize) {
      await upsertRecovery({
        operator_id,
        class: cls,
        sample_size: 0,
        reduced_rate: 0,
        escalated_rate: 0,
        avg_sessions_to_reduce: null,
        avg_clarity_delta: null,
        updated_at: isoNow(),
      });
      continue;
    }

    // Reduced definition (V1-safe): outcome=reduced AND clarity>=threshold AND steps>=threshold
    const reducedCount = byClass.filter((r) => {
      const outcome = asString(r.outcome);
      const clarity = asNumber(r.clarity_rating);
      const steps = asNumber(r.steps_completed ?? 9); // fallback if not present in select
      return outcome === "reduced" && clarity >= REDUCED_MIN_CLARITY && steps >= REDUCED_MIN_STEPS;
    }).length;

    const escalatedCount = byClass.filter((r) => asString(r.outcome) === "escalated").length;

    // avg clarity delta within class (simple: successive difference in window)
    const claritySeries = byClass.map((r) => asNumber(r.clarity_rating)).filter(Number.isFinite);
    let avgClarityDelta: number | null = null;
    if (claritySeries.length >= 2) {
      const deltas: number[] = [];
      for (let i = 1; i < claritySeries.length; i++) deltas.push(claritySeries[i] - claritySeries[i - 1]);
      avgClarityDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    }

    await upsertRecovery({
      operator_id,
      class: cls,
      sample_size: sampleSize,
      reduced_rate: reducedCount / sampleSize,
      escalated_rate: escalatedCount / sampleSize,
      avg_sessions_to_reduce: null, // optional; keep null in V1 to avoid false precision
      avg_clarity_delta: avgClarityDelta,
      updated_at: isoNow(),
    });
  }
}

async function recomputeVolatility(operator_id: string, windowDays: number) {
  const since = isoDaysAgo(windowDays);
  const rows = (await getSessionIndexSince(operator_id, since)) as SessionIndexRow[];

  const clarity = rows.map((r) => asNumber(r.clarity_rating)).filter(Number.isFinite);
  const cont = rows
    .map((r) => asNumber(r.continuity_after))
    .filter(Number.isFinite);

  const clarityVar = variance(clarity);
  const contVar = variance(cont);

  const band = pickBand(Math.max(clarityVar, contVar));

  await upsertVolatility({
    operator_id,
    window_days: windowDays,
    clarity_variance: clarityVar,
    continuity_variance: contVar,
    volatility_band: band,
    updated_at: isoNow(),
  });
}

function pickBand(v: number): "low" | "medium" | "high" {
  if (v <= VOL_BAND.LOW_MAX) return "low";
  if (v <= VOL_BAND.MED_MAX) return "medium";
  return "high";
}
