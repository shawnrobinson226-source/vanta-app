"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createStateCheck, getLatestStateCheck } from "@/app/session/actions";

type LatestStateCheck = {
  id: string;
  clarity: number;
  emotionalLoad: number;
  note: string | null;
  created_at: string;
} | null;

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function StateCheckPanel() {
  const [clarity, setClarity] = useState(7);
  const [emotionalLoad, setEmotionalLoad] = useState(4);
  const [note, setNote] = useState("");
  const [latest, setLatest] = useState<LatestStateCheck>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void (async () => {
      try {
        const data = await getLatestStateCheck();
        setLatest(data);
      } catch {
        // ignore quietly in V1
      }
    })();

    const dismissedAt = Number(localStorage.getItem("vanta_checkin_dismissed_at") || 0);
    const sixHours = 6 * 60 * 60 * 1000;
    const due = Date.now() - dismissedAt > sixHours;
    setShowReminder(due);
  }, []);

  function dismissReminder() {
    localStorage.setItem("vanta_checkin_dismissed_at", String(Date.now()));
    setShowReminder(false);
  }

  function saveCheck() {
    setMsg(null);

    startTransition(async () => {
      try {
        await createStateCheck({
          clarity,
          emotionalLoad,
          note,
        });

        const data = await getLatestStateCheck();
        setLatest(data);
        setNote("");
        setMsg("Baseline recorded.");
        dismissReminder();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "State check failed.");
      }
    });
  }

  return (
    <>
      {showReminder ? (
        <section
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16 }}>Check-In</h2>
          <div style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.5 }}>
            Any irritant detected? Any signal narrowing?
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
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

            <button
              type="button"
              onClick={dismissReminder}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.03)",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Not now
            </button>
          </div>
        </section>
      ) : null}

      <section
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>Baseline State Check</h2>
        <div style={{ marginTop: 10, opacity: 0.85 }}>
          Quick drift snapshot. Keep it simple.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 14,
          }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 13, opacity: 0.85 }}>Clarity (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={clarity}
              onChange={(e) => setClarity(Number(e.target.value))}
              disabled={isPending}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.03)",
                color: "inherit",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 13, opacity: 0.85 }}>Emotional Load (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={emotionalLoad}
              onChange={(e) => setEmotionalLoad(Number(e.target.value))}
              disabled={isPending}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.03)",
                color: "inherit",
              }}
            />
          </label>
        </div>

        <label style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>Optional note</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            placeholder="Anything relevant about your current state?"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.03)",
              color: "inherit",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={saveCheck}
            disabled={isPending}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "inherit",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Saving..." : "Record Baseline"}
          </button>

          {msg ? <div style={{ fontSize: 13, opacity: 0.9 }}>{msg}</div> : null}
        </div>

        {latest ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.02)",
              fontSize: 13,
              opacity: 0.9,
              lineHeight: 1.5,
            }}
          >
            <div><b>Latest:</b> {formatTime(latest.created_at)}</div>
            <div>Clarity: {latest.clarity} / 10</div>
            <div>Emotional Load: {latest.emotionalLoad} / 10</div>
            {latest.note ? <div>Note: {latest.note}</div> : null}
          </div>
        ) : null}
      </section>
    </>
  );
}