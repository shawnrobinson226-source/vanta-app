"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDashboardStats, getLogs, type V1LogEntry } from "@/lib/storage/v1LogStore";

function Tile({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function SignalBar({ strength }: { strength: number }) {
  // strength 0..1
  const bars = 24;
  return (
    <div
      aria-label="Status signal"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${bars}, 1fr)`,
        gap: 4,
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const x = i / (bars - 1);
        // deterministic height pattern (no randomness)
        const wave = 0.35 + 0.65 * Math.abs(Math.sin((x + 0.12) * Math.PI * 2));
        const h = Math.round(6 + 44 * wave * (0.35 + 0.65 * strength));
        return (
          <div
            key={i}
            style={{
              height: h,
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
            }}
          />
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [logs, setLogs] = useState<V1LogEntry[]>([]);

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  const stats = useMemo(() => getDashboardStats(logs), [logs]);

  // “strength” is just a UI mapping from how much data exists (0..1)
  const strength = Math.min(1, logs.length / 20);

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>VANTA</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>
            Starter Pack: trigger → fracture → reframe → redirect → log.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLogs(getLogs())}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.03)",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <SignalBar strength={strength} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <Tile title="Total Entries" value={String(stats.total)} />
        <Tile title="Most Common Fracture" value={stats.mostCommonFracture ?? "—"} />
        <Tile title="Last Redirect Used" value={stats.lastRedirectUsed ?? "—"} />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <Link
          href="/session"
          style={{
            display: "inline-flex",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Start Session
        </Link>

        <Link
          href="/logs"
          style={{
            display: "inline-flex",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.03)",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          View Logs
        </Link>
      </div>

      <div style={{ marginTop: 16, opacity: 0.7, fontSize: 12 }}>
        Neutral output only. Deterministic engine. No additional features in v1.
      </div>
    </main>
  );
}