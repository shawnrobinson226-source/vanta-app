"use client";

import { useState, useTransition } from "react";
import { analyzeTrigger } from "@/lib/kernel/v1/analyze";
import { submitSessionForm } from "./actions";

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
      <h1 className="text-2xl text-white">Session</h1>

      <form action={submitSessionForm} className="space-y-6">
        <input type="hidden" name="operator_id" value="op_legacy" />

        {/* TRIGGER */}
        <textarea
          name="trigger"
          required
          placeholder="What happened?"
          onBlur={(e) => handleAnalyze(e.target.value)}
          className="w-full border p-3 bg-black text-white"
        />

        {/* PREVIEW */}
        {preview && (
          <div className="border p-4 bg-zinc-900 text-white space-y-3">
            <div>
              <strong>Fracture:</strong> {preview.fracture}
            </div>

            <div>
              <strong>Reframe:</strong> {preview.reframe}
            </div>

            <div>
              <strong>Suggested Action:</strong>
              <ul className="list-disc ml-5">
                {Array.isArray(preview.redirect)
                  ? preview.redirect.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))
                  : Array.isArray(preview.redirect?.steps)
                  ? preview.redirect.steps.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))
                  : null}
              </ul>
            </div>
          </div>
        )}

        {/* DISTORTION */}
        <select name="distortion_class" required className="w-full p-2 bg-black text-white">
          <option value="">Select distortion</option>
          <option value="narrative">Narrative</option>
          <option value="emotional">Emotional</option>
          <option value="behavioral">Behavioral</option>
          <option value="perceptual">Perceptual</option>
          <option value="continuity">Continuity</option>
        </select>

        {/* ACTION */}
        <textarea
          name="next_action"
          required
          placeholder="Next action"
          className="w-full border p-3 bg-black text-white"
        />

        {/* OUTCOME */}
        <select name="outcome" required className="w-full p-2 bg-black text-white">
          <option value="">Select outcome</option>
          <option value="reduced">Reduced</option>
          <option value="unresolved">Unresolved</option>
          <option value="escalated">Escalated</option>
        </select>

        <input type="number" name="clarity_0_10" min="0" max="10" required className="w-full p-2 bg-black text-white" />
        <input type="number" name="steps_completed" min="0" max="9" required className="w-full p-2 bg-black text-white" />

        <button type="submit" className="bg-white text-black px-4 py-2">
          Save
        </button>
      </form>
    </main>
  );
}