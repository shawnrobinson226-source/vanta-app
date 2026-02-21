"use client";

import { useMemo, useState } from "react";
import { analyzeTrigger } from "@/lib/kernel/v1/analyze";
import { addLog } from "@/lib/storage/v1LogStore";

export default function SessionPage() {
  const [trigger, setTrigger] = useState("");
  const [submittedTrigger, setSubmittedTrigger] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!submittedTrigger) return null;
    const t = submittedTrigger.trim();
    if (!t) return null;
    return analyzeTrigger(t);
  }, [submittedTrigger]);

  const canAnalyze = trigger.trim().length > 0;
  const canSave = !!result;

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ marginBottom: 8 }}>Session</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Enter a trigger. Get a likely fracture, reframe, and one redirect.
      </p>

      <label style={{ display: "block", marginTop: 16, marginBottom: 8 }}>
        Trigger
      </label>

      <textarea
        value={trigger}
        onChange={(e) => setTrigger(e.target.value)}
        rows={6}
        placeholder="Describe what happened and what you felt."
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.03)",
          color: "inherit",
        }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setSubmittedTrigger(trigger)}
          disabled={!canAnalyze}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: canAnalyze ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
            color: "inherit",
            cursor: canAnalyze ? "pointer" : "not-allowed",
          }}
        >
          Analyze
        </button>

        <button
          type="button"
          onClick={() => {
            setTrigger("");
            setSubmittedTrigger(null);
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.03)",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Clear
        </button>

        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            if (!result) return;

            const finalTrigger = (submittedTrigger ?? trigger).trim();
            if (!finalTrigger) return;

            addLog({
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              trigger: finalTrigger,
              fractureLabel: result.fracture.label,
              reframe: result.reframe,
              redirectLabel: result.redirect.label,
              redirectSteps: result.redirect.steps,
            });

            alert("Saved to logs.");
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: canSave ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
            color: "inherit",
            cursor: canSave ? "pointer" : "not-allowed",
          }}
        >
          Save to Logs
        </button>
      </div>

      {result && (
        <section
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Result</h2>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Likely Fracture</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {result.fracture.label}
            </div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              {result.fracture.description}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Reframe</div>
            <div style={{ marginTop: 6, lineHeight: 1.5 }}>
              {result.reframe}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Redirect</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>
              {result.redirect.label}
            </div>
            <ol style={{ marginTop: 8 }}>
              {result.redirect.steps.map((s, i) => (
                <li key={i} style={{ marginBottom: 6, lineHeight: 1.5 }}>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </main>
  );
}