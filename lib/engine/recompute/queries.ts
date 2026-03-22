// /lib/engine/recompute/queries.ts

/**
 * You only need to adapt THIS file if your DB client differs.
 * Assumption: /lib/db/client exports `db` with `execute({ sql, args })`.
 */
import { db } from "@/lib/db/client";

type DBRow = Record<string, any>;

async function exec(sql: string, args: any[] = []): Promise<{ rows: DBRow[] }> {
  // Adapt here if your client differs:
  const res = await db.execute({ sql, args });
  // libsql/turso typically returns { rows }
  return { rows: (res as any).rows ?? [] };
}

/**
 * Assumed events table columns:
 * - operator_id TEXT
 * - session_id TEXT
 * - event_type TEXT
 * - occurred_at TEXT (ISO)
 * - payload_json TEXT (stringified JSON)
 *
 * If your events table uses different names (payload, created_at, etc),
 * adjust ONLY these queries.
 */
export async function getSessionEvents(operator_id: string, session_id: string) {
  const { rows } = await exec(
    `
    SELECT event_type, occurred_at, payload_json
    FROM events
    WHERE operator_id = ? AND session_id = ?
      AND event_type IN (
        'session.closed',
        'classification.confirmed',
        'continuity.calculated',
        'protocol.selected'
      )
    ORDER BY occurred_at ASC
    `,
    [operator_id, session_id]
  );

  return rows.map((r) => ({
    event_type: String(r.event_type),
    occurred_at: String(r.occurred_at),
    payload: safeJson(r.payload_json),
  }));
}

export async function listClosedSessionIds(operator_id: string) {
  const { rows } = await exec(
    `
    SELECT DISTINCT session_id
    FROM events
    WHERE operator_id = ?
      AND event_type = 'session.closed'
      AND session_id IS NOT NULL
    `,
    [operator_id]
  );
  return rows.map((r) => String(r.session_id));
}

export async function upsertSessionIndex(row: {
  operator_id: string;
  session_id: string;
  occurred_at: string;
  confirmed_class: string | null;
  outcome: string;
  clarity_rating: number;
  steps_completed: number;
  continuity_before: number | null;
  continuity_after: number | null;
  continuity_delta: number | null;
  protocol_type: string | null;
  formula_version: string | null;
  is_complete: number; // 0/1
  updated_at: string;
}) {
  await exec(
    `
    INSERT INTO derived_session_index (
      operator_id, session_id, occurred_at, confirmed_class,
      outcome, clarity_rating, steps_completed,
      continuity_before, continuity_after, continuity_delta,
      protocol_type, formula_version, is_complete, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(operator_id, session_id) DO UPDATE SET
      occurred_at = excluded.occurred_at,
      confirmed_class = excluded.confirmed_class,
      outcome = excluded.outcome,
      clarity_rating = excluded.clarity_rating,
      steps_completed = excluded.steps_completed,
      continuity_before = excluded.continuity_before,
      continuity_after = excluded.continuity_after,
      continuity_delta = excluded.continuity_delta,
      protocol_type = excluded.protocol_type,
      formula_version = excluded.formula_version,
      is_complete = excluded.is_complete,
      updated_at = excluded.updated_at
    `,
    [
      row.operator_id,
      row.session_id,
      row.occurred_at,
      row.confirmed_class,
      row.outcome,
      row.clarity_rating,
      row.steps_completed,
      row.continuity_before,
      row.continuity_after,
      row.continuity_delta,
      row.protocol_type,
      row.formula_version,
      row.is_complete,
      row.updated_at,
    ]
  );
}

export async function deleteDerivedForOperator(operator_id: string) {
  await exec(`DELETE FROM derived_session_index WHERE operator_id = ?`, [operator_id]);
  await exec(`DELETE FROM derived_recurrence_stats WHERE operator_id = ?`, [operator_id]);
  await exec(`DELETE FROM derived_recovery_stats WHERE operator_id = ?`, [operator_id]);
  await exec(`DELETE FROM derived_volatility WHERE operator_id = ?`, [operator_id]);
}

export async function getSessionIndexSince(operator_id: string, sinceIso: string) {
  const { rows } = await exec(
    `
    SELECT *
    FROM derived_session_index
    WHERE operator_id = ?
      AND occurred_at >= ?
    ORDER BY occurred_at ASC
    `,
    [operator_id, sinceIso]
  );
  return rows;
}

export async function getSessionIndexWindow(operator_id: string, sinceIso: string) {
  const { rows } = await exec(
    `
    SELECT session_id, occurred_at, confirmed_class, outcome, clarity_rating,
           continuity_before, continuity_after, continuity_delta
    FROM derived_session_index
    WHERE operator_id = ?
      AND occurred_at >= ?
      AND confirmed_class IS NOT NULL
    ORDER BY occurred_at ASC
    `,
    [operator_id, sinceIso]
  );
  return rows;
}

export async function upsertRecurrence(row: {
  operator_id: string;
  class: string;
  window_days: number;
  count: number;
  last_seen_at: string | null;
  avg_days_between: number | null;
  updated_at: string;
}) {
  await exec(
    `
    INSERT INTO derived_recurrence_stats (
      operator_id, class, window_days, count, last_seen_at, avg_days_between, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(operator_id, class, window_days) DO UPDATE SET
      count = excluded.count,
      last_seen_at = excluded.last_seen_at,
      avg_days_between = excluded.avg_days_between,
      updated_at = excluded.updated_at
    `,
    [
      row.operator_id,
      row.class,
      row.window_days,
      row.count,
      row.last_seen_at,
      row.avg_days_between,
      row.updated_at,
    ]
  );
}

export async function upsertRecovery(row: {
  operator_id: string;
  class: string;
  sample_size: number;
  reduced_rate: number;
  escalated_rate: number;
  avg_sessions_to_reduce: number | null;
  avg_clarity_delta: number | null;
  updated_at: string;
}) {
  await exec(
    `
    INSERT INTO derived_recovery_stats (
      operator_id, class, sample_size,
      reduced_rate, escalated_rate,
      avg_sessions_to_reduce, avg_clarity_delta, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(operator_id, class) DO UPDATE SET
      sample_size = excluded.sample_size,
      reduced_rate = excluded.reduced_rate,
      escalated_rate = excluded.escalated_rate,
      avg_sessions_to_reduce = excluded.avg_sessions_to_reduce,
      avg_clarity_delta = excluded.avg_clarity_delta,
      updated_at = excluded.updated_at
    `,
    [
      row.operator_id,
      row.class,
      row.sample_size,
      row.reduced_rate,
      row.escalated_rate,
      row.avg_sessions_to_reduce,
      row.avg_clarity_delta,
      row.updated_at,
    ]
  );
}

export async function upsertVolatility(row: {
  operator_id: string;
  window_days: number;
  clarity_variance: number;
  continuity_variance: number;
  volatility_band: string;
  updated_at: string;
}) {
  await exec(
    `
    INSERT INTO derived_volatility (
      operator_id, window_days, clarity_variance, continuity_variance, volatility_band, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(operator_id, window_days) DO UPDATE SET
      clarity_variance = excluded.clarity_variance,
      continuity_variance = excluded.continuity_variance,
      volatility_band = excluded.volatility_band,
      updated_at = excluded.updated_at
    `,
    [
      row.operator_id,
      row.window_days,
      row.clarity_variance,
      row.continuity_variance,
      row.volatility_band,
      row.updated_at,
    ]
  );
}

function safeJson(x: any): any {
  if (x == null) return null;
  if (typeof x === "object") return x;
  try {
    return JSON.parse(String(x));
  } catch {
    return null;
  }
}