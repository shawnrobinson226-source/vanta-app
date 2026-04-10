// lib/storage/logStore.ts
import { createClient } from "@libsql/client";
import type { LogEntry } from "@/lib/kernel/logs";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
}

const client = createClient({ url, authToken });

// Ensure schema exists (idempotent)
let initialized = false;
async function ensureSchema() {
  if (initialized) return;

  await client.execute(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,

      stateId TEXT,
      modeId TEXT,
      toolId TEXT,

      loopId TEXT,
      loopRunId TEXT,

      stepOrder INTEGER,
      stepLabel TEXT,

      status TEXT,
      note TEXT,

      level INTEGER,
      tags TEXT
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp);
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_logs_loop ON logs (loopId);
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_logs_loopRun ON logs (loopRunId);
  `);

  initialized = true;
}

export async function appendLog(entry: LogEntry): Promise<void> {
  await ensureSchema();

  await client.execute({
    sql: `
      INSERT INTO logs (
        id, timestamp, type, message,
        stateId, modeId, toolId,
        loopId, loopRunId,
        stepOrder, stepLabel,
        status, note,
        level, tags
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?
      )
    `,
    args: [
      entry.id,
      entry.timestamp,
      entry.type,
      entry.message,

      entry.stateId ?? null,
      entry.modeId ?? null,
      entry.toolId ?? null,

      entry.loopId ?? null,
      entry.loopRunId ?? null,

      typeof entry.stepOrder === "number" ? entry.stepOrder : null,
      entry.stepLabel ?? null,

      entry.status ?? null,
      entry.note ?? null,

      typeof entry.level === "number" ? entry.level : null,
      entry.tags ? JSON.stringify(entry.tags) : null,
    ],
  });
}

export async function listLogs(limit: number = 10): Promise<LogEntry[]> {
  await ensureSchema();

  const res = await client.execute({
    sql: `SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?`,
    args: [limit],
  });

  return (res.rows as Record<string, unknown>[]).map((row) => {
    const parsedTags =
      typeof row.tags === "string"
        ? (JSON.parse(row.tags) as unknown)
        : undefined;

    return {
      id: String(row.id ?? ""),
      timestamp: String(row.timestamp ?? ""),
      type: String(row.type ?? "NOTE") as LogEntry["type"],
      message: String(row.message ?? ""),
      stateId:
        typeof row.stateId === "string"
          ? (row.stateId as LogEntry["stateId"])
          : undefined,
      modeId:
        typeof row.modeId === "string"
          ? (row.modeId as LogEntry["modeId"])
          : undefined,
      toolId:
        typeof row.toolId === "string"
          ? (row.toolId as LogEntry["toolId"])
          : undefined,
      loopId:
        typeof row.loopId === "string"
          ? (row.loopId as LogEntry["loopId"])
          : undefined,
      loopRunId: typeof row.loopRunId === "string" ? row.loopRunId : undefined,
      stepOrder: typeof row.stepOrder === "number" ? row.stepOrder : undefined,
      stepLabel: typeof row.stepLabel === "string" ? row.stepLabel : undefined,
      status: row.status === "done" || row.status === "skipped" ? row.status : undefined,
      note: typeof row.note === "string" ? row.note : undefined,
      level:
        row.level === 0 || row.level === 1 || row.level === 2 || row.level === 3
          ? row.level
          : undefined,
      tags: Array.isArray(parsedTags)
        ? parsedTags
            .filter((tag): tag is string => typeof tag === "string")
            .map((tag) => tag)
        : undefined,
    } satisfies LogEntry;
  });
}

export async function clearLogs(): Promise<void> {
  await ensureSchema();
  await client.execute(`DELETE FROM logs;`);
}
