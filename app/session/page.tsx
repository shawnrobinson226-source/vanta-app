"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { analyzeTrigger } from "@/lib/kernel/v1/analyze";
import { createEntry } from "./actions";

type MirrorStep =
  | "signal"
  | "pause"
  | "emotion"
  | "thought"
  | "insight"
  | "analyze"
  | "save";

const EMOTIONS = [
  "Anger",
  "Fear",
  "Shame",
  "Frustration",
  "Anxiety",
  "Pressure",
  "Sadness",
  "Other",
] as const;

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
      <div style={{ marginTop: 10 }}>{children}</div>
    </section>
  );
}

function InfoTile({
  title,
  body,
  subtle,
}: {
  title: string;
  body: string;
  subtle?: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
      <div
        style={{
          marginTop: 6,
          fontWeight: 700,
          lineHeight: 1.45,
          wordBreak: "break-word",
        }}
      >
        {body}
      </div>
      {subtle ? (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.72, lineHeight: 1.45 }}>
          {subtle}
        </div>
      ) : null}
    </div>
  );
}

function translateFeeling(label: string) {
  switch (label) {
    case "Uncertainty Intolerance":
      return "You may be feeling pressure from not knowing what comes next.";
    case "Control Loss":
      return "You may be feeling unsettled because things feel out of your hands.";
    case "Rejection Sensitivity":
      return "You may be feeling hurt, dismissed, or emotionally exposed.";
    case "Status Threat":
      return "You may be feeling challenged, disrespected, or put on the spot.";
    case "Self-Worth Dependency":
      return "You may be tying your value too closely to the outcome of this moment.";
    case "Boundary Violation":
      return "You may be feeling tension because something crossed your limit.";
    case "Comparison Spiral":
      return "You may be losing steadiness by measuring yourself against someone else.";
    case "Over-Responsibility":
      return "You may be carrying more than is actually yours to carry.";
    case "Avoidance Loop":
      return "You may be feeling pressure that is turning into delay or avoidance.";
    case "Shame Spike":
      return "You may be feeling self-attack or harsh judgment toward yourself.";
    default:
      return "You may be feeling internal pressure or instability in this moment.";
  }
}

function translateWhy(description: string, reframe: string) {
  return `${description} ${reframe}`.trim();
}

function translateNextMove(label: string) {
  switch (label) {
    case "20-Minute Action Block":
      return "Use a short focused block to reduce pressure and regain movement.";
    case "Set One Boundary":
      return "Stabilize the situation by making one limit clear.";
    case "Clarify Directly":
      return "Reduce confusion by getting one clear answer.";
    case "Name Next Action":
      return "Lower overwhelm by defining one specific next move.";
    default:
      return "Take one stabilizing action now.";
  }
}

export default function SessionPage() {
  const [step, setStep] = useState<MirrorStep>("signal");
  const [activated, setActivated] = useState<boolean | null>(null);

  const [pauseSeconds, setPauseSeconds] = useState(60);
  const [pauseRunning, setPauseRunning] = useState(false);

  const [emotion, setEmotion] = useState<(typeof EMOTIONS)[number] | "">("");
  const [thought, setThought] = useState("");
  const [insight, setInsight] = useState("");
  const [trigger, setTrigger] = useState("");

  const [submittedTrigger, setSubmittedTrigger] = useState<string | null>(null);

  const [isSaving, startSave] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [reflection, setReflection] = useState<"yes" | "slightly" | "no" | "">("");

  useEffect(() => {
    setSaveMsg(null);
  }, [emotion, thought, insight, trigger]);

  useEffect(() => {
    if (!pauseRunning) return;
    if (pauseSeconds <= 0) {
      setPauseRunning(false);
      setStep("emotion");
      return;
    }

    const timer = setTimeout(() => {
      setPauseSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [pauseRunning, pauseSeconds]);

  const composedTrigger = useMemo(() => {
    const parts: string[] = [];
    if (emotion) parts.push(`Emotion: ${emotion}.`);
    if (thought.trim()) parts.push(`Thought: ${thought.trim()}`);
    if (insight.trim()) parts.push(`Insight: ${insight.trim()}`);
    if (trigger.trim()) parts.push(`Event: ${trigger.trim()}`);
    return parts.join(" ");
  }, [emotion, thought, insight, trigger]);

  const result = useMemo(() => {
    if (!submittedTrigger) return null;
    const t = submittedTrigger.trim();
    if (!t) return null;
    return analyzeTrigger(t);
  }, [submittedTrigger]);

  const canGoNextFromEmotion = emotion !== "";
  const canGoNextFromThought = thought.trim().length >= 3;
  const canGoNextFromInsight = insight.trim().length >= 3;
  const canAnalyze = composedTrigger.trim().length >= 3 && !isAnalyzing && !isSaving;
  const canSave = Boolean(result) && !isAnalyzing && !isSaving;

  function resetAll() {
    setStep("signal");
    setActivated(null);
    setPauseSeconds(60);
    setPauseRunning(false);
    setEmotion("");
    setThought("");
    setInsight("");
    setTrigger("");
    setSubmittedTrigger(null);
    setSaveMsg(null);
    setReflection("");
  }

  async function handleAnalyze() {
    if (!canAnalyze) return;

    setSaveMsg(null);
    setIsAnalyzing(true);

    try {
      setSubmittedTrigger(composedTrigger);
      queueMicrotask(() => setIsAnalyzing(false));
      setStep("save");
    } catch {
      setIsAnalyzing(false);
      setSaveMsg("Analyze failed.");
    }
  }

  function handleSave() {
    if (!canSave || !result) return;

    setSaveMsg(null);

    startSave(async () => {
      try {
        await createEntry({
          trigger: composedTrigger.trim(),
          analysis: result,
        });
        setSaveMsg("Session recorded.");
      } catch (e: any) {
        setSaveMsg(e?.message ?? "Save failed.");
      }
    });
  }

  const stepTitle: Record<MirrorStep, string> = {
    signal: "Signal",
    pause: "Pause",
    emotion: "Emotion",
    thought: "Thought",
    insight: "Understanding",
    analyze: "Analyze",
    save: "Guidance",
  };

  const buttonStyle = (enabled: boolean): CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: enabled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
    color: "inherit",
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.7,
  });

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "baseline",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>Session</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>
            One step at a time. VANTA helps you understand the moment and choose a steady next move.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Step: <b>{stepTitle[step]}</b>
          </div>
          <button
            type="button"
            onClick={resetAll}
            disabled={isSaving || isAnalyzing}
            style={buttonStyle(!(isSaving || isAnalyzing))}
          >
            Reset
          </button>
        </div>
      </div>

      {saveMsg ? (
        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.95 }}>{saveMsg}</div>
      ) : null}

      {step === "signal" ? (
        <Card title="What just shifted?">
          <div style={{ opacity: 0.9, lineHeight: 1.5 }}>
            Are you experiencing internal noise, pressure, or the urge to react quickly?
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setActivated(true);
                setStep("pause");
              }}
              style={buttonStyle(true)}
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() => {
                setActivated(false);
                setStep("thought");
              }}
              style={buttonStyle(true)}
            >
              No (log anyway)
            </button>
          </div>
        </Card>
      ) : null}

      {step === "pause" ? (
        <Card title="Pause first">
          <div style={{ opacity: 0.9 }}>Do not react yet. Slow the moment down.</div>

          <div style={{ marginTop: 14, fontSize: 32, letterSpacing: 1 }}>
            {Math.floor(pauseSeconds / 60)}:{String(pauseSeconds % 60).padStart(2, "0")}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setPauseRunning((r) => !r)}
              disabled={isSaving || isAnalyzing}
              style={buttonStyle(!(isSaving || isAnalyzing))}
            >
              {pauseRunning ? "Pause Timer" : "Start Timer"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPauseRunning(false);
                setStep("emotion");
              }}
              style={buttonStyle(true)}
            >
              Skip
            </button>

            <button
              type="button"
              onClick={() => setPauseSeconds(90)}
              disabled={pauseRunning}
              style={buttonStyle(!pauseRunning)}
            >
              Set 90s
            </button>

            <button
              type="button"
              onClick={() => setPauseSeconds(60)}
              disabled={pauseRunning}
              style={buttonStyle(!pauseRunning)}
            >
              Set 60s
            </button>
          </div>
        </Card>
      ) : null}

      {step === "emotion" ? (
        <Card title="What are you feeling?">
          <div style={{ opacity: 0.9 }}>
            Choose the strongest feeling under the reaction.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            {EMOTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmotion(e)}
                style={{
                  ...buttonStyle(true),
                  background:
                    emotion === e
                      ? "rgba(255,255,255,0.14)"
                      : "rgba(255,255,255,0.06)",
                }}
              >
                {e}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setStep("thought")}
              disabled={!canGoNextFromEmotion}
              style={buttonStyle(canGoNextFromEmotion)}
            >
              Next
            </button>
          </div>
        </Card>
      ) : null}

      {step === "thought" ? (
        <Card title="What story is forming?">
          <div style={{ opacity: 0.9 }}>
            Write one short sentence about what your mind is telling you.
          </div>

          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            rows={3}
            placeholder="One short sentence."
            disabled={isSaving || isAnalyzing}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.03)",
              color: "inherit",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setStep("emotion")} style={buttonStyle(true)}>
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("insight")}
              disabled={!canGoNextFromThought}
              style={buttonStyle(canGoNextFromThought)}
            >
              Next
            </button>
          </div>
        </Card>
      ) : null}

      {step === "insight" ? (
        <Card title="What matters most here?">
          <div style={{ opacity: 0.9 }}>
            What is the message or truth inside this moment?
          </div>

          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            rows={3}
            placeholder="One short sentence."
            disabled={isSaving || isAnalyzing}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.03)",
              color: "inherit",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setStep("thought")} style={buttonStyle(true)}>
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("analyze")}
              disabled={!canGoNextFromInsight}
              style={buttonStyle(canGoNextFromInsight)}
            >
              Next
            </button>
          </div>
        </Card>
      ) : null}

      {step === "analyze" ? (
        <Card title="What happened?">
          <div style={{ opacity: 0.9 }}>
            Describe the event in plain language. Keep it short and concrete.
          </div>

          <textarea
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            rows={4}
            placeholder="What happened?"
            disabled={isSaving || isAnalyzing}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.03)",
              color: "inherit",
            }}
          />

          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Session summary</div>
            <div style={{ marginTop: 6, lineHeight: 1.5, opacity: 0.95 }}>
              {composedTrigger.trim() ? composedTrigger : "(empty)"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setStep("insight")} style={buttonStyle(true)}>
              Back
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              style={buttonStyle(canAnalyze)}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </Card>
      ) : null}

      {step === "save" ? (
        <>
          <Card title="VANTA guidance">
            <div style={{ marginBottom: 12, opacity: 0.82 }}>
              VANTA detected a likely mental pattern in this situation.
            </div>

            {result ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                }}
              >
                <InfoTile
                  title="What you're feeling"
                  body={translateFeeling(result.fracture.label)}
                  subtle={result.fracture.label}
                />

                <InfoTile
                  title="Why it's happening"
                  body={translateWhy(result.fracture.description, result.reframe)}
                />

                <InfoTile
                  title="What to do next"
                  body={translateNextMove(result.redirect.label)}
                  subtle={result.redirect.label}
                />

                <InfoTile
                  title="Small action to start"
                  body={result.redirect.steps[0] ?? "Take one stabilizing action."}
                  subtle="Start with only one step."
                />

                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Progress reflection</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    Check back in after a few minutes.
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {[
                      { id: "yes", label: "Yes" },
                      { id: "slightly", label: "Slightly" },
                      { id: "no", label: "No" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setReflection(item.id as "yes" | "slightly" | "no")}
                        style={{
                          ...buttonStyle(true),
                          background:
                            reflection === item.id
                              ? "rgba(255,255,255,0.14)"
                              : "rgba(255,255,255,0.06)",
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.72 }}>
                    Do you feel more steady after the first step?
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.8 }}>No result yet.</div>
            )}
          </Card>

          <Card title="Session record">
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.02)",
                lineHeight: 1.55,
                opacity: 0.95,
              }}
            >
              {composedTrigger.trim() ? composedTrigger : "(empty)"}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setStep("analyze")} style={buttonStyle(true)}>
                Back
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                style={buttonStyle(canSave)}
              >
                {isSaving ? "Saving..." : "Save Session"}
              </button>
              <button
                type="button"
                onClick={resetAll}
                disabled={isSaving}
                style={buttonStyle(!isSaving)}
              >
                New Session
              </button>
            </div>
          </Card>
        </>
      ) : null}
    </main>
  );
}