"use client";

import { useEffect, useState } from "react";
import { clearLogs, getLogs } from "@/lib/storage/v1LogStore";

export default function SettingsPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getLogs().length);
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ marginBottom: 8 }}>Settings</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Starter Pack only. No configuration in v1.
      </p>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.7 }}>Local Logs</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>
          {count} saved entries
        </div>

        <button
          type="button"
          onClick={() => {
            clearLogs();
            setCount(0);
            alert("Logs cleared.");
          }}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.03)",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Clear Logs
        </button>
      </div>
    </main>
  );
}