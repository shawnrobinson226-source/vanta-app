import { submitSessionForm } from "./actions";

const distortionOptions = [
  {
    value: "narrative",
    label: "Narrative",
    hint: "False internal story or meaning layer.",
  },
  {
    value: "emotional",
    label: "Emotional",
    hint: "Disproportionate emotional reaction or overload.",
  },
  {
    value: "behavioral",
    label: "Behavioral",
    hint: "Action drift, avoidance, or contradiction in behavior.",
  },
  {
    value: "perceptual",
    label: "Perceptual",
    hint: "Misreading reality, context, or signal.",
  },
  {
    value: "continuity",
    label: "Continuity",
    hint: "Identity drift between values, intention, and action.",
  },
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

type SessionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SessionPage({ searchParams }: SessionPageProps) {
  const params = (await searchParams) ?? {};
  const saved = params.saved === "1";

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
          Input the trigger, classify the distortion, define the reduction path,
          commit the next aligned action, and write the result to the event
          ledger.
        </p>

        {saved ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Session saved. Continuity updated. Dashboard refreshed.
          </div>
        ) : null}
      </header>

      <form action={submitSessionForm} className="space-y-8">
        <input type="hidden" name="operator_id" value="op_legacy" />

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-zinc-100">1. Trigger Input</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Describe the live event, pressure, or moment of distortion.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-200">Trigger</span>
            <textarea
              name="trigger"
              required
              rows={5}
              placeholder="What happened? What pressure, conflict, or disruption triggered the distortion?"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-zinc-100">2. Distortion Classification</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Select one locked class only. No custom taxonomy.
            </p>
          </div>

          <fieldset className="grid gap-3 md:grid-cols-2">
            {distortionOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="distortion_class"
                    value={option.value}
                    required
                    className="h-4 w-4 border-zinc-700 bg-zinc-950 text-zinc-100"
                  />
                  <span className="text-sm font-medium text-zinc-100">
                    {option.label}
                  </span>
                </span>
                <span className="mt-2 pl-7 text-sm text-zinc-400">
                  {option.hint}
                </span>
              </label>
            ))}
          </fieldset>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-zinc-100">3. Fracture Mapping</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Trace origin and map the distortion across thought, emotion, and behavior.
            </p>
          </div>

          <div className="grid gap-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-200">Origin Trace</span>
              <textarea
                name="origin"
                required
                rows={3}
                placeholder="What belief, memory, assumption, or script is feeding this?"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-200">Thought</span>
                <textarea
                  name="thought"
                  required
                  rows={4}
                  placeholder="What is the thought pattern?"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-200">Emotion</span>
                <textarea
                  name="emotion"
                  required
                  rows={4}
                  placeholder="What is the emotional state?"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-200">Behavior</span>
                <textarea
                  name="behavior"
                  required
                  rows={4}
                  placeholder="What action or avoidance pattern shows up?"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-zinc-100">4. Reduction Protocol</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Select the primary corrective tool and commit the next aligned action.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-200">Protocol</span>
              <select
                name="protocol"
                required
                defaultValue=""
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
              >
                <option value="" disabled>
                  Select protocol
                </option>
                {protocolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-200">Outcome</span>
              <select
                name="outcome"
                required
                defaultValue="reduced"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
              >
                {outcomeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-zinc-200">Next Aligned Action</span>
            <textarea
              name="next_action"
              required
              rows={3}
              placeholder="What is the next concrete action that restores alignment?"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
            />
          </label>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-zinc-200">Clarity Rating (0–10)</span>
            <input
              type="number"
              name="clarity_rating"
              min={0}
              max={10}
              step={1}
              defaultValue={5}
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
            />
          </label>
        </section>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-100">Commit Session</p>
            <p className="text-sm text-zinc-400">
              This writes the session, updates continuity, and appends ledger events.
            </p>
          </div>

          <button
            type="submit"
            className="rounded-xl border border-zinc-700 bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Save Session
          </button>
        </div>
      </form>
    </main>
  );
}