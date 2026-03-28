"use client";

import { useState, useTransition } from "react";
import { analyzeTrigger } from "@/lib/kernel/v1/analyze";
import { submitSessionForm } from "./actions";

const distortionOptions = [
  { value: "narrative", label: "Narrative", hint: "False internal story or meaning layer." },
  { value: "emotional", label: "Emotional", hint: "Disproportionate emotional reaction or overload." },
  { value: "behavioral", label: "Behavioral", hint: "Action drift, avoidance, or contradiction in behavior." },
  { value: "perceptual", label: "Perceptual", hint: "Misreading reality, context, or signal." },
  { value: "continuity", label: "Continuity", hint: "Identity drift between values, intention, and action." },
] as const;

const protocolOptions = [
  { value: "factual_rewrite", label: "Factual Rewrite" },
  { value: "aligned_action", label: "Aligned Action" },
  { value: "corrective_reflection", label: "Corrective Reflection" },
  { value: "containment_practice", label: "Containment Practice" },
] as const;

const outcomeOptions = [
  { value: "reduced", label: "Reduced" },
  { value: "unresolved", label: "Unresolved" },
  { value: "escalated", label: "Escalated" },
] as const;

export default function SessionPage() {
  const [preview, setPreview] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  function handleAnalyze(trigger: string) {
    if (!trigger.trim()) return;

    startTransition(() => {
      const analysis = analyzeTrigger(trigger);
      setPreview(analysis);
    });
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          VANTA / Session Engine
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Deterministic Distortion Reduction Session
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-zinc-400">
          Input the trigger. VANTA will analyze the distortion in real time,
          then you commit the structured correction.
        </p>
      </header>

      <form action={submitSessionForm} className="space-y-8">
        <input type="hidden" name="operator_id" value="op_legacy" />

        {/* TRIGGER */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-2">1. Trigger Input</h2>

          <textarea
            name="trigger"
            required
            rows={5}
            placeholder="What happened?"
            onBlur={(e) => handleAnalyze(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-600"
          />
        </section>

        {/* LIVE ANALYSIS */}
        {preview && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              Live Analysis
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500">Pattern</p>
                <p className="text-sm text-zinc-200">{preview.fracture}</p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Interpretation</p>
                <p className="text-sm text-zinc-200">{preview.reframe}</p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Suggested Action</p>
                <ul className="text-sm text-zinc-200 list-disc ml-5">
                  {preview.redirect.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* DISTORTION */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">
            2. Distortion Classification
          </h2>

          <fieldset className="grid gap-3 md:grid-cols-2">
            {distortionOptions.map((option) => (
              <label
                key={option.value}
                className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="distortion_class"
                    value={option.value}
                    required
                  />
                  <span className="text-sm text-zinc-100">{option.label}</span>
                </span>
                <span className="mt-2 text-xs text-zinc-400">
                  {option.hint}
                </span>
              </label>
            ))}
          </fieldset>
        </section>

        {/* ACTION */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">
            3. Next Action
          </h2>

          <textarea
            name="next_action"
            required
            rows={3}
            placeholder="What is the next aligned action?"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100"
          />
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Save Session
          </button>
        </div>
      </form>
    </main>
  );
}
