"use client";

import { useEffect, useState } from "react";
import { clearLogs, getLogs, type V1LogEntry } from "@/lib/storage/v1LogStore";

export default function LogsPage() {
  const [logs, setLogs] = useState<V1LogEntry[]>([]);

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Logs</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Last {Math.min(20, logs.length)} entries.</p>

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

        <button
          type="button"
          onClick={() => {
            clearLogs();
            setLogs([]);
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.03)",
            background: "rgba(255,255,255,0.02)",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Clear Logs
        </button>
      </div>

      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.8 }}>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>Date</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>Fracture</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>Redirect</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>Trigger</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 20).map((l) => (
              <tr key={l.id}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>
                  {new Date(l.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{l.fractureLabel}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{l.redirectLabel}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{l.trigger}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 12, opacity: 0.7 }}>
                  No logs yet. Run a session and click “Save to Logs.”
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}