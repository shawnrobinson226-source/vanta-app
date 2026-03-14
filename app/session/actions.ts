"use server";

import { randomUUID } from "node:crypto";
import { db, initDbIfNeeded } from "@/lib/db/client";
import { validateAndNormalizeEntry } from "@/lib/validation/entry";
import type { AnalysisResult } from "@/lib/kernel/v1/types";

type CreateEntryInput = {
  trigger: string;
  analysis: AnalysisResult;
};

type CreateStateCheckInput = {
  clarity: number;
  emotionalLoad: number;
  note?: string;
};

type DashboardStats = {
  total: number;
  uniqueFractures: number;
  mostCommonFracture: string | null;
  lastRedirectUsed: string | null;
};

type RecentEntryRow = {
  id: string;
  trigger: string;
  fracture_id: string;
  fracture_label: string;
  redirect_id: string;
  redirect_label: string;
  created_at: string;
};

type LatestStateCheck = {
  id: string;
  clarity: number;
  emotionalLoad: number;
  note: string | null;
  created_at: string;
} | null;

export async function createEntry(input: CreateEntryInput) {
  await initDbIfNeeded();

  const clean = validateAndNormalizeEntry({
    trigger: input.trigger,
    analysis: input.analysis,
  });

  const DEDUPE_WINDOW_SEC = 30;

  const existing = await db.execute({
    sql: `
      SELECT id
      FROM entries
      WHERE trigger = ?
        AND fracture_id = ?
        AND redirect_id = ?
        AND created_at >= datetime('now', ?)
      LIMIT 1
    `,
    args: [
      clean.trigger,
      clean.fracture_id,
      clean.redirect_id,
      `-${DEDUPE_WINDOW_SEC} seconds`,
    ],
  });

  if (existing.rows?.length) {
    return { ok: true as const, deduped: true as const };
  }

  await db.execute({
    sql: `
      INSERT INTO entries (
        id,
        trigger,
        fracture_id,
        fracture_label,
        reframe,
        redirect_id,
        redirect_label,
        redirect_steps_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    args: [
      randomUUID(),
      clean.trigger,
      clean.fracture_id,
      clean.fracture_label,
      clean.reframe,
      clean.redirect_id,
      clean.redirect_label,
      clean.redirect_steps_json,
    ],
  });

  return { ok: true as const, deduped: false as const };
}

export async function createStateCheck(input: CreateStateCheckInput) {
  await initDbIfNeeded();

  const clarity = Math.max(1, Math.min(10, Number(input.clarity) || 1));
  const emotionalLoad = Math.max(1, Math.min(10, Number(input.emotionalLoad) || 1));
  const note =
    typeof input.note === "string" && input.note.trim()
      ? input.note.trim().slice(0, 500)
      : null;

  await db.execute({
    sql: `
      INSERT INTO state_checks (
        id,
        clarity,
        emotional_load,
        note,
        created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `,
    args: [randomUUID(), clarity, emotionalLoad, note],
  });

  return { ok: true as const };
}

export async function getLatestStateCheck(): Promise<LatestStateCheck> {
  await initDbIfNeeded();

  const res = await db.execute({
    sql: `
      SELECT
        id,
        clarity,
        emotional_load,
        note,
        created_at
      FROM state_checks
      ORDER BY created_at DESC
      LIMIT 1
    `,
  });

  const row = res.rows?.[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  return {
    id: String(row.id ?? ""),
    clarity: Number(row.clarity ?? 0),
    emotionalLoad: Number(row.emotional_load ?? 0),
    note: typeof row.note === "string" ? row.note : null,
    created_at: String(row.created_at ?? ""),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await initDbIfNeeded();

  let total = 0;
  let uniqueFractures = 0;
  let mostCommonFracture: string | null = null;
  let lastRedirectUsed: string | null = null;

  try {
    const result = await db.execute({
      sql: `
        SELECT
          COUNT(*) as total,
          COUNT(DISTINCT fracture_id) as uniqueFractures
        FROM entries
      `,
    });

    const row = result.rows?.[0] as Record<string, unknown> | undefined;
    total = Number(row?.total ?? 0);
    uniqueFractures = Number(row?.uniqueFractures ?? 0);
  } catch (err) {
    console.error("getDashboardStats: counts query failed", err);
  }

  try {
    const mostCommon = await db.execute({
      sql: `
        SELECT fracture_label
        FROM entries
        WHERE fracture_label IS NOT NULL AND fracture_label != ''
        GROUP BY fracture_label
        ORDER BY COUNT(*) DESC
        LIMIT 1
      `,
    });

    const row = mostCommon.rows?.[0] as Record<string, unknown> | undefined;
    const label = row?.fracture_label;
    mostCommonFracture =
      typeof label === "string" && label.trim() ? label : null;
  } catch (err) {
    console.error("getDashboardStats: mostCommon query failed", err);
  }

  try {
    const lastRedirect = await db.execute({
      sql: `
        SELECT redirect_label
        FROM entries
        WHERE redirect_label IS NOT NULL AND redirect_label != ''
        ORDER BY created_at DESC
        LIMIT 1
      `,
    });

    const row = lastRedirect.rows?.[0] as Record<string, unknown> | undefined;
    const label = row?.redirect_label;
    lastRedirectUsed =
      typeof label === "string" && label.trim() ? label : null;
  } catch (err) {
    console.error("getDashboardStats: lastRedirect query failed", err);
  }

  return {
    total,
    uniqueFractures,
    mostCommonFracture,
    lastRedirectUsed,
  };
}

export async function getRecentEntries(limit = 20): Promise<RecentEntryRow[]> {
  await initDbIfNeeded();

  const n = Math.max(1, Math.min(200, Number(limit) || 20));

  const res = await db.execute({
    sql: `
      SELECT
        id,
        trigger,
        fracture_id,
        fracture_label,
        redirect_id,
        redirect_label,
        created_at
      FROM entries
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [n],
  });

  return (res.rows ?? []).map((r) => {
    const row = r as Record<string, unknown>;

    return {
      id: String(row.id ?? ""),
      trigger: String(row.trigger ?? ""),
      fracture_id: String(row.fracture_id ?? ""),
      fracture_label: String(row.fracture_label ?? ""),
      redirect_id: String(row.redirect_id ?? ""),
      redirect_label: String(row.redirect_label ?? ""),
      created_at: String(row.created_at ?? ""),
    };
  });
}

export async function resetEntries() {
  await initDbIfNeeded();
  await db.execute({ sql: `DELETE FROM entries` });
  await db.execute({ sql: `DELETE FROM state_checks` });
  return { ok: true as const };
}