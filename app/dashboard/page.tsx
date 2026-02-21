"use client";

import { useEffect, useState } from "react";
import { getDashboardStats, getLogs, type V1LogEntry } from "@/lib/storage/v1LogStore";

export default function DashboardPage() {
  const [logs, setLogs] = useState<V1LogEntry[]>([]);

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  const stats = getDashboardStats(logs);

  const Tile = ({ title, value }: { title: string; value: string }) => (
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

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Starter Pack metrics.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setLogs(getLogs())}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.03)",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
        <Tile title="Total Entries" value={String(stats.total)} />
        <Tile title="Most Common Fracture" value={stats.mostCommonFracture ?? "—"} />
        <Tile title="Last Redirect Used" value={stats.lastRedirectUsed ?? "—"} />
      </div>
    </main>
  );
}