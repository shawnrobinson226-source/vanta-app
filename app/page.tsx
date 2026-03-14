import Link from "next/link";
import { getDashboardStats } from "@/app/session/actions";
import StateCheckPanel from "@/components/vanta/StateCheckPanel";

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

function Definition({
  term,
  desc,
}: {
  term: string;
  desc: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <div style={{ fontWeight: 800 }}>{term}</div>
        <div style={{ opacity: 0.8, fontSize: 13 }}>{desc}</div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const stats = await getDashboardStats();
  const strength = Math.min(1, (stats.total ?? 0) / 20);

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>VANTA</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>
            A calm clarity tool for understanding what you're feeling, why it's happening, and what to do next.
          </p>
        </div>
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
        <Tile
          title="Most Common Pattern"
          value={stats.mostCommonFracture ?? "—"}
        />
        <Tile
          title="Last Suggested Move"
          value={stats.lastRedirectUsed ?? "—"}
        />
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

        <Link
          href="/dashboard"
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
          Dashboard
        </Link>

        <Link
          href="/settings"
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
          Settings
        </Link>
      </div>

      <StateCheckPanel />


      <section style={{ marginTop: 18 }}>
        <h2 style={{ margin: "18px 0 10px" }}>Start here</h2>
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ opacity: 0.92, lineHeight: 1.55 }}>
            VANTA helps you notice what is happening inside you, understand why it is happening,
            and choose a steady next move before reacting.
          </div>

          <ol style={{ marginTop: 12, paddingLeft: 18, opacity: 0.9, lineHeight: 1.5 }}>
            <li><b>Check your baseline</b></li>
            <li><b>Open Session</b> when something shifts</li>
            <li><b>Follow the guidance</b> and save the moment</li>
          </ol>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            You stay in control. VANTA gives structure, not judgment.
          </div>
        </div>
      </section>
      <section style={{ marginTop: 18 }}>
        <h2 style={{ margin: "18px 0 10px" }}>How VANTA helps</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <Definition
            term="What you're feeling"
            desc="The system helps you quickly notice your current internal state."
          />
          <Definition
            term="Why it's happening"
            desc="VANTA offers a simple explanation for the likely pattern under the moment."
          />
          <Definition
            term="What to do next"
            desc="You get one clear stabilizing move instead of more mental noise."
          />
          <Definition
            term="Small action to start"
            desc="The first step is kept short so you can move without overwhelm."
          />
          <Definition
            term="Progress reflection"
            desc="You check whether the step helped, so awareness becomes usable."
          />
          <Definition
            term="Operator"
            desc="You remain the authority. VANTA guides; it does not command."
          />
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ margin: "18px 0 10px" }}>How to use it in under 2 minutes</h2>
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <ol style={{ margin: 0, paddingLeft: 18, opacity: 0.9, lineHeight: 1.5 }}>
            <li>Record a quick baseline check.</li>
            <li>Open <b>Session</b> when something shifts.</li>
            <li>Describe what happened.</li>
            <li>Read the guidance: what you're feeling, why it's happening, and what to do next.</li>
            <li>Take the first small action and save the session.</li>
          </ol>
          <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
            The goal is not perfection. The goal is to reduce distortion before behavior compounds.
          </div>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ margin: "18px 0 10px" }}>V1 rules</h2>
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9, lineHeight: 1.5 }}>
            <li><b>Deterministic engine.</b> Same input leads to the same result.</li>
            <li><b>Plain language.</b> The interface stays simple under pressure.</li>
            <li><b>Minimal feature set.</b> State Check + Session + Logs + Dashboard + Settings.</li>
            <li><b>Operator sovereignty.</b> You decide what's true; VANTA provides structure.</li>
          </ul>
          <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
            V1 is about stability, clarity, and repeatable use.
          </div>
        </div>
      </section>

      <div style={{ marginTop: 16, opacity: 0.7, fontSize: 12 }}>
        Calm interface. Deterministic engine. No extra complexity in V1.
      </div>
    </main>
  );
}